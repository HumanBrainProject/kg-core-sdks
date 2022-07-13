#  Copyright 2022 EBRAINS AISBL
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0.
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#
#  This open source software code was developed in part or in whole in the
#  Human Brain Project, funded from the European Union's Horizon 2020
#  Framework Programme for Research and Innovation under
#  Specific Grant Agreements No. 720270, No. 785907, and No. 945539
#  (Human Brain Project SGA1, SGA2 and SGA3).
#

import json
from typing import Optional

import requests
import re

from kg_core.request import ResponseConfiguration, ExtendedResponseConfiguration, Pagination
from jinja2 import Environment, PackageLoader, select_autoescape

class ClientGenerator(object):

    keyword_translations = {
        "global": "is_global",
        "from": "start",
        "async": "is_async",
        "type": "target_type",
        "id": "instance_id",
        "property": "property_name"
    }

    specs = ["0%20simple", "1%20advanced"]
    admin_spec = "2%20admin"
    target = "kg_core/kg.py"

    def __init__(self, kg_root:str, open_api_spec_subpath:str, id_namespace:str, default_client_id_for_device_flow:str):
        self.default_kg_root:str = kg_root
        self.spec_root:str = f"http{'s' if not kg_root.startswith('localhost') else ''}://{kg_root}/{open_api_spec_subpath}"
        self.id_namespace:str = id_namespace
        self.default_client_id_for_device_flow = default_client_id_for_device_flow

    def generate(self):
        env = Environment(
            loader=PackageLoader("generator"),
            autoescape=select_autoescape()
        )
        template = env.get_template("kg.py.j2")
        api_version = None

        all_specs = []
        all_schemas = {}
        for spec in self.specs:
            api_spec = requests.get(f"{self.spec_root}{spec}").json()
            paths = api_spec["paths"]
            schemas = api_spec["components"]["schemas"] if "components" in api_spec and "schemas" in api_spec["components"] else {}
            all_schemas.update(schemas)
            all_specs.append(paths)

        paths_by_categories = {}
        for spec in all_specs:
            for path, value in spec.items():
                for operation, definition in value.items():
                    categories = definition["tags"] if "tags" in definition and definition["tags"] else ["general"]
                    for c in categories:
                        normalized_category = re.sub("[^A-Za-z0-9]", "", c)
                        if normalized_category not in paths_by_categories:
                            paths_by_categories[normalized_category] = {}
                        paths = paths_by_categories[normalized_category]
                        if path not in paths:
                            paths[path] = {}
                        paths[path][operation] = definition

        admin_api_spec = requests.get(f"{self.spec_root}{self.admin_spec}").json()
        paths_by_categories["admin"] = admin_api_spec["paths"]

        methods_by_category = {}

        for category, paths in paths_by_categories.items():
            methods_by_category[category] = []
            for path, value in paths.items():
                tmp_api_version, tmp_relative_path = self._split_path(path)
                if api_version is None or tmp_api_version == api_version:
                    api_version = tmp_api_version
                    relative_path = tmp_relative_path
                else:
                    raise ValueError("Inconsistent api version")

                for operation, definition in value.items():
                    parameters = definition["parameters"] if "parameters" in definition else []
                    path_parameters = [p["name"] for p in parameters if p["in"] == "path"]
                    query_parameters = [{"name": p["name"], "param": self._to_snake_case(p["name"])} for p in parameters if p["in"] == "query"]

                    method_parameters = [self._translate_parameter(p) for p in parameters]
                    method_parameters.sort(key=self._sort_params)

                    method_param_names = [p["name"] for p in method_parameters]

                    self.consolidate_request_objects(ExtendedResponseConfiguration(), method_parameters, method_param_names, query_parameters)
                    self.consolidate_request_objects(ResponseConfiguration(), method_parameters, method_param_names, query_parameters)
                    self.consolidate_request_objects(Pagination(), method_parameters, method_param_names, query_parameters)

                    method_name = self._to_snake_case(definition["operationId"])
                    category_singular = category[:-1] if category.endswith("s") else category
                    method_name = re.sub(f"^{category_singular}_", "", method_name)
                    method_name = re.sub(f"^{category}_", "", method_name)
                    method_name = re.sub(f"_{category_singular}_", "_", method_name)
                    method_name = re.sub(f"_{category}_", "_", method_name)
                    method_name = re.sub(f"_{category}$", "", method_name)
                    method_name = re.sub(f"_{category_singular}$", "", method_name)

                    response_type = self._response_type(definition["responses"] if "responses" in definition else {})
                    generic_response_type = None
                    if response_type:
                        generics = re.findall(f"(?<=\[).*(?=])", response_type)
                        if len(generics) > 0:
                            generic_response_type = generics[0]

                    method = {"operation": operation, "has_payload": "requestBody" in definition and definition["requestBody"],
                              "path": {"name": self._translate_path(relative_path, path_parameters), "has_path_params": len(path_parameters) > 0}, "name": method_name,
                              "parameters": method_parameters, "query_parameters": query_parameters, "response_type": response_type, "generic_response_type": generic_response_type}
                    methods_by_category[category].append(method)
                    print(f"Operation: {operation}, Path: {relative_path}")
            # Todo sort by operationId
            for cat, methods in methods_by_category.items():
                methods.sort(key=lambda m: m['name'])
        with open(self.target, "w") as file:
            file.write(template.render(default_kg_root=self.default_kg_root, methods_by_category=sorted(methods_by_category.items()), api_version=api_version, id_namespace=self.id_namespace, default_client_id_for_device_flow=self.default_client_id_for_device_flow))
        print(json.dumps(paths_by_categories, indent=4))
        print(json.dumps(all_schemas, indent=4))

    def _to_snake_case(self, input: str) -> str:
        if input in self.keyword_translations:
            return self.keyword_translations[input]
        return re.sub(r'(?<!^)(?=[A-Z])', '_', input).lower()

    def _find_type(self, type, items, format, required: bool, default: str, enum) -> Optional[str]:
        result = None
        if type == "string":
            if format == "uuid":
                result = "UUID"
            elif enum:
                if len(enum) == 2 and "IN_PROGRESS" in enum and "RELEASED" in enum:
                    result = "Stage = Stage.RELEASED"  # We set the default of the stage to "RELEASED"
                elif len(enum) == 3 and "TOP_INSTANCE_ONLY" in enum and "CHILDREN_ONLY" in enum and "CHILDREN_ONLY_RESTRICTED" in enum:
                    result = "ReleaseTreeScope"
                else:
                    result = "str"
            else:
                result = "str"
        elif type == "boolean":
            result = "bool"
        elif type == "integer":
            result = "int"
        elif type == "object":
            result = "dict"
        elif type == "array":
            if items and "type" in items and items["type"] == "string":
                result = "List[str]"
            else:
                result = "list"
        if result:
            if default:
                result = f"{result} = {default}"
            elif not required:
                result = f"Optional[{result}] = None"
        return result

    def _translate_parameter(self, input: dict) -> dict:
        schema = input["schema"] if "schema" in input else {}
        type = schema["type"] if "type" in schema else None
        items = schema["items"] if "items" in schema else None
        format = schema["format"] if "format" in schema else None
        default = str(schema["default"]) if "default" in schema else None
        required = input["required"] if "required" in input else False
        enum = schema["enum"] if "enum" in schema else None
        return {
            "name": self._to_snake_case(input["name"]),
            "type": self._find_type(type, items, format, required, default, enum)
        }

    def _translate_path(self, input: str, path_params: list) -> str:
        result = input
        for p in path_params:
            result = result.replace(f"{{{p}}}", f"{{{self._to_snake_case(p)}}}")
        return result

    def _split_path(self, path):
        splitted_path = path.split("/")
        api_version = splitted_path[1]
        relative_path = "/".join(splitted_path[2:])
        return api_version, relative_path

    def _sort_params(self, input):
        type = input["type"] if "type" in input else None
        if type and "=" in type:
            sort = 2
        elif type and "Optional[" in type:
            sort = 1
        else:
            sort = 0
        return f"{sort} {input['name']}"

    def _response_type(self, responses):
        response_reference = None
        is_list = False
        if "200" in responses and responses["200"]:
            if "content" in responses["200"] and responses["200"]["content"]:
                content = None
                if "*/*" in responses["200"]["content"] and responses["200"]["content"]["*/*"]:
                    content = responses["200"]["content"]["*/*"]
                elif "application/json" in responses["200"]["content"] and responses["200"]["content"]["application/json"]:
                    content = responses["200"]["content"]["application/json"]
                if content:
                    if "schema" in content and content["schema"]:
                        schema = content["schema"]
                        if "type" in schema and "items" in schema and schema["type"] == "array":
                            is_list = True
                            schema = schema["items"]
                        if "$ref" in schema and schema:
                            response_reference = schema["$ref"]
        if response_reference:
            if response_reference == "#/components/schemas/ResultNormalizedJsonLd":
                return "Result[Instance]"
            elif response_reference == "#/components/schemas/ResultMapStringResultNormalizedJsonLd":
                return "ResultsById[Instance]"
            elif response_reference == "#/components/schemas/PaginatedResultNormalizedJsonLd":
                return "ResultPage[Instance]"
            elif response_reference == "#/components/schemas/PaginatedStreamResultJsonLdDoc":
                return "ResultPage[JsonLdDocument]"
            elif response_reference == "#/components/schemas/ResultReleaseStatus":
                return "Result[ReleaseStatus]"
            elif response_reference == "#/components/schemas/ResultMapUUIDResultReleaseStatus":
                return "ResultsById[ReleaseStatus]"
            elif response_reference == "#/components/schemas/ResultUser":
                return "Result[User]"
            elif response_reference == "#/components/schemas/ResultUserWithRoles":
                return "Result[UserWithRoles]"
            elif response_reference == "#/components/schemas/ResultScopeElement":
                return "Result[Scope]"
            elif response_reference == "#/components/schemas/ResultJsonLdDoc":
                return "Result[JsonLdDocument]"
            elif response_reference == "#/components/schemas/ResultSpaceInformation":
                return "Result[SpaceInformation]"
            elif response_reference == "#/components/schemas/PaginatedResultSpaceInformation":
                return "ResultPage[SpaceInformation]"
            elif response_reference == "#/components/schemas/PaginatedResultTypeInformation":
                return "ResultPage[TypeInformation]"
            elif response_reference == "#/components/schemas/ResultMapStringResultTypeInformation":
                return "ResultsById[TypeInformation]"
            elif response_reference == "#/components/schemas/TermsOfUseResult":
                return "Optional[TermsOfUse]"
            # elif response_reference == "#/components/schemas/JsonLdDoc":
            #     return "ListOfJsonLdDocuments" if is_list else "JsonLdDocument"
        return None

    def consolidate_request_objects(self, request_object, method_parameters, method_param_names, query_parameters):
        all_params = True
        request_object_name = request_object.__class__.__name__
        request_object_name_snake = self._to_snake_case(request_object_name)
        for r in request_object.__dict__.keys():
            if r not in method_param_names:
                all_params = False
                break
            for p in method_parameters:
                # If it's already part of another request_object, we skip it.
                if p["name"] == r and "replace" in p:
                    all_params = False
                    break
        if all_params:
            for r in request_object.__dict__.keys():
                for p in method_parameters:
                    if p["name"] == r and "replace" not in p:
                        p["replace"] = self._to_snake_case(request_object_name_snake)
                for p in query_parameters:
                    if p["param"] == r and "replace" not in p:
                        p["replace"] = self._to_snake_case(request_object_name_snake)
            method_parameters.append({"name": request_object_name_snake, "type": f"{request_object_name} = {request_object_name}()"})


if __name__ == "__main__":
    localhost = ClientGenerator("localhost:8000", "v3/api-docs/", "https://kg.ebrains.eu/api/instances/", "kg-core-python")
    prod = ClientGenerator("core.kg.ebrains.eu", "v3/api-docs/", "https://kg.ebrains.eu/api/instances/", "kg-core-python")

    localhost.generate()
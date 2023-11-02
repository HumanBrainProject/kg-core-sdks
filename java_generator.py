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
import os.path
from typing import Any, Dict, List, Optional

import requests
import re
from generator.generator import ClientGenerator

from kg_core.request import ResponseConfiguration, ExtendedResponseConfiguration, Pagination
from jinja2 import Environment, PackageLoader, select_autoescape

APPLICATION_JSON = "application/json"

default_values = {
    "from": 0,
    "size": 50,
    "returnTotalResults": True
}

class JavaClientGenerator(ClientGenerator):


    def __init__(self, kg_root:str, open_api_spec_subpath:str, id_namespace:str, default_client_id_for_device_flow:str):
        super(JavaClientGenerator, self).__init__(kg_root, open_api_spec_subpath, id_namespace)
        self.default_client_id_for_device_flow = default_client_id_for_device_flow

    def generate(self, api_version:str) -> None:
        env = Environment(
            loader=PackageLoader("generator"),
            autoescape=select_autoescape()
        )
        template = env.get_template("kg.java.j2")
        target = f"kgCoreJava/src/main/java/eu/ebrains/kg/sdk/KG.java"
        api_spec = requests.get(f"{self.spec_root}/{api_version}").json()
        paths = api_spec["paths"]
        client_paths = {}
        admin_paths = {}
        for path, v in paths.items():
            for operation, definition in v.items():
                if "tags" in definition and definition["tags"] and "3 Admin" in definition["tags"]:
                    if path not in admin_paths:
                        admin_paths[path] = {}
                    admin_paths[path][operation] = definition
                else:
                    if path not in client_paths:
                        client_paths[path] = {}
                    client_paths[path][operation] = definition

        all_schemas: Dict[str, Dict[Any, Any]] = api_spec["components"]["schemas"] if "components" in api_spec and "schemas" in api_spec["components"] else {}
        paths_by_categories: Dict[str, Dict[str, Any]] = {}
        paths_by_categories["admin"] = admin_paths
        for path, value in client_paths.items():
            tmp_api_version, relative_path = self._split_path(path)
            root_path = relative_path.split("/")[0]
            category = re.findall('[a-z]*',root_path)[0]
            for operation, definition in value.items():
                if category not in paths_by_categories:
                    paths_by_categories[category] = {}
                paths = paths_by_categories[category]
                if path not in paths:
                    paths[path] = {}
                paths[path][operation] = definition
        methods_by_category: Dict[str, List[Dict[str, Any]]] = {}

        for category, paths in paths_by_categories.items():
            methods_by_category[category] = []
            for path, value in paths.items():
                tmp_api_version, relative_path = self._split_path(path)
                for operation, definition in value.items():
                    parameters: List[Dict[str, Any]] = definition["parameters"] if "parameters" in definition else []
                    for p in parameters:
                        if p["name"] == "allRequestParams":
                            # We change the wording for the "allRequestParams" because the client ensures there
                            # is no override of the original "hard-coded" properties and therefore the role of this parameter slightly changes.
                            p["name"] = "additionalRequestParams"

                    method_parameters = [self._translate_parameter(p) for p in parameters]
                    method_parameters.sort(key=self._sort_params)
                    query_parameters = [p for p in method_parameters if p["in"] == "query"]
                    path_parameters = [p for p in method_parameters if p["in"] == "path"]
                    required_parameters = [p for p in method_parameters if p["required"] == True and not p["default"] and not p["name"]=="stage"]
                    dynamic_parameters = [p["name"] for p in method_parameters if p["type"].startswith("Dict[str, Any]")]
                    for dp in dynamic_parameters:
                        for qp in query_parameters:
                            if qp["param"] == dp:
                                query_parameters.remove(qp)
                                break
                    method_name = definition["operationId"]
                    category_capitalized = category.capitalize()
                    category_singular = category_capitalized[:-1] if category_capitalized.endswith("s") else category_capitalized
                    method_name = re.sub(category_capitalized, "", method_name)
                    method_name = re.sub(category_singular, "", method_name)

                    response_type = self._response_type(definition["responses"] if "responses" in definition else {})
                    generic_response_type = None
                    raw_response_type = response_type
                    if response_type:
                        generics = re.findall(f"(?<=\<).*(?=>)", response_type)
                        if len(generics) > 0:
                            generic_response_type = generics[0]

                        raw = re.findall(f"(.*)(?=\<)", response_type)
                        if len(raw)>0:
                            raw_response_type = raw[0]


                    method: Dict[str, Any] = {"operation": operation, "summary": definition["summary"] if "summary" in definition else None, "has_payload": "requestBody" in definition and definition["requestBody"],
                              "path": {"name": relative_path,  "has_path_params": len(path_parameters) > 0}, "name": method_name,
                              "path_parameters": path_parameters, "required_parameters": required_parameters, "parameters": method_parameters, "query_parameters": query_parameters, "dynamic_parameters": dynamic_parameters, "response_type": response_type, "generic_response_type": generic_response_type, "raw_response_type": raw_response_type}
                    methods_by_category[category].append(method)
                    print(f"Operation: {operation}, Path: {relative_path}")
            # Todo sort by operationId
            for _, methods in methods_by_category.items():
                methods.sort(key=lambda m: m['name'])
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "w+") as file:
            file.write(template.render(default_kg_root=self.default_kg_root, methods_by_category=sorted(methods_by_category.items()), api_version=api_version, id_namespace=self.id_namespace, default_client_id_for_device_flow=self.default_client_id_for_device_flow))
        print(json.dumps(paths_by_categories, indent=4))
        print(json.dumps(all_schemas, indent=4))

    def _find_type(self, type_: Optional[str], items: Optional[Dict[str, Any]], format_: Optional[str], enum_: Optional[List[str]]) -> Optional[str]:
        result = None
        if type_ == "string":
            if format_ == "uuid":
                result = "UUID"
            elif enum_:
                if len(enum_) == 2 and "IN_PROGRESS" in enum_ and "RELEASED" in enum_:
                    result = "Stage"
                elif len(enum_) == 3 and "TOP_INSTANCE_ONLY" in enum_ and "CHILDREN_ONLY" in enum_ and "CHILDREN_ONLY_RESTRICTED" in enum_:
                    result = "ReleaseTreeScope"
                else:
                    result = "String"
            else:
                result = "String"
        elif type_ == "boolean":
            result = "boolean"
        elif type_ == "integer":
            result = "int"
        elif type_ == "object":
            result = "Map<String, Object>"
        elif type_ == "array":
            if items and "type" in items and items["type"] == "string":
                result = "List<String>"
            else:
                result = "List"
        return result

    def _translate_parameter(self, input_: Dict[str, Any]) -> Dict[str, Optional[str]]:
        schema: Dict[str, Any] = input_.get("schema", {})
        type_: Optional[str] = schema.get("type", None)
        items: Optional[Dict[str, Any]] = schema.get("items", None)
        format_: Optional[str] = schema.get("format", None)
        default: Optional[Any] = str(schema["default"]) if "default" in schema else default_values[input_["name"]] if input_["name"] in default_values else None
        default = str(default).lower() if isinstance(default, bool) or default == "False" or default == "True" else "new HashMap<String, Object>()" if default == "{}" else f'"{default}"' if isinstance(default, str)  else default
        required: bool = input_.get("required", False)
        enum: Optional[List[str]] = schema.get("enum", None)
        return {
            "name": input_["name"],
            "type": self._find_type(type_, items, format_, enum),
            "default": default,
            "in": input_["in"],
            "required": required,
            "booleanTrueOnly": type_ == "boolean" and (default == "false" or not default)
        }

    def _to_camel_case(self, snake_str):
        components = snake_str.split('_')
        return components[0] + ''.join(x.title() for x in components[1:])

    def _split_path(self, path: str):
        splitted_path = path.split("/")
        api_version = splitted_path[1]
        relative_path = "/".join(splitted_path[2:])
        return api_version, relative_path

    def _sort_params(self, input_: Dict[str, Any]):
        type_ = input_.get("type", None)
        if type_ is not None and "=" in type_:
            sort = 2
        elif type_ is not None and "Optional[" in type_:
            sort = 1
        else:
            sort = 0
        return f"{sort} {input_['name']}"

    def _response_type(self, responses: Dict[str, Dict[str, Any]]) -> Optional[str]:
        response_reference = None
        if "200" in responses and responses["200"]:
            if "content" in responses["200"] and responses["200"]["content"]:
                content = None
                if "*/*" in responses["200"]["content"] and responses["200"]["content"]["*/*"]:
                    content = responses["200"]["content"]["*/*"]
                elif APPLICATION_JSON in responses["200"]["content"] and responses["200"]["content"][APPLICATION_JSON]:
                    content = responses["200"]["content"][APPLICATION_JSON]
                if content:
                    if "schema" in content and content["schema"]:
                        schema = content["schema"]
                        if "type" in schema and "items" in schema and schema["type"] == "array":
                            schema = schema["items"]
                        if "$ref" in schema and schema:
                            response_reference = schema["$ref"]
        if response_reference:
            if response_reference == "#/components/schemas/ResultNormalizedJsonLd":
                return "Result<Instance>"
            elif response_reference == "#/components/schemas/ResultMapStringResultNormalizedJsonLd":
                return "ResultsById<Instance>"
            elif response_reference == "#/components/schemas/PaginatedResultNormalizedJsonLd":
                return "ResultPage<Instance>"
            elif response_reference == "#/components/schemas/PaginatedStreamResultJsonLdDoc":
                return "ResultPage<JsonLdDocument>"
            elif response_reference == "#/components/schemas/ResultListUUID":
                return "Result<ListOfUUID>"
            elif response_reference == "#/components/schemas/ResultReleaseStatus":
                return "Result<ReleaseStatus>"
            elif response_reference == "#/components/schemas/ResultMapUUIDResultReleaseStatus":
                return "ResultsById<ReleaseStatus>"
            elif response_reference == "#/components/schemas/ResultListReducedUserInformation":
                return "Result<ListOfReducedUserInformation>"
            elif response_reference == "#/components/schemas/ResultUser":
                return "Result<User>"
            elif response_reference == "#/components/schemas/ResultUserWithRoles":
                return "Result<UserWithRoles>"
            elif response_reference == "#/components/schemas/ResultScopeElement":
                return "Result<Scope>"
            elif response_reference == "#/components/schemas/ResultJsonLdDoc":
                return "Result<JsonLdDocument>"
            elif response_reference == "#/components/schemas/ResultSpaceInformation":
                return "Result<SpaceInformation>"
            elif response_reference == "#/components/schemas/PaginatedResultSpaceInformation":
                return "ResultPage<SpaceInformation>"
            elif response_reference == "#/components/schemas/PaginatedResultTypeInformation":
                return "ResultPage<TypeInformation>"
            elif response_reference == "#/components/schemas/ResultMapStringResultTypeInformation":
                return "ResultsById<TypeInformation>"
            elif response_reference == "#/components/schemas/TermsOfUseResult":
                return "Optional<TermsOfUse>"
            # elif response_reference == "#/components/schemas/JsonLdDoc":
            #     return "ListOfJsonLdDocuments" if is_list else "JsonLdDocument"
            else:
                print(f"Unknown response reference: {response_reference}")
        return None

    def consolidate_request_objects(self, request_object: object, method_parameters: List[Dict[str, Any]], method_param_names: List[Optional[str]], query_parameters: List[Dict[str, Any]]):
        all_params = True
        request_object_name: str = request_object.__class__.__name__
        request_object_name_translated_camel_case = request_object_name[0].lower() + request_object_name[1:]
        request_object_camel_case_keys = [self._to_camel_case(k) for k in request_object.__dict__.keys()]
        for r in request_object_camel_case_keys:
            if r not in method_param_names:
                all_params = False
                break
            for p in method_parameters:
                # If it's already part of another request_object, we skip it.
                if p["name"] == r and "replace" in p:
                    all_params = False
                    break
        if all_params:
            for r in request_object_camel_case_keys:
                for p in method_parameters:
                    if p["name"] == r and "replace" not in p:
                        p["replace"] = request_object_name_translated_camel_case
            method_parameters.append({"name": request_object_name_translated_camel_case, "type": f"{request_object_name}"})


if __name__ == "__main__":

    localhost = JavaClientGenerator("localhost:8000", "v3/api-docs/", "https://kg.ebrains.eu/api/instances/", "kg-core-python")
    dev = JavaClientGenerator("core.kg-dev.ebrains.eu", "v3/api-docs/", "https://kg.ebrains.eu/api/instances/", "kg-core-python")
    ppd = JavaClientGenerator("core.kg-ppd.ebrains.eu", "v3/api-docs/", "https://kg.ebrains.eu/api/instances/", "kg-core-python")
    prod = JavaClientGenerator("core.kg.ebrains.eu", "v3/api-docs/", "https://kg.ebrains.eu/api/instances/", "kg-core-python")

    # localhost.generate()
    #dev.generate()
    #ppd.generate()
    prod.generate("v3")
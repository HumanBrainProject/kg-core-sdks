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

from __future__ import annotations
import os
import requests
from typing import List, Optional, Dict, Any
from uuid import UUID

from kg_core.__communication import TokenHandler, RequestsWithTokenHandler, KGConfig
from kg_core.request import ResponseConfiguration, ExtendedResponseConfiguration, Pagination, Stage, ReleaseTreeScope
from kg_core.oauth import SimpleToken, ClientCredentials, DeviceAuthenticationFlow
from kg_core.response import Result, Instance, JsonLdDocument, ResultsById, ResultPage, ReleaseStatus, Error, translate_error, User, Scope, SpaceInformation, TypeInformation, TermsOfUse


def _calculate_base_url(host: str):
    return f"http{'s' if not host.startswith('localhost') else ''}://{host}/v3-beta/"


def _create_kg_config(host: str, token_handler: TokenHandler, client_token_handler: Optional[TokenHandler] = None) -> KGConfig:
    return KGConfig(_calculate_base_url(host), token_handler, client_token_handler, "https://kg.ebrains.eu/api/instances/")


class Client(object):

    def __init__(self, host: str, token_handler: TokenHandler, client_token_handler: Optional[TokenHandler] = None):
        if not host:
            raise ValueError("No hostname specified")
        elif not token_handler:
            raise ValueError("No token provided")
        kg_config = _create_kg_config(host, token_handler, client_token_handler)
        self.instances = Instances(kg_config)
        self.jsonld = Jsonld(kg_config)
        self.queries = Queries(kg_config)
        self.spaces = Spaces(kg_config)
        self.types = Types(kg_config)
        self.users = Users(kg_config)
        

class Admin(RequestsWithTokenHandler):
    def __init__(self, config: KGConfig):
        super(Admin, self).__init__(config)

    def assign_type_to_space(self, space: str, target_type: str) -> Optional[Error]:
        """Assign a type to a space"""
        result = self._put(path=f"spaces/{space}/types", payload=None, params={ 
            "type": target_type
        })
        return translate_error(result)

    def calculate_instance_invitation_scope(self, instance_id: UUID) -> Optional[Error]:
        """Update invitation scope for this instance"""
        result = self._get(path=f"instances/{instance_id}/invitationScope", params={})
        return translate_error(result)

    def create_space_definition(self, space: str, autorelease: bool = False, client_space: bool = False, defer_cache: bool = False) -> Optional[Error]:
        """Explicitly specify a space"""
        result = self._put(path=f"spaces/{space}/specification", payload=None, params={ 
            "autorelease": autorelease,
            "clientSpace": client_space,
            "deferCache": defer_cache
        })
        return translate_error(result)

    def create_type_definition(self, payload: dict, target_type: str, is_global: Optional[bool] = None) -> Optional[Error]:
        """Specify a type"""
        result = self._put(path="types/specification", payload=payload, params={ 
            "global": is_global,
            "type": target_type
        })
        return translate_error(result)

    def define_property(self, payload: dict, property_name: str, is_global: Optional[bool] = None) -> Optional[Error]:
        """Upload a property specification either globally or for the requesting client"""
        result = self._put(path="properties", payload=payload, params={ 
            "global": is_global,
            "property": property_name
        })
        return translate_error(result)

    def define_property_for_type(self, payload: dict, property_name: str, target_type: str, is_global: Optional[bool] = None) -> Optional[Error]:
        """Define a property specification either globally for the requesting client"""
        result = self._put(path="propertiesForType", payload=payload, params={ 
            "global": is_global,
            "property": property_name,
            "type": target_type
        })
        return translate_error(result)

    def deprecate_property(self, property_name: str, is_global: Optional[bool] = None) -> Optional[Error]:
        """Upload a property specification either globally or for the requesting client"""
        result = self._delete(path="properties", params={ 
            "global": is_global,
            "property": property_name
        })
        return translate_error(result)

    def deprecate_property_for_type(self, property_name: str, target_type: str, is_global: Optional[bool] = None) -> Optional[Error]:
        """Deprecate a property specification for a specific type either globally or for the requesting client"""
        result = self._delete(path="propertiesForType", params={ 
            "global": is_global,
            "property": property_name,
            "type": target_type
        })
        return translate_error(result)

    def get_all_role_definitions(self) -> Optional[Error]:
        result = self._get(path="setup/permissions", params={})
        return translate_error(result)

    def get_claim_for_role(self, role: str, space: Optional[str] = None) -> Optional[Error]:
        result = self._get(path=f"setup/permissions/{role}", params={ 
            "space": space
        })
        return translate_error(result)

    def register_terms_of_use(self, payload: dict) -> Optional[Error]:
        result = self._put(path="setup/termsOfUse", payload=payload, params={})
        return translate_error(result)

    def remove_space_definition(self, space: str) -> Optional[Error]:
        """Remove a space definition"""
        result = self._delete(path=f"spaces/{space}/specification", params={})
        return translate_error(result)

    def remove_type_definition(self, is_global: Optional[bool] = None, target_type: Optional[str] = None) -> Optional[Error]:
        """Remove a type definition"""
        result = self._delete(path="types/specification", params={ 
            "type": target_type,
            "global": is_global
        })
        return translate_error(result)

    def remove_type_from_space(self, space: str, target_type: str) -> Optional[Error]:
        """Remove a type in space definition"""
        result = self._delete(path=f"spaces/{space}/types", params={ 
            "type": target_type
        })
        return translate_error(result)

    def rerun_events(self, space: str) -> Optional[Error]:
        """Trigger a rerun of the events of this space"""
        result = self._put(path=f"spaces/{space}/eventHistory", payload=None, params={})
        return translate_error(result)

    def trigger_inference(self, space: str, identifier: Optional[str] = None, is_async: bool = False) -> Optional[Error]:
        """Triggers the inference of all documents of the given space"""
        result = self._post(path=f"spaces/{space}/inference", payload=None, params={ 
            "identifier": identifier,
            "async": is_async
        })
        return translate_error(result)

    def update_claim_for_role(self, payload: dict, remove: bool, role: str, space: Optional[str] = None) -> Optional[Error]:
        result = self._patch(path=f"setup/permissions/{role}", payload=payload, params={ 
            "space": space,
            "remove": remove
        })
        return translate_error(result)


class Instances(RequestsWithTokenHandler):
    def __init__(self, config: KGConfig):
        super(Instances, self).__init__(config)

    def contribute_to_full_replacement(self, payload: dict, instance_id: UUID, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()) -> Result[Instance]:
        """Replace contribution to an existing instance"""
        result = self._put(path=f"instances/{instance_id}", payload=payload, params={ 
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        })
        return Result[Instance](response=result, constructor=Instance)

    def contribute_to_partial_replacement(self, payload: dict, instance_id: UUID, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()) -> Result[Instance]:
        """Partially update contribution to an existing instance"""
        result = self._patch(path=f"instances/{instance_id}", payload=payload, params={ 
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        })
        return Result[Instance](response=result, constructor=Instance)

    def create_new(self, payload: dict, space: str, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()) -> Result[Instance]:
        """Create new instance with a system generated id"""
        result = self._post(path="instances", payload=payload, params={ 
            "space": space,
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        })
        return Result[Instance](response=result, constructor=Instance)

    def create_new_with_id(self, payload: dict, instance_id: UUID, space: str, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()) -> Result[Instance]:
        """Create new instance with a client defined id"""
        result = self._post(path=f"instances/{instance_id}", payload=payload, params={ 
            "space": space,
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        })
        return Result[Instance](response=result, constructor=Instance)

    def delete(self, instance_id: UUID) -> Optional[Error]:
        """Delete an instance"""
        result = self._delete(path=f"instances/{instance_id}", params={})
        return translate_error(result)

    def get_by_id(self, instance_id: UUID, stage: Stage = Stage.RELEASED, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()) -> Result[Instance]:
        """Get the instance"""
        result = self._get(path=f"instances/{instance_id}", params={ 
            "stage": stage,
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        })
        return Result[Instance](response=result, constructor=Instance)

    def get_by_identifiers(self, payload: dict, stage: Stage = Stage.RELEASED, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()) -> ResultsById[Instance]:
        """Read instances by the given list of (external) identifiers"""
        result = self._post(path="instancesByIdentifiers", payload=payload, params={ 
            "stage": stage,
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        })
        return ResultsById[Instance](response=result, constructor=Instance)

    def get_by_ids(self, payload: dict, stage: Stage = Stage.RELEASED, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()) -> ResultsById[Instance]:
        """Bulk operation of /instances/{id} to read instances by their UUIDs"""
        result = self._post(path="instancesByIds", payload=payload, params={ 
            "stage": stage,
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        })
        return ResultsById[Instance](response=result, constructor=Instance)

    def get_incoming_links(self, instance_id: UUID, property_name: str, target_type: str, stage: Stage = Stage.RELEASED, pagination: Pagination = Pagination()) -> ResultPage[Instance]:
        """Get incoming links for a specific instance (paginated)"""
        result = self._get(path=f"instances/{instance_id}/incomingLinks", params={ 
            "stage": stage,
            "property": property_name,
            "type": target_type,
            "from": pagination.start,
            "size": pagination.size
        })
        return ResultPage[Instance](response=result, constructor=Instance)

    def get_release_status(self, instance_id: UUID, release_tree_scope: ReleaseTreeScope) -> Result[ReleaseStatus]:
        """Get the release status for an instance"""
        result = self._get(path=f"instances/{instance_id}/release/status", params={ 
            "releaseTreeScope": release_tree_scope
        })
        return Result[ReleaseStatus](response=result, constructor=ReleaseStatus)

    def get_release_status_by_ids(self, payload: dict, release_tree_scope: ReleaseTreeScope) -> ResultsById[ReleaseStatus]:
        """Get the release status for multiple instances"""
        result = self._post(path="instancesByIds/release/status", payload=payload, params={ 
            "releaseTreeScope": release_tree_scope
        })
        return ResultsById[ReleaseStatus](response=result, constructor=ReleaseStatus)

    def get_scope(self, instance_id: UUID, apply_restrictions: bool = False, return_permissions: bool = False, stage: Stage = Stage.RELEASED) -> Result[Scope]:
        """Get the scope for the instance by its KG-internal ID"""
        result = self._get(path=f"instances/{instance_id}/scope", params={ 
            "stage": stage,
            "returnPermissions": return_permissions,
            "applyRestrictions": apply_restrictions
        })
        return Result[Scope](response=result, constructor=Scope)

    def invite_user_for(self, instance_id: UUID, user_id: UUID) -> Optional[Error]:
        """Create or update an invitation for the given user to review the given instance"""
        result = self._put(path=f"instances/{instance_id}/invitedUsers/{user_id}", payload=None, params={})
        return translate_error(result)

    def list(self, target_type: str, filter_property: Optional[str] = None, filter_value: Optional[str] = None, search_by_label: Optional[str] = None, space: Optional[str] = None, stage: Stage = Stage.RELEASED, response_configuration: ResponseConfiguration = ResponseConfiguration(), pagination: Pagination = Pagination()) -> ResultPage[Instance]:
        """Returns a list of instances according to their types"""
        result = self._get(path="instances", params={ 
            "stage": stage,
            "type": target_type,
            "space": space,
            "searchByLabel": search_by_label,
            "filterProperty": filter_property,
            "filterValue": filter_value,
            "returnPayload": response_configuration.return_payload,
            "returnPermissions": response_configuration.return_permissions,
            "returnAlternatives": response_configuration.return_alternatives,
            "returnEmbedded": response_configuration.return_embedded,
            "from": pagination.start,
            "size": pagination.size
        })
        return ResultPage[Instance](response=result, constructor=Instance)

    def list_invitations(self, instance_id: UUID) -> Optional[Error]:
        """List invitations for review for the given instance"""
        result = self._get(path=f"instances/{instance_id}/invitedUsers", params={})
        return translate_error(result)

    def move(self, instance_id: UUID, space: str, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()) -> Result[Instance]:
        """Move an instance to another space"""
        result = self._put(path=f"instances/{instance_id}/spaces/{space}", payload=None, params={ 
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        })
        return Result[Instance](response=result, constructor=Instance)

    def release(self, instance_id: UUID, revision: Optional[str] = None) -> Optional[Error]:
        """Release or re-release an instance"""
        result = self._put(path=f"instances/{instance_id}/release", payload=None, params={ 
            "revision": revision
        })
        return translate_error(result)

    def revoke_user_invitation(self, instance_id: UUID, user_id: UUID) -> Optional[Error]:
        """Revoke an invitation for the given user to review the given instance"""
        result = self._delete(path=f"instances/{instance_id}/invitedUsers/{user_id}", params={})
        return translate_error(result)

    def unrelease(self, instance_id: UUID) -> Optional[Error]:
        """Unrelease an instance"""
        result = self._delete(path=f"instances/{instance_id}/release", params={})
        return translate_error(result)


class Jsonld(RequestsWithTokenHandler):
    def __init__(self, config: KGConfig):
        super(Jsonld, self).__init__(config)

    def normalize_payload(self, payload: dict) -> Optional[Error]:
        """Normalizes the passed payload according to the EBRAINS KG conventions"""
        result = self._post(path="jsonld/normalizedPayload", payload=payload, params={})
        return translate_error(result)


class Queries(RequestsWithTokenHandler):
    def __init__(self, config: KGConfig):
        super(Queries, self).__init__(config)

    def execute_query_by_id(self, query_id: UUID, all_request_params: Dict[str, Any] = {}, instance_id: Optional[UUID] = None, restrict_to_spaces: Optional[List[str]] = None, stage: Stage = Stage.RELEASED, pagination: Pagination = Pagination()) -> ResultPage[JsonLdDocument]:
        """Execute a stored query to receive the instances"""
        result = self._get(path=f"queries/{query_id}/instances", params={ 
            "from": pagination.start,
            "size": pagination.size,
            "stage": stage,
            "instanceId": instance_id,
            "restrictToSpaces": restrict_to_spaces,
            "allRequestParams": all_request_params
        })
        return ResultPage[JsonLdDocument](response=result, constructor=JsonLdDocument)

    def get_query_specification(self, query_id: UUID) -> Result[Instance]:
        """Get the query specification with the given query id in a specific space"""
        result = self._get(path=f"queries/{query_id}", params={})
        return Result[Instance](response=result, constructor=Instance)

    def list_per_root_type(self, search: Optional[str] = None, target_type: Optional[str] = None, pagination: Pagination = Pagination()) -> ResultPage[Instance]:
        """List the queries and filter them by root type and/or text in the label, name or description"""
        result = self._get(path="queries", params={ 
            "from": pagination.start,
            "size": pagination.size,
            "type": target_type,
            "search": search
        })
        return ResultPage[Instance](response=result, constructor=Instance)

    def remove_query(self, query_id: UUID) -> Optional[Error]:
        """Remove a query specification"""
        result = self._delete(path=f"queries/{query_id}", params={})
        return translate_error(result)

    def save_query(self, payload: dict, query_id: UUID, space: Optional[str] = None) -> Result[Instance]:
        """Create or save a query specification"""
        result = self._put(path=f"queries/{query_id}", payload=payload, params={ 
            "space": space
        })
        return Result[Instance](response=result, constructor=Instance)

    def test_query(self, payload: dict, all_request_params: Dict[str, Any] = {}, instance_id: Optional[UUID] = None, restrict_to_spaces: Optional[List[str]] = None, stage: Stage = Stage.RELEASED, pagination: Pagination = Pagination()) -> ResultPage[JsonLdDocument]:
        """Execute the query in the payload in test mode (e.g. for execution before saving with the KG QueryBuilder)"""
        result = self._post(path="queries", payload=payload, params={ 
            "from": pagination.start,
            "size": pagination.size,
            "stage": stage,
            "instanceId": instance_id,
            "restrictToSpaces": restrict_to_spaces,
            "allRequestParams": all_request_params
        })
        return ResultPage[JsonLdDocument](response=result, constructor=JsonLdDocument)


class Spaces(RequestsWithTokenHandler):
    def __init__(self, config: KGConfig):
        super(Spaces, self).__init__(config)

    def get(self, space: str, permissions: bool = False) -> Result[SpaceInformation]:
        result = self._get(path=f"spaces/{space}", params={ 
            "permissions": permissions
        })
        return Result[SpaceInformation](response=result, constructor=SpaceInformation)

    def list(self, permissions: bool = False, pagination: Pagination = Pagination()) -> ResultPage[SpaceInformation]:
        result = self._get(path="spaces", params={ 
            "from": pagination.start,
            "size": pagination.size,
            "permissions": permissions
        })
        return ResultPage[SpaceInformation](response=result, constructor=SpaceInformation)


class Types(RequestsWithTokenHandler):
    def __init__(self, config: KGConfig):
        super(Types, self).__init__(config)

    def get_by_name(self, payload: dict, space: Optional[str] = None, stage: Stage = Stage.RELEASED, with_incoming_links: bool = False, with_properties: bool = False) -> ResultsById[TypeInformation]:
        """Returns the types according to the list of names - either with property information or without"""
        result = self._post(path="typesByName", payload=payload, params={ 
            "stage": stage,
            "withProperties": with_properties,
            "withIncomingLinks": with_incoming_links,
            "space": space
        })
        return ResultsById[TypeInformation](response=result, constructor=TypeInformation)

    def list(self, space: Optional[str] = None, stage: Stage = Stage.RELEASED, with_incoming_links: bool = False, with_properties: bool = False, pagination: Pagination = Pagination()) -> ResultPage[TypeInformation]:
        """Returns the types available - either with property information or without"""
        result = self._get(path="types", params={ 
            "stage": stage,
            "space": space,
            "withProperties": with_properties,
            "withIncomingLinks": with_incoming_links,
            "from": pagination.start,
            "size": pagination.size
        })
        return ResultPage[TypeInformation](response=result, constructor=TypeInformation)


class Users(RequestsWithTokenHandler):
    def __init__(self, config: KGConfig):
        super(Users, self).__init__(config)

    def accept_terms_of_use(self, version: str) -> Optional[Error]:
        """Accept the terms of use in the given version"""
        result = self._post(path=f"users/termsOfUse/{version}/accept", payload=None, params={})
        return translate_error(result)

    def get_open_id_config_url(self) -> Result[JsonLdDocument]:
        """Get the endpoint of the openid configuration"""
        result = self._get(path="users/authorization/config", params={})
        return Result[JsonLdDocument](response=result, constructor=JsonLdDocument)

    def get_terms_of_use(self) -> Optional[TermsOfUse]:
        """Get the current terms of use"""
        result = self._get(path="users/termsOfUse", params={})
        return None if not result.content else TermsOfUse(**result.content)

    def my_info(self) -> Result[User]:
        """Retrieve user information from the passed token (including detailed information such as e-mail address)"""
        result = self._get(path="users/me", params={})
        return Result[User](response=result, constructor=User)


class ClientBuilder(object):

    def __init__(self, host_name: str):
        self._host_name = host_name
        self._token_handler: Optional[TokenHandler] = None
        self._client_token_handler: Optional[TokenHandler] = None

    def _resolve_token_handler(self) -> TokenHandler:
        if not self._token_handler:
            self.with_device_flow()  # We fall back to device flow if there is no explicitly stated token handler and no environment variables are specified
            return self._token_handler
        else:
            return self._token_handler

    def _resolve_client_token_handler(self) -> Optional[TokenHandler]:
        if not self._client_token_handler:
            if "KG_CLIENT_ID" in os.environ and "KG_CLIENT_SECRET" in os.environ:
                return ClientCredentials(os.environ["KG_CLIENT_ID"], os.environ["KG_CLIENT_SECRET"])
            elif "KG_CLIENT_TOKEN" in os.environ:
                return SimpleToken(os.environ["KG_CLIENT_TOKEN"])
            else:
                return None
        else:
            return self._client_token_handler

    def with_device_flow(self, client_id: str = "kg-core-python", open_id_configuration_url: Optional[str] = None) -> ClientBuilder:
        if not open_id_configuration_url:
            auth_endpoint = requests.get(f"{_calculate_base_url(self._host_name)}users/authorization/config").json()
            if auth_endpoint and "data" in auth_endpoint and auth_endpoint["data"] and "endpoint" in auth_endpoint["data"]:
                config = auth_endpoint["data"]["endpoint"]
            else:
                raise ValueError("Was not able to determine the authentication endpoint. This could be caused by a temporary downtime or a misconfiguration of the host name")
        else:
            config = open_id_configuration_url
        self._token_handler = DeviceAuthenticationFlow(config, client_id)
        return self

    def with_token(self, token: Optional[str] = None) -> ClientBuilder:
        self._token_handler = SimpleToken(token if token else os.environ["KG_TOKEN"])
        return self

    def with_credentials(self, client_id: Optional[str] = None, client_secret: Optional[str] = None) -> ClientBuilder:
        self._token_handler = ClientCredentials(client_id if client_id else os.environ["KG_CLIENT_ID"], client_secret if client_secret else os.environ["KG_CLIENT_SECRET"])
        return self

    def add_client_authentication(self, client_id: Optional[str] = None, client_secret: Optional[str] = None) -> ClientBuilder:
        self._client_token_handler = ClientCredentials(client_id if client_id else os.environ["KG_CLIENT_ID"], client_secret if client_secret else os.environ["KG_CLIENT_SECRET"])
        return self

    def build(self) -> Client:
        return Client(self._host_name, self._resolve_token_handler(), self._resolve_client_token_handler())

    def build_admin(self) -> Admin:
        return Admin(_create_kg_config(self._host_name, self._resolve_token_handler(), self._resolve_client_token_handler()))


def kg(host: str = "core.kg.ebrains.eu") -> ClientBuilder:
    return ClientBuilder(host)

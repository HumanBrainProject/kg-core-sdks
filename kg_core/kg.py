#  Copyright 2018 - 2022 Swiss Federal Institute of Technology Lausanne (EPFL)
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

import uuid
from typing import Any, Dict, List, Optional, Union, cast
from uuid import UUID

from kg_core.__communication import TokenHandler, RequestsWithTokenHandler
from kg_core.models import KGResult, Stage, Pagination, ResponseConfiguration, ReleaseTreeScope


class KGv3(RequestsWithTokenHandler):
    KG_VERSION = "v3-beta"
    ID_NAMESPACE = "https://kg.ebrains.eu/api/instances/"

    @staticmethod
    def absolute_id(uuid: UUID) -> str:
        return f"{KGv3.ID_NAMESPACE}{uuid}"

    @staticmethod
    def uuid_from_absolute_id(identifier: Optional[Union[str, UUID]]) -> Optional[UUID]:
        if identifier:
            if type(identifier) == UUID:
                return cast(UUID, identifier)
            try:
                id_str = cast(str, identifier)
                if id_str.startswith(KGv3.ID_NAMESPACE):
                    return uuid.UUID(id_str[len(KGv3.ID_NAMESPACE):])
                return uuid.UUID(id_str)
            except ValueError:
                return None
        return None

    def __init__(self, host: str, token_handler: TokenHandler, client_token_handler: TokenHandler = None):
        super(KGv3, self).__init__(f"https://{host}/{KGv3.KG_VERSION}", token_handler=token_handler,
                                   client_token_handler=client_token_handler)

    def types(self, stage: Stage, space: Optional[str] = None, with_properties: bool = False,
              with_incoming_links: bool = False, with_counts: bool = False,
              pagination: Pagination = Pagination()) -> KGResult:
        return self.get(path="/types", params={
            "stage": stage,
            "space": space,
            "withProperties": with_properties,
            "withIncomingLinks": with_incoming_links,
            "withCounts": with_counts,
            "from": pagination.start_from,
            "size": pagination.size
        })

    def queries(self, query: Dict[str, Any], stage: Stage, instance_id: Optional[str] = None,
                pagination: Pagination = Pagination()) -> KGResult:
        return self.post(path="/queries", payload=query,
                         params={
                             "stage": stage,
                             "from": pagination.start_from,
                             "size": pagination.size,
                             "instanceId": KGv3.uuid_from_absolute_id(instance_id)
                         })
   
    def query_instances(self, query_id: str, stage: Stage, instance_id: Optional[str] = None,
                pagination: Pagination = Pagination()) -> KGResult:
        return self.get(path=f"/queries/{query_id}/instances", params={
                             "stage": stage,
                             "from": pagination.start_from,
                             "size": pagination.size,
                             "instanceId": KGv3.uuid_from_absolute_id(instance_id)
                         })

    def spaces(self, with_permissions: bool = False, pagination: Pagination = Pagination()) -> KGResult:
        return self.get(path="/spaces", params={
            "permissions": with_permissions,
            "from": pagination.start_from,
            "size": pagination.size
        })

    def get_instance(self, instance_id: UUID, stage: Stage,
                     response_configuration: ResponseConfiguration = ResponseConfiguration()) -> KGResult:
        return self.get(path=f"/instances/{instance_id}",
                        params={
                            "stage": stage,
                            "returnPayload": response_configuration.return_payload,
                            "returnPermissions": response_configuration.return_permissions,
                            "returnAlternatives": response_configuration.return_alternatives,
                            "returnEmbedded": response_configuration.return_embedded,
                            "returnIncomingLinks": response_configuration.return_incoming_links,
                            "sortByLabel": response_configuration.sort_by_label
                        })

    def get_instances_by_identifiers(self, stage: Stage, identifiers: List[str],
                                     response_configuration: ResponseConfiguration = ResponseConfiguration()):
        return self.post(path="/instancesByIdentifiers",
                         payload=identifiers,
                         params={
                             "stage": stage,
                             "returnPayload": response_configuration.return_payload,
                             "returnPermissions": response_configuration.return_permissions,
                             "returnAlternatives": response_configuration.return_alternatives,
                             "returnEmbedded": response_configuration.return_embedded,
                             "returnIncomingLinks": response_configuration.return_incoming_links,
                             "sortByLabel": response_configuration.sort_by_label
                         })

    def get_instances_by_ids(self, stage: Stage, ids: List[str],
                             response_configuration: ResponseConfiguration = ResponseConfiguration()):
        return self.post(path="/instancesByIds",
                         payload=ids,
                         params={
                             "stage": stage,
                             "returnPayload": response_configuration.return_payload,
                             "returnPermissions": response_configuration.return_permissions,
                             "returnAlternatives": response_configuration.return_alternatives,
                             "returnEmbedded": response_configuration.return_embedded,
                             "returnIncomingLinks": response_configuration.return_incoming_links
                         })

    def get_instances(self, stage: Stage, target_type: str, space: Optional[str] = None,
                      search_by_label: Optional[str] = None,
                      response_configuration: ResponseConfiguration = ResponseConfiguration(),
                      pagination: Pagination = Pagination()) -> KGResult:
        return self.get(path="/instances",
                        params={
                            "stage": stage,
                            "type": target_type,
                            "space": space,
                            "searchByLabel": search_by_label,
                            "returnPayload": response_configuration.return_payload,
                            "returnPermissions": response_configuration.return_permissions,
                            "returnAlternatives": response_configuration.return_alternatives,
                            "returnEmbedded": response_configuration.return_embedded,
                            "returnIncomingLinks": response_configuration.return_incoming_links,
                            "sortByLabel": response_configuration.sort_by_label,
                            "from": pagination.start_from,
                            "size": pagination.size
                        })

    def get_incoming_links(self, instance_id: UUID, stage: Stage, property: str, type: str,
                           pagination: Pagination = Pagination()) -> KGResult:
        return self.get(path=f"/instances/{instance_id}/incomingLinks",
                        params={
                            "stage": stage,
                            "type": type,
                            "property": property,
                            "from": pagination.start_from,
                            "size": pagination.size
                        })

    def create_instance(self, space: str, payload: Dict[str, Any], instance_id: Optional[UUID] = None,
                        response_configuration: ResponseConfiguration = ResponseConfiguration(),
                        defer_inference: bool = False, normalize_payload: bool = False,
                        update_if_exists: bool = False) -> KGResult:
        result = self.post(path="/instances" if instance_id is None else f"/instances/{instance_id}", payload=payload,
                           params={
                               "space": space,
                               "returnPayload": response_configuration.return_payload,
                               "returnPermissions": response_configuration.return_permissions,
                               "returnAlternatives": response_configuration.return_alternatives,
                               "returnEmbedded": response_configuration.return_embedded,
                               "returnIncomingLinks": response_configuration.return_incoming_links,
                               "sortByLabel": response_configuration.sort_by_label,
                               "deferInference": defer_inference,
                               "normalizePayload": normalize_payload
                           })
        if result.status_code == 409 and update_if_exists and "instanceId" in result.error():
            instance = result.error()["instanceId"]
            if instance:
                return self.replace_contribution_to_instance(UUID(instance), payload,
                                                             response_configuration=response_configuration,
                                                             defer_inference=defer_inference,
                                                             normalize_payload=normalize_payload)
        return result

    def replace_contribution_to_instance(self, instance_id: UUID, payload: Dict[str, Any], undeprecate: bool = False,
                                         response_configuration: ResponseConfiguration = ResponseConfiguration(),
                                         defer_inference: bool = False, normalize_payload: bool = True):
        return self.put(path=f"/instances/{instance_id}", payload=payload, params={
            "undeprecate": undeprecate,
            "returnPayload": response_configuration.return_payload,
            "returnPermissions": response_configuration.return_permissions,
            "returnAlternatives": response_configuration.return_alternatives,
            "returnEmbedded": response_configuration.return_embedded,
            # "returnIncomingLinks": response_configuration.return_incoming_links,
            # "sortByLabel": response_configuration.sort_by_label,
            "deferInference": defer_inference,
            "normalizePayload": normalize_payload
        })

    def partially_update_contribution_to_instance(self, instance_id: UUID, payload: Dict[str, Any],
                                                  undeprecate: bool = False,
                                                  response_configuration: ResponseConfiguration = ResponseConfiguration(),
                                                  defer_inference: bool = False, normalize_payload: bool = True):
        return self.patch(path=f"/instances/{instance_id}", payload=payload, params={
            "undeprecate": undeprecate,
            "returnPayload": response_configuration.return_payload,
            "returnPermissions": response_configuration.return_permissions,
            "returnAlternatives": response_configuration.return_alternatives,
            "returnEmbedded": response_configuration.return_embedded,
            # "returnIncomingLinks": response_configuration.return_incoming_links,
            # "sortByLabel": response_configuration.sort_by_label,
            "deferInference": defer_inference,
            "normalizePayload": normalize_payload
        })

    def move_instance_to_another_space(self, instance_id: UUID, space,
                                       response_configuration: ResponseConfiguration = ResponseConfiguration()):
        return self.put(path=f"/instances/{instance_id}/spaces/{space}", payload={}, params={
            "returnPayload": response_configuration.return_payload,
            "returnPermissions": response_configuration.return_permissions,
            "returnAlternatives": response_configuration.return_alternatives,
            "returnEmbedded": response_configuration.return_embedded,
            "returnIncomingLinks": response_configuration.return_incoming_links
            # "incomingLinksPageSize": response_configuration.incoming_links_page_size
        })

    def deprecate_instance(self, instance_id: UUID) -> KGResult:
        return self.delete(path=f"/instances/{instance_id}", params={})

    def get_release_status_of_instance(self, instance_id: UUID, release_tree_scope: ReleaseTreeScope) -> KGResult:
        return self.get(path=f"/instances/{instance_id}/release/status",
                        params={"releaseTreeScope": release_tree_scope})

    def get_release_status_of_instances(self, payload: Dict[str, Any],
                                        release_tree_scope: ReleaseTreeScope) -> KGResult:
        return self.post(path=f"/instancesByIds/release/status", payload=payload,
                         params={"releaseTreeScope": release_tree_scope})

    def release_instance(self, instance_id: UUID) -> KGResult:
        return self.put(path=f"/instances/{instance_id}/release", payload={}, params={})

    def unrelease_instance(self, instance_id: UUID) -> KGResult:
        return self.delete(path=f"/instances/{instance_id}/release", params={})

    def get_terms_of_use(self):
        return self.get(path="/users/termsOfUse", params={})

    def accept_terms_of_use(self, version: str):
        return self.post(path=f"/users/termsOfUse/{version}/accept", payload=None, params={})

    def get_users(self, id: str):
        return self.get(path="/users/limited", params={
            "id": id
        })
    
    def me(self):
        return self.get(path="/users/me", params={})

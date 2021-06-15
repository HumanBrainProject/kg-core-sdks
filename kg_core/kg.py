#  Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
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
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
import uuid
from typing import List, Optional
from uuid import UUID

from kg_core.__communication import TokenHandler, RequestsWithTokenHandler
from kg_core.models import KGResult, Stage, Pagination, ResponseConfiguration


class KGv3(RequestsWithTokenHandler):
    KG_VERSION = "v3-beta"
    ID_NAMESPACE = "https://kg.ebrains.eu/api/instances/"

    @staticmethod
    def absolute_id(uuid:UUID) -> str:
        return f"{KGv3.ID_NAMESPACE}{uuid}"
    
    @staticmethod
    def uuid_from_absolute_id(identifier) -> Optional[UUID]:
        if identifier:
            if type(identifier) == UUID:
                return identifier
            try:
                if identifier.startswith(KGv3.ID_NAMESPACE):
                    return uuid.UUID(identifier[len(KGv3.ID_NAMESPACE):])
                return uuid.UUID(identifier)
            except ValueError:
                return None
        return None

    def __init__(self, host: str, token_handler: TokenHandler):
        super(KGv3, self).__init__(f"https://{host}/{KGv3.KG_VERSION}", token_handler)
        
    def types(self, stage:Stage, space:str = None, with_properties:bool = False, with_incoming_links:bool = False, with_counts:bool = False, pagination: Pagination = Pagination()) -> KGResult:
        return self.get(path="/types", params={
            "stage": stage,
            "space": space,
            "withProperties": with_properties,
            "withIncomingLinks": with_incoming_links,
            "withCounts": with_counts,
            "from": pagination.start_from,
            "size": pagination.size        
        })
        

    def queries(self, query: dict, stage: Stage, instance_id: str = None, pagination: Pagination = Pagination()) -> KGResult:
        return self.post(path="/queries", payload=query,
                         params={
                             "stage": stage,
                             "from": pagination.start_from,
                             "size": pagination.size,
                             "instanceId": KGv3.uuid_from_absolute_id(instance_id)
                         })

    def get_instance(self, instance_id: UUID, stage: Stage, response_configuration: ResponseConfiguration = ResponseConfiguration()) -> KGResult:
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
    
    def get_instances_by_identifiers(self, stage: Stage, identifiers: List[str], response_configuration: ResponseConfiguration = ResponseConfiguration()):
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

    def get_instances(self, stage: Stage, target_type: str, space: str = None, search_by_label: str = None, response_configuration: ResponseConfiguration = ResponseConfiguration(),
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

    def create_instance(self, space: str, payload: dict, instance_id: UUID = None, response_configuration: ResponseConfiguration = ResponseConfiguration(),
                        defer_inference: bool = False, normalize_payload=False) -> KGResult:
        return self.post(path="/instances" if instance_id is None else f"/instances/{instance_id}", payload=payload,
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

    def replace_contribution_to_instance(self, instance_id: UUID, payload: dict, undeprecate: bool=False, response_configuration: ResponseConfiguration = ResponseConfiguration(), defer_inference:bool=False, normalize_payload:bool = True):
        return self.put(path = f"/instances/{instance_id}", payload=payload, params={
                            "undeprecate": undeprecate,
                             "returnPayload": response_configuration.return_payload,
                             "returnPermissions": response_configuration.return_permissions,
                             "returnAlternatives": response_configuration.return_alternatives,
                             "returnEmbedded": response_configuration.return_embedded,
                             #"returnIncomingLinks": response_configuration.return_incoming_links,
                             #"sortByLabel": response_configuration.sort_by_label,
                             "deferInference": defer_inference,
                             "normalizePayload": normalize_payload
                         })

    def partially_update_contribution_to_instance(self, instance_id: UUID, payload: dict, undeprecate: bool=False, response_configuration: ResponseConfiguration = ResponseConfiguration(), defer_inference:bool=False, normalize_payload:bool = True):
        return self.patch(path = f"/instances/{instance_id}", payload=payload, params={
                            "undeprecate": undeprecate,
                             "returnPayload": response_configuration.return_payload,
                             "returnPermissions": response_configuration.return_permissions,
                             "returnAlternatives": response_configuration.return_alternatives,
                             "returnEmbedded": response_configuration.return_embedded,
                             #"returnIncomingLinks": response_configuration.return_incoming_links,
                             #"sortByLabel": response_configuration.sort_by_label,
                             "deferInference": defer_inference,
                             "normalizePayload": normalize_payload
                         })

    def deprecate_instance(self, instance_id: UUID) -> KGResult:
        return self.delete(path=f"/instances/{instance_id}", params={})

    def unrelease_instance(self, instance_id: UUID) -> KGResult:
        return self.delete(path=f"/instances/{instance_id}/release", params={})

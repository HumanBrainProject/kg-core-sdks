#   Copyright (c) 2018, EPFL/Human Brain Project PCO
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
from uuid import UUID

from kg_core.__communication import TokenHandler, RequestsWithTokenHandler
from kg_core.models import KGResult, Stage, Pagination, ResponseConfiguration


def _reduce_to_uuid(id):
    if id and id.startswith(KGv3.ID_NAMESPACE):
        return id[len(KGv3.ID_NAMESPACE):]
    return id


class KGv3(RequestsWithTokenHandler):
    KG_VERSION = "v3-beta"
    ID_NAMESPACE = "https://kg.ebrains.eu/api/instances/"

    def __init__(self, host: str, token_handler: TokenHandler):
        super(KGv3, self).__init__(f"https://{host}/{KGv3.KG_VERSION}", token_handler)

    def queries(self, query: dict, stage: Stage, instance_id = None, pagination: Pagination = Pagination()) -> KGResult:
        return self.post("/queries", query,
                         {
                             "stage": stage,
                             "from": pagination.start_from,
                             "size": pagination.size,
                             "instanceId": _reduce_to_uuid(instance_id)
                         })

    def get_instances(self, stage: Stage, target_type: str, space: str = None, search_by_label: str = None, response_configuration: ResponseConfiguration = ResponseConfiguration(),
                  pagination: Pagination = Pagination()) -> KGResult:
        return self.get("/instances",
                        {
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

    def create_instance(self,  space: str, instance_id:UUID = None, response_configuration: ResponseConfiguration = ResponseConfiguration(),
                  defer_inference: bool = False, normalize_payload = False) -> KGResult:
        return self.post("/instances" if instance_id is None else f"/instances/{instance_id}",
                        {
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

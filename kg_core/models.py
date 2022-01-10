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

from typing import Any, Dict, Optional

class Pagination(object):
    def __init__(self, start_from: int = 0, size: int = 50):
        self.start_from = start_from
        self.size = size


class Stage(str):
    IN_PROGRESS = "IN_PROGRESS"
    RELEASED = "RELEASED"

class ReleaseTreeScope(str):
    TOP_INSTANCE_ONLY = "TOP_INSTANCE_ONLY"
    CHILDREN_ONLY = "CHILDREN_ONLY"


class ResponseConfiguration(object):

    def __init__(self, return_payload: bool = True, return_permissions: bool=False, return_alternatives: bool=False, return_embedded: bool=True, return_incoming_links: bool=False, sort_by_label: bool=False):
        self.return_payload = return_payload
        self.return_permissions = return_permissions
        self.return_alternatives = return_alternatives
        self.return_embedded = return_embedded
        self.return_incoming_links = return_incoming_links
        self.sort_by_label = sort_by_label


class KGResult(object):

    def __init__(self, json: Optional[Dict[str, Any]], request_args: Optional[Dict[str, Any]], payload: Optional[Dict[str, Any]], status_code:int):
        self.payload = json
        self.request_args = request_args
        self.request_payload = payload
        self.status_code = status_code

    def data(self):
        return self.payload["data"] if self.payload and "data" in self.payload else None
    
    def is_successful(self):
        return not self.error()
    
    def error(self):
        return self.payload["error"] if self.payload and "error" in self.payload else None

    def message(self):
        return self.payload["message"] if self.payload and "message" in self.payload else None

    def start_time(self):
        return self.payload["startTime"] if self.payload and "startTime" in self.payload else None

    def duration_in_ms(self):
        return self.payload["durationInMs"] if self.payload and "durationInMs" in self.payload else None

    def total(self):
        return self.payload["total"] if self.payload and "total" in self.payload else 0

    def size(self):
        return self.payload["size"] if self.payload and "size" in self.payload else 0

    def start_from(self):
        return self.payload["from"] if self.payload and "from" in self.payload else 0

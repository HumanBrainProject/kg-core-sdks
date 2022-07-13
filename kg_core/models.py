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


from abc import ABC
from typing import Any, Dict, Optional, List, TypedDict




class AbstractKGResult(ABC):
    def __init__(self, json: Optional[Dict[str, Any]], request_args: Optional[Dict[str, Any]], payload: Optional[Dict[str, Any]], status_code: int):
        self.payload = json
        self.request_args = request_args
        self.request_payload = payload
        self.status_code = status_code

    def is_successful(self) -> bool:
        return not self.error()

    def error(self) -> Optional[dict]:
        return self.payload["error"] if self.payload and "error" in self.payload else None

    def message(self) -> Optional[str]:
        return self.payload["message"] if self.payload and "message" in self.payload else None

    def start_time(self) -> Optional[int]:
        return self.payload["startTime"] if self.payload and "startTime" in self.payload else None

    def duration_in_ms(self) -> Optional[int]:
        return self.payload["durationInMs"] if self.payload and "durationInMs" in self.payload else None

    def transactionId(self) -> Optional[str]:
        return self.payload["transactionId"] if self.payload and "transactionId" in self.payload else None


class KGResultPage(AbstractKGResult):

    def __init__(self, json: Optional[Dict[str, Any]], request_args: Optional[Dict[str, Any]], payload: Optional[Dict[str, Any]], status_code:int):
        super(KGResultPage, self).__init__(json, request_args, payload, status_code)

    def data(self) -> List[dict]:
        return self.payload["data"] if self.payload and "data" in self.payload else []


class NormalizedJsonLd(Dict[str, Any]):

    def __init__(self, json: dict, kg_namespace):
        super(NormalizedJsonLd, self).__init__(**json)
        self.__kg_namespace = kg_namespace

    def at_id(self):
        return self["@id"] if "@id" in self else None

    def uuid(self):
        at_id = self.at_id()
        if at_id and at_id.startswith(self.__kg_namespace):
            try:
                return at_id[len(self.__kg_namespace):]
            except ValueError:
                return None
        return None


class KGSingleResult(AbstractKGResult):

    def __init__(self, json: Optional[Dict[str, Any]], request_args: Optional[Dict[str, Any]], payload: Optional[Dict[str, Any]], status_code:int):
        super(KGSingleResult, self).__init__(json, request_args, payload, status_code)

    def data(self) -> Optional[NormalizedJsonLd]:
        return NormalizedJsonLd(self.payload["data"]) if self.payload and "data" in self.payload else None


class KGResult(object):

    def __init__(self, json: Optional[Dict[str, Any]], request_args: Optional[Dict[str, Any]], payload: Optional[Dict[str, Any]], status_code: int):
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

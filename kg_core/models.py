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

class Pagination(object):
    def __init__(self, start_from: int = 0, size: int = 50):
        self.start_from = start_from
        self.size = size


class Stage(str):
    IN_PROGRESS = "IN_PROGRESS"
    RELEASED = "RELEASED"


class ResponseConfiguration(object):

    def __init__(self, return_payload=True, return_permissions=False, return_alternatives=False, return_embedded=False, return_incoming_links=False, sort_by_label=False):
        self.return_payload = return_payload
        self.return_permissions = return_permissions
        self.return_alternatives = return_alternatives
        self.return_embedded = return_embedded
        self.return_incoming_links = return_incoming_links
        self.sort_by_label = sort_by_label


class KGResult(object):

    def __init__(self, json: dict, request_args: dict, payload):
        self.payload = json
        self.request_args = request_args
        self.request_payload = payload

    def data(self):
        return self.payload["data"] if "data" in self.payload else None

    def message(self):
        return self.payload["message"] if "message" in self.payload else None

    def start_time(self):
        return self.payload["startTime"] if "startTime" in self.payload else None

    def duration_in_ms(self):
        return self.payload["durationInMs"] if "durationInMs" in self.payload else None

    def total(self):
        return self.payload["total"] if "total" in self.payload else 0

    def size(self):
        return self.payload["size"] if "size" in self.payload else 0

    def start_from(self):
        return self.payload["from"] if "from" in self.payload else 0

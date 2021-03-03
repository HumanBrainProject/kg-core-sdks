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
import threading
from abc import ABC, abstractmethod
from copy import deepcopy

import requests


class Stage(str):
    IN_PROGRESS = "IN_PROGRESS"
    RELEASED = "RELEASED"


class TokenHandler(ABC):

    def __init__(self):
        self._auth_endpoint = None
        self.__token = None
        self.__lock = threading.Lock()

    def get_token(self, force_fetch=False):
        if not self.__token or force_fetch:
            with self.__lock:
                self.__token = self._fetch_token()
        return self.__token

    @abstractmethod
    def _fetch_token(self):
        pass

    def define_endpoint(self, kg_endpoint: str):
        if not self._auth_endpoint and kg_endpoint:
            auth_endpoint_response = requests.get(f"{kg_endpoint}/users/authorization/tokenEndpoint")
            if auth_endpoint_response.status_code == 200:
                auth_endpoint = auth_endpoint_response.json()
                if auth_endpoint and "data" in auth_endpoint and "endpoint" in auth_endpoint["data"] and auth_endpoint["data"]["endpoint"]:
                    self._auth_endpoint = auth_endpoint["data"]["endpoint"]


class SimpleToken(TokenHandler):

    def __init__(self, token: str):
        super(SimpleToken, self).__init__()
        self.__simple_token = token

    def _fetch_token(self):
        return self.__simple_token


class ClientCredentials(TokenHandler):

    def __init__(self, client_id: str, client_secret: str):
        super(ClientCredentials, self).__init__()
        self.__client_id = client_id
        self.__client_secret = client_secret

    def _fetch_token(self):
        if self._auth_endpoint and self.__client_id and self.__client_secret:
            token_response = requests.post(self._auth_endpoint, data={
                "grant_type": "client_credentials",
                "client_id": self.__client_id,
                "client_secret": self.__client_secret
            })
            if token_response.status_code == 200:
                token = token_response.json()
                if token and "access_token" in token:
                    return token["access_token"]
            return None


class KGResult(object):

    def __init__(self, json:dict, request_args:dict, payload):
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
        return self.payload["from"] if "from"  in self.payload else 0


class RequestsWithTokenHandler(ABC):
    def __init__(self, endpoint: str, token_handler: TokenHandler):
        self.token_handler = token_handler
        self.endpoint = endpoint
        self.token_handler.define_endpoint(self.endpoint)

    def _set_headers(self, args, force_refetch: bool):
        if self.token_handler:
            token = self.token_handler.get_token(force_refetch)
            if token:
                args['headers'] = {
                    "Authorization": f"Bearer {token}"
                }

    def _request(self, method: str, path: str, payload, params: dict):
        absolute_path = f"{self.endpoint}{path}"
        args = {
            'method': method,
            'url': absolute_path,
            'params': params
        }
        return self._do_request(args, payload)

    def _do_request(self, args, payload):
        self._set_headers(args, False)
        if payload is not None:
            args['json'] = payload
        r = requests.request(**args)
        if r.status_code == 401:
            self._set_headers(args, True)
            r = requests.request(**args)
        args_clone = deepcopy(args)
        del args_clone["headers"]
        return KGResult(r.json(), args_clone, payload)

    def get(self, path: str, params: dict):
        return self._request("GET", path, None, params)

    def post(self, path: str, payload, params: dict):
        return self._request("POST", path, payload, params)

    def put(self, path: str, payload, params: dict):
        return self._request("PUT", path, payload, params)

    def patch(self, path: str, payload, params: dict):
        return self._request("PATCH", path, payload, params)


class ResponseConfiguration(object):

    def __init__(self, return_payload=True, return_permissions=False, return_alternatives=False, return_embedded=False, return_incoming_links=False, sort_by_label=False):
        self.return_payload = return_payload
        self.return_permissions = return_permissions
        self.return_alternatives = return_alternatives
        self.return_embedded = return_embedded
        self.return_incoming_links = return_incoming_links
        self.sort_by_label = sort_by_label


class Pagination(object):
    def __init__(self, start_from: int = 0, size: int = 50):
        self.start_from = start_from
        self.size = size


class KGv3(RequestsWithTokenHandler):
    KG_VERSION = "v3-beta"

    def __init__(self, host: str, token_handler: TokenHandler):
        super(KGv3, self).__init__(f"https://{host}/{KGv3.KG_VERSION}", token_handler)

    def next_page(self, result:KGResult):
        remaining_items = result.total()-(result.start_from()+result.size())
        if remaining_items>0:
            if result.request_args:
                new_args = deepcopy(result.request_args)
                if not "params" in new_args:
                    new_args["params"] = {}
                new_args["params"]["from"] = result.start_from()+result.size()
                return self._do_request(new_args, result.request_payload)
        return None

    def queries(self, query: dict, stage: Stage):
        return self.post("/queries", query, {"stage": stage})

    def instances(self, stage: Stage, target_type: str, space: str = None, search_by_label: str = None, response_configuration: ResponseConfiguration = ResponseConfiguration(),
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
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
import threading
from abc import ABC, abstractmethod
from copy import deepcopy
from typing import Any, Dict, Optional

import requests

from kg_core.models import KGResult


class TokenHandler(ABC):

    def __init__(self):
        self._auth_endpoint = None
        self.__token = None
        self.__lock = threading.Lock()

    def get_token(self, force_fetch: bool=False) -> Optional[str]:
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


class RequestsWithTokenHandler(ABC):
    def __init__(self, endpoint: str, token_handler: TokenHandler, client_token_handler: TokenHandler=None):
        self.token_handler = token_handler
        self.endpoint = endpoint
        self.token_handler.define_endpoint(self.endpoint)
        self.client_token_handler = client_token_handler
        if self.client_token_handler:
            self.client_token_handler.define_endpoint(self.endpoint)

    def _set_headers(self, args: Dict[str, Any], force_token_fetch: bool):
        if self.token_handler:
            token = self.token_handler.get_token(force_token_fetch)
            if token:
                args['headers'] = {
                    "Authorization": f"Bearer {token}"
                }
            if self.client_token_handler:
                client_token = self.client_token_handler.get_token(force_token_fetch)
                if client_token:
                    args["headers"]["Client-Authorization"] = f"Bearer {client_token}"

    def _request(self, method: str, path: str, payload: Optional[Dict[str, Any]], params: Dict[str, Any]):
        absolute_path = f"{self.endpoint}{path}"
        args: Dict[str, Any] = {
            'method': method,
            'url': absolute_path,
            'params': params
        }
        return self._do_request(args, payload)

    def _do_request(self, args: Dict[str, Any], payload: Optional[Dict[str, Any]]):
        self._set_headers(args, False)
        if payload is not None:
            args['json'] = payload
        r = requests.request(**args)
        if r.status_code == 401:
            self._set_headers(args, True)
            r = requests.request(**args)
        args_clone = deepcopy(args)
        del args_clone["headers"]
        try:
            return KGResult(r.json(), args_clone, payload, r.status_code)
        except ValueError:
            return KGResult(None, args_clone, payload, r.status_code)
            
        
    def get(self, path: str, params: Dict[str, Any]):
        return self._request("GET", path, None, params)

    def post(self, path: str, payload: Optional[Dict[str, Any]], params: Dict[str, Any]):
        return self._request("POST", path, payload, params)

    def put(self, path: str, payload: Dict[str, Any], params: Dict[str, Any]):
        return self._request("PUT", path, payload, params)

    def delete(self, path: str, params: Dict[str, Any]):
        return self._request("DELETE", path, None, params)

    def patch(self, path: str, payload: Dict[str, Any], params: Dict[str, Any]):
        return self._request("PATCH", path, payload, params)

    def next_page(self, result: KGResult):
        remaining_items = result.total() - (result.start_from() + result.size())
        if remaining_items > 0:
            if result.request_args:
                new_args = deepcopy(result.request_args)
                if "params" not in new_args:
                    new_args["params"] = {}
                new_args["params"]["from"] = result.start_from() + result.size()
                return self._do_request(new_args, result.request_payload)
        return None

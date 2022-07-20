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
import threading
from abc import ABC, abstractmethod
from copy import deepcopy
from typing import Any, Dict, Optional

import requests


class TokenHandler(ABC):

    def __init__(self):
        self._auth_endpoint = None
        self._token = None
        self._lock = threading.Lock()

    def get_token(self, force_fetch: bool = False) -> Optional[str]:
        if not self._token or force_fetch:
            with self._lock:
                self._token = self._fetch_token()
        return self._token

    @abstractmethod
    def _fetch_token(self) -> Optional[str]:
        pass

    def define_endpoint(self, kg_endpoint: str):
        if not self._auth_endpoint and kg_endpoint:
            auth_endpoint_response = requests.get(f"{kg_endpoint}/users/authorization/tokenEndpoint")
            if auth_endpoint_response.status_code == 200:
                auth_endpoint = auth_endpoint_response.json()
                if auth_endpoint and "data" in auth_endpoint and "endpoint" in auth_endpoint["data"] and auth_endpoint["data"]["endpoint"]:
                    self._auth_endpoint = auth_endpoint["data"]["endpoint"]


class KGConfig(object):

    def __init__(self, endpoint: str, token_handler: TokenHandler, client_token_handler: Optional[TokenHandler], id_namespace: str):
        self.endpoint = endpoint
        self.token_handler = token_handler
        self.client_token_handler = client_token_handler
        self.id_namespace = id_namespace


class KGRequestWithResponseContext(object):

    def __init__(self, content: Optional[Dict[str, Any]], request_arguments: Optional[Dict[str, Any]], request_payload: Optional[Any], status_code: Optional[int], kg_config: KGConfig):
        self.content = content
        self._request_arguments: Dict[str, Any] = request_arguments or {}
        self._request_payload = request_payload
        self.status_code = status_code
        self.id_namespace = kg_config.id_namespace
        self._kg_config = kg_config

    def copy_context(self, content: dict):
        return KGRequestWithResponseContext(content, None, None, None, self._kg_config)

    def next_page(self, original_start_from: int, original_size: int) -> KGRequestWithResponseContext:
        return GenericRequests(self._kg_config).request(self._define_arguments_for_next_page(original_start_from+original_size, original_size), self._request_payload)

    def _define_arguments_for_next_page(self, new_start_from: int, new_size: int) -> Dict[str, Any]:
        new_arguments = deepcopy(self._request_arguments)
        if "params" not in new_arguments:
            new_arguments["params"] = dict()
        new_arguments["params"]["from"] = new_start_from
        new_arguments["params"]["size"] = new_size
        return new_arguments


class RequestsWithTokenHandler(ABC):
    def __init__(self, kg_config: KGConfig):
        self._kg_config = kg_config
        self._kg_config.token_handler.define_endpoint(self._kg_config.endpoint)
        if self._kg_config.client_token_handler:
            self._kg_config.client_token_handler.define_endpoint(self._kg_config.endpoint)

    def _set_headers(self, args: Dict[str, Any], force_token_fetch: bool):
        if self._kg_config.token_handler:
            token = self._kg_config.token_handler.get_token(force_token_fetch)
            if token:
                args['headers'] = {
                    "Authorization": f"Bearer {token}"
                }
            if self._kg_config.client_token_handler:
                client_token = self._kg_config.client_token_handler.get_token(force_token_fetch)
                if client_token:
                    args["headers"]["Client-Authorization"] = f"Bearer {client_token}"

    def _request(self, method: str, path: str, payload: Optional[Any], params: Dict[str, Any]) -> KGRequestWithResponseContext:
        absolute_path = f"{self._kg_config.endpoint}{path}"
        args: Dict[str, Any] = {
            'method': method,
            'url': absolute_path,
            'params': params
        }
        return self._do_request(args, payload)

    def _do_request(self, args: Dict[str, Any], payload: Optional[Any]) -> KGRequestWithResponseContext:
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
            response: Optional[Dict[str, Any]] = r.json()
        except ValueError:
            response = None
        return KGRequestWithResponseContext(response, args_clone, payload, r.status_code, self._kg_config)

    def _get(self, path: str, params: Dict[str, Any]) -> KGRequestWithResponseContext:
        return self._request("GET", path, None, params)

    def _post(self, path: str, payload: Optional[Any], params: Dict[str, Any]) -> KGRequestWithResponseContext:
        return self._request("POST", path, payload, params)

    def _put(self, path: str, payload: Optional[Any], params: Dict[str, Any]) -> KGRequestWithResponseContext:
        return self._request("PUT", path, payload, params)

    def _delete(self, path: str, params: Any) -> KGRequestWithResponseContext:
        return self._request("DELETE", path, None, params)

    def _patch(self, path: str, payload: Optional[Any], params: Dict[str, Any]) -> KGRequestWithResponseContext:
        return self._request("PATCH", path, payload, params)


class GenericRequests(RequestsWithTokenHandler):
    def __init__(self, config: KGConfig):
        super(GenericRequests, self).__init__(config)

    def request(self, request_arguments: Dict[str, Any], request_payload: Optional[Any]):
        return self._do_request(request_arguments, request_payload)

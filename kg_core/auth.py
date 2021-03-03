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

from kg_core.models import KGResult


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


class RequestsWithTokenHandler(ABC):
    def __init__(self, endpoint: str, token_handler: TokenHandler):
        self.token_handler = token_handler
        self.endpoint = endpoint
        self.token_handler.define_endpoint(self.endpoint)

    def _set_headers(self, args, force_token_fetch: bool):
        if self.token_handler:
            token = self.token_handler.get_token(force_token_fetch)
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

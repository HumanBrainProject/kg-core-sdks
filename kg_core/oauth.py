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
import requests
from kg_core.__communication import TokenHandler


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

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


import time
from typing import Any, Dict, Optional

import requests
from kg_core.__communication import TokenHandler


class SimpleToken(TokenHandler):

    def __init__(self, token: str):
        super(SimpleToken, self).__init__()
        self.__simple_token = token

    def _fetch_token(self) -> str:
        return self.__simple_token


class ClientCredentials(TokenHandler):

    def __init__(self, client_id: str, client_secret: str):
        super(ClientCredentials, self).__init__()
        self.__client_id = client_id
        self.__client_secret = client_secret

    def _fetch_token(self) -> Optional[str]:
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


class DeviceAuthenticationFlow(TokenHandler):
    __poll_interval_in_secs = 1

    def __init__(self, openid_configuration: str, client_id: str):
        super(DeviceAuthenticationFlow, self).__init__()
        self.__client_id = client_id
        well_known_config = requests.get(openid_configuration).json()
        self.__device_auth_endpoint = well_known_config["device_authorization_endpoint"]
        self.__token_endpoint = well_known_config["token_endpoint"]
        self.__refresh_token = None

    def _poll_for_token(self, device_code: str) -> Optional[Dict[str, Any]]:
        response = requests.post(data={"grant_type": "urn:ietf:params:oauth:grant-type:device_code", "client_id": self.__client_id, "device_code": device_code},
                                 url=self.__token_endpoint)
        if response.status_code == 400:
            error = response.json()["error"]
            if error == "expired_token":
                return None
            elif error == "slow_down":
                # The server tells us that we're asking too frequently - let's increase the polling interval by a second
                self.__poll_interval_in_secs += 1
            time.sleep(self.__poll_interval_in_secs)
            # The request hasn't been validated yet
            return self._poll_for_token(device_code)
        elif response.status_code == 200:
            return response.json()
        else:
            return None

    def _get_token_by_refresh_token(self) -> Optional[Dict[str, Any]]:
        response = requests.post(data={"grant_type": "refresh_token", "client_id": self.__client_id, "refresh_token": self.__refresh_token}, url=self.__token_endpoint)
        if response.status_code == 200:
            return response.json()
        else:
            if response.status_code == 401:
                # Reset the refresh token
                self.__refresh_token = None
            return None

    def _device_flow(self) -> Optional[Dict[str, Any]]:
        response = requests.post(data={"client_id": self.__client_id}, url=self.__device_auth_endpoint).json()
        verification_code = response["verification_uri_complete"]
        device_code = response["device_code"]
        print("************************************************************************")
        print(f"To continue, you need to authenticate. To do so, please visit {verification_code}")
        print("*************************************************************************")
        return self._poll_for_token(device_code=device_code)

    def _find_tokens(self) -> Dict[str, Any]:
        result = None
        if self.__refresh_token:
            result = self._get_token_by_refresh_token()
        if not result:
            if not self.__client_id or not self.__device_auth_endpoint or not self.__token_endpoint:
                raise ValueError("Configuration for device authentication flow is incomplete")
            else:
                result = self._device_flow()
                if result:
                    print(f"You are successfully authenticated! Thank you very much!")
                    print("*************************************************************************")
        if not result:
            print(f"Unfortunately, the authentication didn't succeed in time - please try again")
            print("*************************************************************************")
            result = self._find_tokens()
        return result

    def _fetch_token(self) -> Optional[str]:
        result = self._find_tokens()
        if result:
            self.__refresh_token = result["refresh_token"]
            return result["access_token"]
        else:
            return None

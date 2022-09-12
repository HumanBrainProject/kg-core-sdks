/*  Copyright 2022 EBRAINS AISBL
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*  http://www.apache.org/licenses/LICENSE-2.0.
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*
*  This open source software code was developed in part or in whole in the
*  Human Brain Project, funded from the European Union's Horizon 2020
*  Framework Programme for Research and Innovation under
*  Specific Grant Agreements No. 720270, No. 785907, and No. 945539
*  (Human Brain Project SGA1, SGA2 and SGA3).
*/

export class TokenHandler {
    constructor() {
        if (this.constructor === TokenHandler) {
            throw new Error("Class 'TokenHandler' cannot be instantiated");
        }
        this.authEndpoint = null;
        this.token = null;
    }

    fetchToken() {
        throw new Error("Method 'fetchToken()' must be implemented.");
    }
}
export class KGConfig {
    constructor(endpoint, tokenHandler, clientTokenHandler, idNamespace, enableProfiling) {
        this.endpoint = endpoint;
        this.tokenHandler = tokenHandler;
        this.clientTokenHandler = clientTokenHandler;
        this.idNamespace = idNamespace;
        this.enableProfiling = enableProfiling;
    }
}

export class RequestsWithTokenHandler {
    constructor(kgConfig) {
        if (this.constructor === RequestsWithTokenHandler) {
            throw new Error("Class 'RequestsWithTokenHandler' cannot be instantiated");
        }
        this.kgConfig = kgConfig;
        this.kgConfig.tokenHandler.defineEndpoint(this.kgConfig.endpoint);
        if(this.kgConfig.clientTokenHandler) {
            this.kgConfig.clientTokenHandler.defineEndpoint(this.kgConfig.endpoint);
        }
    }

    _setHeaders(args, forceFetchToken) {
        if(this.kgConfig.tokenHandler) {
            const token = this.kgConfig.tokenHandler.getToken(forceFetchToken);
            if(token) {
                args['headers'] = {
                    "Authorization": `"Bearer ${token}`
                };
            }
            if(this.kgConfig.clientTokenHandler) {
                const clientToken = this.kgConfig.clientTokenHandler.getToken(forceFetchToken);
                if(clientToken){
                    args["headers"]["Client-Authorization"] = `Bearer ${client_token}`;
                }
            }
        }
    }

    _request(method, path, payload, params) {
        const absolutePath = `${this.kgConfig.endpoint}${path}`;
        args = {
            'method': method,
            'url': absolutePath,
            'params': params
        }
        return this._doRequest(args, payload);
    }

    async _doRequest(args, payload) {
        this._setHeaders(args, false);
        if(payload) {
            args["json"] = payload;
        }
        let r = await fetch(args); // TODO check how to do this in JS
        if(r.status === 401) {
            this._setHeaders(args, true);
            r = await fetch(args);
        }
        argsClone = {...args};
        delete argsClone["headers"];
        let response = null;
        try {
            response = await r.json();
            if(r.status >= 500) {
                throw new Error(response); //TODO Throw a custom exception (KG Exception)
            }
        } catch(e) {
            response = null;
        }
        return new KGRequestWithResponseContext(response, args_clone, payload, r.status_code, this.kgConfig); //TODO implement KGRequestWithResponseContext
    }

    _get(path, params) {
        return this._request("GET", path, null, params);
    }

    _post(path, payload, params) {
        return this._request("POST", path, payload, params);
    }

    _put(path, payload, params) {
        return this._request("PUT", path, payload, params);
    }

    _delete(path, params) {
        return this._request("DELETE", path, None, params);
    }

    _patch(path, payload, params) {
        return this._request("PATCH", path, payload, params);
    }

}
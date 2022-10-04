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
export class CallableTokenHandler {
    constructor(callable) {
        this._callable = callable;
    }
    fetchToken() {
        return this._callable();
    }
}
export class KGConfig {
    constructor(endpoint, tokenHandler, idNamespace) {
        this.endpoint = endpoint;
        this.tokenHandler = tokenHandler;
        this.idNamespace = idNamespace;
    }
}
export class KGRequestWithResponseContext {
    constructor(kgConfig, content, requestArguments, requestPayload, statusCode) {
        this.kgConfig = kgConfig;
        this.content = content;
        this.requestArguments = requestArguments ? requestArguments : {};
        this.requestPayload = requestPayload;
        this.statusCode = statusCode;
        this.idNamespace = kgConfig.idNamespace;
    }
    copyContext(content) {
        return new KGRequestWithResponseContext(this.kgConfig, content);
    }
    nextPage(originalStartFrom, originalSize) {
        return new GenericRequests(this.kgConfig).request(this._defineArgumentsForNextPage(originalStartFrom + originalSize, originalSize), this.requestPayload);
    }
    _defineArgumentsForNextPage(newStartFrom, newSize) {
        const newArguments = JSON.parse(JSON.stringify(this.requestArguments));
        if (!newArguments["params"]) {
            newArguments["params"] = {};
        }
        newArguments["params"]["from"] = newStartFrom;
        newArguments["params"]["size"] = newSize;
        return newArguments;
    }
}
export class RequestsWithTokenHandler {
    constructor(kgConfig) {
        this.kgConfig = kgConfig;
    }
    _setHeaders(options) {
        if (this.kgConfig.tokenHandler) {
            const token = this.kgConfig.tokenHandler.fetchToken();
            if (token) {
                options.headers = {
                    Authorization: `Bearer ${token}`,
                };
            }
        }
    }
    _request(method, path, payload, params) {
        const absolutePath = `${this.kgConfig.endpoint}${path}`;
        const args = {
            method: method,
            url: absolutePath,
            params: params,
        };
        return this._doRequest(args, payload);
    }
    _buildUrl(url, params) {
        const urlObj = new URL(url);
        if (params instanceof Object) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    const v = typeof value === "string" ? value : JSON.stringify(value);
                    urlObj.searchParams.append(key, v);
                }
            });
        }
        return urlObj;
    }
    async _doRequest(args, payload) {
        const options = {
            method: args.method
        };
        this._setHeaders(options);
        const url = this._buildUrl(args.url, args.params);
        delete args.url;
        if (payload) {
            options.body = JSON.stringify(payload);
        }
        let r = await fetch(url, options);
        if (r.status === 401) {
            this._setHeaders(options);
            r = await fetch(url, options);
        }
        let response = null;
        try {
            response = await r.json();
        }
        catch (e) {
            response = null;
        }
        return new KGRequestWithResponseContext(this.kgConfig, response, args, payload, r.status);
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
        return this._request("DELETE", path, null, params);
    }
    _patch(path, payload, params) {
        return this._request("PATCH", path, payload, params);
    }
}
class GenericRequests extends RequestsWithTokenHandler {
    constructor(config) {
        super(config);
    }
    request(requestArguments, requestPayload) {
        return this._doRequest(requestArguments, requestPayload);
    }
}

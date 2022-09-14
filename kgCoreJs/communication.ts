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

export abstract class TokenHandler {
  authEndpoint: string | null;
  token: string | null;
  constructor() {
    this.authEndpoint = null;
    this.token = null;
  }

  getToken(forceFetch: boolean = false) {
    if (!this.token || forceFetch) {
      this.token = this.fetchToken();
    }
    return this.token;
  }

  abstract fetchToken(): string | null;

  async defineEndpoint(kgEndpoint: string) {
    if (!this.authEndpoint && kgEndpoint) {
      const authEndpointResponse = await fetch(
        `${kgEndpoint}/users/authorization/tokenEndpoint`
      );
      if (authEndpointResponse.status === 200) {
        const authEndpoint = await authEndpointResponse.json();
        if (
          authEndpoint &&
          authEndpoint["data"] &&
          authEndpoint["data"]["endpoint"]
        ) {
          this.authEndpoint = authEndpoint["data"]["endpoint"];
        }
      }
    }
  }
}

export class CallableTokenHandler extends TokenHandler {
  constructor(callable) {
    super();
    this._callable = callable;
  }

  fetchToken() {
    return this._callable();
  }
}

export class KGConfig {
  endpoint: string;
  tokenHandler: TokenHandler;
  clientTokenHandler: TokenHandler | null;
  idNamespace: string;

  constructor(
    endpoint: string,
    tokenHandler: TokenHandler,
    clientTokenHandler: TokenHandler | null,
    idNamespace: string
  ) {
    this.endpoint = endpoint;
    this.tokenHandler = tokenHandler;
    this.clientTokenHandler = clientTokenHandler;
    this.idNamespace = idNamespace;
  }
}

class KGRequestWithResponseContext {
  content: any | null;
  requestArguments: any | null;
  requestPayload: any | null;
  statusCode: number | null;
  idNamespace: string;
  kgConfig: KGConfig;
  constructor(
    content: any | null,
    requestArguments: any | null,
    requestPayload: any | null,
    statusCode: number | null,
    kgConfig: KGConfig
  ) {
    this.content = content;
    this.requestArguments = requestArguments ? requestArguments : {};
    this.requestPayload = requestPayload;
    this.statusCode = statusCode;
    this.idNamespace = kgConfig.idNamespace;
    this.kgConfig = kgConfig;
  }

  copyContext(content: any): KGRequestWithResponseContext {
    return new KGRequestWithResponseContext(
      content,
      null,
      null,
      null,
      this.kgConfig
    );
  }

  nextPage(
    originalStartFrom: number,
    originalSize: number
  ): Promise<KGRequestWithResponseContext> {
    return new GenericRequests(this.kgConfig).request(
      this._defineArgumentsForNextPage(
        originalStartFrom + originalSize,
        originalSize
      ),
      this.requestPayload
    );
  }

  _defineArgumentsForNextPage(newStartFrom: number, newSize: number): any {
    const newArguments = JSON.parse(JSON.stringify(this.requestArguments));
    if (!newArguments["params"]) {
      newArguments["params"] = {};
    }
    newArguments["params"]["from"] = newStartFrom;
    newArguments["params"]["size"] = newSize;
    return newArguments;
  }
}

export abstract class RequestsWithTokenHandler {
  kgConfig: KGConfig;
  constructor(kgConfig: KGConfig) {
    this.kgConfig = kgConfig;
    this.kgConfig.tokenHandler.defineEndpoint(this.kgConfig.endpoint);
    if (this.kgConfig.clientTokenHandler) {
      this.kgConfig.clientTokenHandler.defineEndpoint(this.kgConfig.endpoint);
    }
  }

  _setHeaders(args: any, forceFetchToken: boolean) {
    if (this.kgConfig.tokenHandler) {
      const token = this.kgConfig.tokenHandler.getToken(forceFetchToken);
      if (token) {
        args["headers"] = {
          Authorization: `"Bearer ${token}`,
        };
      }
      if (this.kgConfig.clientTokenHandler) {
        const clientToken =
          this.kgConfig.clientTokenHandler.getToken(forceFetchToken);
        if (clientToken) {
          args["headers"]["Client-Authorization"] = `Bearer ${clientToken}`;
        }
      }
    }
  }

  _request(
    method: string,
    path: string,
    payload: any | null,
    params: any
  ): Promise<KGRequestWithResponseContext> {
    const absolutePath = `${this.kgConfig.endpoint}${path}`;
    const args: any = {
      method: method,
      url: absolutePath,
      params: params,
    };
    return this._doRequest(args, payload);
  }

  async _doRequest(
    args: any,
    payload: any | null
  ): Promise<KGRequestWithResponseContext> {
    this._setHeaders(args, false);
    const url = args["url"];
    delete args["url"];
    if (payload) {
      args["body"] = JSON.stringify(payload);
    }
    let r = await fetch(url, args);
    if (r.status === 401) {
      this._setHeaders(args, true);
      r = await fetch(url, args);
    }
    let response = null;
    try {
      response = await r.json();
    } catch (e) {
      response = null;
    }
    delete args["headers"];
    return new KGRequestWithResponseContext(
      response,
      args,
      payload,
      r.status,
      this.kgConfig
    );
  }

  _get(path: string, params: any): Promise<KGRequestWithResponseContext> {
    return this._request("GET", path, null, params);
  }

  _post(
    path: string,
    payload: any | null,
    params: any
  ): Promise<KGRequestWithResponseContext> {
    return this._request("POST", path, payload, params);
  }

  _put(
    path: string,
    payload: any | null,
    params: any
  ): Promise<KGRequestWithResponseContext> {
    return this._request("PUT", path, payload, params);
  }

  _delete(path: string, params: any): Promise<KGRequestWithResponseContext> {
    return this._request("DELETE", path, null, params);
  }

  _patch(
    path: string,
    payload: any | null,
    params: any
  ): Promise<KGRequestWithResponseContext> {
    return this._request("PATCH", path, payload, params);
  }
}

class GenericRequests extends RequestsWithTokenHandler {
  constructor(config: KGConfig) {
    super(config);
  }

  request(requestArguments: any, requestPayload: any | null) {
    return this._doRequest(requestArguments, requestPayload);
  }
}

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

export interface TokenHandler {
  fetchToken():string|null;
}

export class CallableTokenHandler implements TokenHandler {
  _callable:() => string|null;
  constructor(callable: () => string|null) {
    this._callable = callable;
  }

  fetchToken(): string|null {
      return this._callable();
  }
}
export class KGConfig {
  endpoint: string;
  idNamespace: string;
  tokenHandler: TokenHandler;
  constructor(endpoint: string, tokenHandler: TokenHandler, idNamespace: string) {
    this.endpoint = endpoint;
    this.tokenHandler = tokenHandler;
    this.idNamespace = idNamespace;
  }
}

export class KGRequestWithResponseContext {
  content?: any;
  requestArguments?: any;
  requestPayload?: any;
  statusCode?: number;
  idNamespace: string;
  kgConfig: KGConfig;
  constructor(
    kgConfig: KGConfig,
    content?: any,
    requestArguments?: any,
    requestPayload?: any,
    statusCode?: number,
  ) {
    this.kgConfig = kgConfig;
    this.content = content;
    this.requestArguments = requestArguments ? requestArguments : {};
    this.requestPayload = requestPayload;
    this.statusCode = statusCode;
    this.idNamespace = kgConfig.idNamespace;
  }

  copyContext(content: any): KGRequestWithResponseContext {
    return new KGRequestWithResponseContext(this.kgConfig, content);
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
  }

  _setHeaders(args: any) {
    if (this.kgConfig.tokenHandler) {
      const token = this.kgConfig.tokenHandler.fetchToken();
      if (token) {
        args["headers"] = {
          Authorization: `Bearer ${token}`,
        };
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
    this._setHeaders(args);
    const url = args["url"];
    delete args["url"];
    if (payload) {
      args["body"] = JSON.stringify(payload);
    }
    let r = await fetch(url, args);
    if (r.status === 401) {
      this._setHeaders(args);
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
      this.kgConfig,
      response,
      args,
      payload,
      r.status
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

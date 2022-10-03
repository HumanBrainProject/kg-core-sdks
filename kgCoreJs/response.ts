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
import { KGRequestWithResponseContext } from "./communication";

type UUID = string;

export enum ReleaseStatus {
  RELEASED = "RELEASED",
  UNRELEASED = "UNRELEASED",
  HAS_CHANGED = "HAS_CHANGED",
}
export class JsonLdDocument {
  [index: string]: any;
  idNamespace?: string;
  constructor(json: any, idNamespace?: string) {
    Object.keys(json).forEach((key: string) => {
      this[key] = json[key];
    });
    this.idNamespace = idNamespace;
  }

  toUuid(value: string): UUID | null {
    if (this.idNamespace) {
      if (value && value.startsWith(this.idNamespace)) {
        const r = value.split("/");
        return r[r.length - 1];
      }
    }
    return null;
  }
}

export class Instance extends JsonLdDocument {
  uuid: UUID | null;
  constructor(data: any, idNamespace?: string) {
    super(data, idNamespace);
    this.instanceId = this["@id"] ?? null;
    this.uuid = this.toUuid(this.instanceId);
  }
}

export class TermsOfUse {
  accepted: boolean;
  version: string;
  data: string;
  constructor(data: any) {
    this.accepted = data["accepted"] ?? false;
    this.version = data["version"];
    this.data = data["data"];
  }
}

export class KGError {
  code?: number;
  message?: string;
  uuid?: UUID;
  constructor(
    code?: number,
    message?: string,
    uuid?: UUID
  ) {
    this.code = code;
    this.message = message;
    this.uuid = uuid;
  }
}

export class Scope {
  uuid?: UUID;
  label?: string;
  space?: string;
  types?: Array<string>;
  children?: Array<Scope>;
  permissions?: Array<string>;
  constructor(data: any) {
    this.uuid = data["id"];
    this.label = data["label"];
    this.space = data["space"];
    this.types = data["types"];
    this.children = data["children"];
    this.permissions = data["permissions"];
  }
}

export class SpaceInformation {
  identifier?: string;
  name?: string;
  permissions?: Array<string>;
  constructor(data: any) {
    this.identifier = data["http://schema.org/identifier"];
    this.name = data["http://schema.org/name"];
    this.permissions = data["https://core.kg.ebrains.eu/vocab/meta/permissions"];
  }
}

export class TypeInformation {
  identifier?: string;
  description?: string;
  name?: string;
  occurrences?: number;
  constructor(data: any) {
    this.identifier = data["http://schema.org/identifier"];
    this.description = data["http://schema.org/description"];
    this.name = data["http://schema.org/name"];
    this.occurrences = data["https://core.kg.ebrains.eu/vocab/meta/occurrences"];
  }
}

class ReducedUserInformation {
  alternateName?: string;
  name?: string;
  uuid?: UUID;
  constructor(data: any) {
    this.alternateName = data["http://schema.org/alternateName"];
    this.name = data["http://schema.org/name"];
    this.uuid = data["@id"];
  }
}

export class ListOfUUID extends Array<string> {
  //WARNING: Do not extend this class
  constructor(items: Array<string>) {
    super(...items);
    Object.setPrototypeOf(this, Array.prototype);
  }
}
export class ListOfReducedUserInformation extends Array<ReducedUserInformation> {
  //WARNING: Do not extend this class
  constructor(items: Array<ReducedUserInformation>) {
    super(...items);
    Object.setPrototypeOf(this, Array.prototype);
  }
}
export class User {
  alternateName?: string;
  name?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  identifiers?: Array<string>;
  constructor(user: any) {
    this.alternateName = user["http://schema.org/alternateName"];
    this.name = user["http://schema.org/name"];
    this.email = user["http://schema.org/email"];
    this.givenName = user["http://schema.org/givenName"];
    this.familyName = user["http://schema.org/familyName"];
    this.identifiers = user["http://schema.org/identifier"];
  }
}

class UserWithRoles {
  user: User;
  clientRoles?: Array<string>;
  userRoles?: Array<string>;
  invitations?: Array<string>;
  clientId?: string;
  constructor(
    user: User,
    clientRoles?: Array<string>,
    userRoles?: Array<string>,
    invitations?: Array<string>,
    clientId?: string
  ) {
    this.user = user;
    this.clientRoles = clientRoles;
    this.userRoles = userRoles;
    this.invitations = invitations;
    this.clientId = clientId;
  }
}

export declare class ErrorStatusText {
  [index: number]: string;
}

const errorStatusText: ErrorStatusText = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  421: "Misdirected Request",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  510: "Not Extended",
  511: "Network Authentication Required",
  420: "Method Failure",
  598: "Network read timeout",
  599: "Network Connect Timeout",
  440: "Login Time-out",
  444: "No Response",
  494: "Request header too large",
  495: "SSL Certificate Error",
  496: "SSL Certificate Required",
  497: "HTTP Request Sent to HTTPS Port",
  499: "Client Closed Request"
};

export const translateError = (response: KGRequestWithResponseContext) => {
  if (
    response?.content?.error &&
    !(response.content.error instanceof String)
  ) {
    return new KGError(
      response.statusCode,
      response.content.error,
      response.idNamespace
    );
  } else {
    if (response.statusCode && response.statusCode >= 400) {
      return new KGError(response.statusCode, errorStatusText[response.statusCode]);
    }
  }
  return null;
};

abstract class _AbstractResult {
  message?: string;
  startTime?: number;
  durationInMs?: number;
  transactionId?: number;
  error: KGError | null;
  constructor(response: KGRequestWithResponseContext) {
    this.message = response?.content?.message;
    this.startTime = response?.content?.startTime;
    this.durationInMs = response?.content?.durationInMs;
    this.transactionId = response?.content?.transactionId;
    this.error = translateError(response);
  }
}

class _AbstractResultPage extends _AbstractResult {
  total?: number;
  size?: number;
  startFrom?: number;
  constructor(response: KGRequestWithResponseContext) {
    super(response);
    this.total = response?.content?.total;
    this.size = response?.content?.size;
    this.startFrom = response?.content?.from;
  }
}

class ResponseObjectConstructor {
  static initResponseObject(constructor: any, data: any, idNamespace: any) {
    if (constructor === JsonLdDocument || constructor === Instance) {
      return new constructor(data, idNamespace);
    } else if (constructor === ReleaseStatus) {
      return constructor[data];
    }
    return new constructor(data);
  }
}

class ResultPageIterator<T> implements Iterator<T> {
  resultPage: ResultPage<T> | null;
  private counter: number = 0;
  constructor(resultPage: ResultPage<T> | null) {
    this.resultPage = resultPage;
  }

  next(): IteratorResult<T> {
    if (this.resultPage) {
      if (this.resultPage.error) {
        throw new Error(this.resultPage?.error?.message ?? undefined);
      } else if (this.resultPage.data) {
        if (
          !this.resultPage.total ||
          (this.resultPage.total && this.counter < this.resultPage.total)
        ) {
          if (this.resultPage.startFrom && this.resultPage.size) {
            if (
              this.counter >=
                this.resultPage.startFrom + this.resultPage.size &&
              this.resultPage.hasNextPage()
            ) {
              this.resultPage = this.resultPage.nextPage();
            }
          }
          if (this.resultPage && this.resultPage.startFrom) {
            const result =
              this.resultPage.data[this.counter - this.resultPage.startFrom];
            this.counter++;
            return { value: result, done: false };
          }
        }
      }
    }
    return { value: null, done: true };
  }
}

export class ResultPage<T> extends _AbstractResultPage {
  data: Array<T>;
  _originalResponse: any;
  _originalConstructor: any;
  constructor(response: KGRequestWithResponseContext, constructor: any) {
    super(response);
    this.data = this._getData(
      constructor,
      response.content,
      response.idNamespace
    );
    this._originalResponse = response;
    this._originalConstructor = constructor;
  }

  _getData(constructor:any, content: any, idNamespace:string) {
    if (content?.data) {
      const d: Array<T> = content.data;
      return d.map(c =>
        ResponseObjectConstructor.initResponseObject(
          constructor,
          c,
          idNamespace
        )
      );
    }
    return [];
  }

  nextPage(): ResultPage<T> | null {
    const nextPage = this.hasNextPage();
    if (nextPage === null || nextPage === true) {
      const result = this._originalResponse.nextPage(this.startFrom, this.size);
      const resultPage = new ResultPage<T>(result, this._originalConstructor);

      if (resultPage && resultPage.data) {
        return resultPage;
      }
      return null;
    }
    return null;
  }

  hasNextPage(): boolean | null {
    if (this.total) {
      if (this.startFrom && this.size) {
        return this.startFrom + this.size < this.total;
      }
      return false;
    }
    return null;
  }

  items() {
    return new ResultPageIterator<T>(this);
  }
}

export class Result<T> extends _AbstractResult {
  data: T | null;
  constructor(response: KGRequestWithResponseContext, constructor: any) {
    super(response);
    this.data = response?.content?.data
      ? ResponseObjectConstructor.initResponseObject(
          constructor,
          response.content?.data,
          response.idNamespace
        )
      : null;
  }
}

interface ResultById<T> {
  [index:string]: Result<T>
};

export class ResultsById<T> extends _AbstractResult {
  data: ResultById<T>|null;
  constructor(response: KGRequestWithResponseContext, constructor: any) {
    super(response);
    this.data = response?.content?.data
      ? this._getData(response.content?.data, response, constructor)
      : null;
  }

  _getData(data:any, response:KGRequestWithResponseContext, constructor: any) {
    return Object.entries(data).reduce((newObj, [key, val]) => {
      newObj[key] = new Result<T>(response.copyContext(val), constructor);
      return newObj;
    }, {} as ResultById<T>);
  }
}

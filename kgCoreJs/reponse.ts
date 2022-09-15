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

enum ReleaseStatus {
    RELEASED = "RELEASED",
    UNRELEASED = "UNRELEASED",
    HAS_CHANGED = "HAS_CHANGED"
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
    code:number|null;
    message:string|null;
    uuid: string|null;
    constructor(code:number|null, message:string|null = null, uuid: string|null = null) {
        this.code = code;
        this.message = message;
        this.uuid = uuid;
    }
}

export class Scope {
    uuid: string|null;
    label: string|null;
    space: string|null;
    types: Array<string>|null;
    children: Array<Scope>|null;
    permissions: Array<string>|null;
    constructor(data:any) {
        this.uuid = data["id"] ?? null;
        this.label = data["label"] ?? null;
        this.space = data["space"] ?? null;
        this.types = data["types"] ?? null;
        this.children = data["children"] ?? null;
        this.permissions = data["permissions"] ?? null;
    }
}

export class SpaceInformation {
    identifier: string|null;
    name: string|null;
    permissions: Array<string>|null;
    constructor(data:any) {
        this.identifier = data["http://schema.org/identifier"] ?? null;
        this.name = data["http://schema.org/name"] ?? null;
        this.permissions = data["https://core.kg.ebrains.eu/vocab/meta/permissions"] ?? null;
    }
}

export class TypeInformation {
    identifier: string|null;
    description: string|null;
    name: string|null;
    occurrences: number|null;
    constructor(data: any) {
        this.identifier = data["http://schema.org/identifier"] ?? null;
        this.description = data["http://schema.org/description"] ?? null;
        this.name = data["http://schema.org/name"] ?? null;
        this.occurrences = data["https://core.kg.ebrains.eu/vocab/meta/occurrences"] ?? null;
    }
}

export class ReducedUserInformation {
    alternateName: string|null;
    name: string|null;
    uuid: string|null;
    constructor(data:any) {
        this.alternateName = data["http://schema.org/alternateName"] ?? null;
        this.name = data["http://schema.org/name"] ?? null;
        this.uuid = data["@id"] ?? null;
    }
}

class User {
    alternateName:string|null;
    name:string|null;
    email:string|null;
    givenName:string|null;
    familyName:string|null;
    identifiers:Array<string>|null;
    constructor(user:any) {
        this.alternateName = user["http://schema.org/alternateName"] ?? null;
        this.name = user["http://schema.org/name"] ?? null;
        this.email = user["http://schema.org/email"] ?? null;
        this.givenName = user["http://schema.org/givenName"] ?? null;
        this.familyName = user["http://schema.org/familyName"] ?? null;
        this.identifiers = user["http://schema.org/identifier"] ?? null;
    }
}

class UserWithRoles {
    user: User;
    clientRoles: Array<string>|null;
    userRoles: Array<string>|null;
    invitations: Array<string>|null;
    clientId: string|null;
    constructor(user: User, clientRoles: Array<string>|null = null, userRoles: Array<string>|null = null, invitations:Array<string>|null = null, clientId:string|null = null) {
        this.user = user;
        this.clientRoles = clientRoles;
        this.userRoles = userRoles;
        this.invitations = invitations;
        this.clientId = clientId;
    }
}

export const translateError = (response: KGRequestWithResponseContext) => {
    if(response.content && response.content["error"] && !(response.content["error"] instanceof String)) {
        return new KGError(response.statusCode, response.content["error"], response.idNamespace);
    } else {
        if(response.statusCode && response.statusCode >= 400) {
            return new KGError(response.statusCode) //TODO: check what to do with the message
        }
    }
    return null;
};

abstract class _AbstractResult {
    message: string|null;
    startTime: number|null;
    durationInMs: number|null;
    transactionId: number|null;
    error: KGError|null;
    constructor(response: KGRequestWithResponseContext) {
        this.message = response?.content["message"] ?? null;
        this.startTime = response?.content["startTime"] ?? null;
        this.durationInMs = response?.content["durationInMs"] ?? null;
        this.transactionId = response?.content["transactionId"] ?? null;
        this.error = translateError(response);
    }   
}

class _AbstractResultPage extends _AbstractResult {
    total: number|null;
    size: number|null;
    startFrom: number|null;
    constructor(response: KGRequestWithResponseContext) {
        super(response);
        this.total = response?.content["total"] ?? null;
        this.size = response?.content["size"] ?? null;
        this.startFrom = response?.content["from"] ?? null;
    }
}
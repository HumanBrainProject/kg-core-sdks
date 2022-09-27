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

import { KGConfig, RequestsWithTokenHandler, TokenHandler, CallableTokenHandler } from "./communication";
import { ResponseConfiguration, ExtendedResponseConfiguration, Pagination, Stage, ReleaseTreeScope } from "./request";import { Result, Instance, JsonLdDocument, ResultsById, ResultPage, ReleaseStatus, KGError, translateError, User, Scope, SpaceInformation, TypeInformation, TermsOfUse, ListOfUUID, ListOfReducedUserInformation } from "./response";

const _calculateBaseUrl = (host:string) => `http${host.startsWith('localhost')?'':'s'}://${host}/v3-beta/`;

const _createKgConfig = (host:string, tokenHandler: TokenHandler):KGConfig => new KGConfig(_calculateBaseUrl(host), tokenHandler, "https://kg.ebrains.eu/api/instances/");

class Client {
    instances: Instances;
    jsonld: Jsonld;
    queries: Queries;
    spaces: Spaces;
    types: Types;
    users: Users;
    
    constructor(host:string, tokenHandler: TokenHandler) {
        if(!host) {
            throw new Error("No hostname specified");
        }
        const kgConfig = _createKgConfig(host, tokenHandler);
        this.instances = new Instances(kgConfig);
        this.jsonld = new Jsonld(kgConfig);
        this.queries = new Queries(kgConfig);
        this.spaces = new Spaces(kgConfig);
        this.types = new Types(kgConfig);
        this.users = new Users(kgConfig);
        
    }
}

class Admin extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Assign a type to a space*/
    async assignTypeToSpace(space: string, targetType: string):Promise<KGError|null> {
        const params = { 
            "type": targetType
        };
        const result = await this._put(`spaces/${space}/types`, null, params);
        return translateError(result);
    }

    /*Update invitation scope for this instance*/
    async calculateInstanceInvitationScope(instanceId: string):Promise<KGError|null> {
        const params = {};
        const result = await this._put(`instances/${instanceId}/invitationScope`, null, params);
        return translateError(result);
    }

    /*Explicitly specify a space*/
    async createSpaceDefinition(space: string, autorelease: boolean = false, clientSpace: boolean = false, deferCache: boolean = false):Promise<KGError|null> {
        const params = { 
            "autorelease": autorelease,
            "clientSpace": clientSpace,
            "deferCache": deferCache
        };
        const result = await this._put(`spaces/${space}/specification`, null, params);
        return translateError(result);
    }

    /*Specify a type*/
    async createTypeDefinition(payload: any, targetType: string, isGlobal: boolean|null = null):Promise<KGError|null> {
        const params = { 
            "global": isGlobal,
            "type": targetType
        };
        const result = await this._put("types/specification", payload, params);
        return translateError(result);
    }

    /*Upload a property specification either globally or for the requesting client*/
    async defineProperty(payload: any, propertyName: string, isGlobal: boolean|null = null):Promise<KGError|null> {
        const params = { 
            "global": isGlobal,
            "property": propertyName
        };
        const result = await this._put("properties", payload, params);
        return translateError(result);
    }

    /*Define a property specification either globally for the requesting client*/
    async definePropertyForType(payload: any, propertyName: string, targetType: string, isGlobal: boolean|null = null):Promise<KGError|null> {
        const params = { 
            "global": isGlobal,
            "property": propertyName,
            "type": targetType
        };
        const result = await this._put("propertiesForType", payload, params);
        return translateError(result);
    }

    /*Upload a property specification either globally or for the requesting client*/
    async deprecateProperty(propertyName: string, isGlobal: boolean|null = null):Promise<KGError|null> {
        const params = { 
            "global": isGlobal,
            "property": propertyName
        };
        const result = await this._delete("properties", params);
        return translateError(result);
    }

    /*Deprecate a property specification for a specific type either globally or for the requesting client*/
    async deprecatePropertyForType(propertyName: string, targetType: string, isGlobal: boolean|null = null):Promise<KGError|null> {
        const params = { 
            "global": isGlobal,
            "property": propertyName,
            "type": targetType
        };
        const result = await this._delete("propertiesForType", params);
        return translateError(result);
    }

    
    async getAllRoleDefinitions():Promise<KGError|null> {
        const params = {};
        const result = await this._get("setup/permissions", params);
        return translateError(result);
    }

    
    async getClaimForRole(role: string, space: string|null = null):Promise<KGError|null> {
        const params = { 
            "space": space
        };
        const result = await this._get(`setup/permissions/${role}`, params);
        return translateError(result);
    }

    /*List instances with invitations*/
    async listInstancesWithInvitations():Promise<Result<ListOfUUID>> {
        const params = {};
        const result = await this._get("instancesWithInvitations", params);
        return new Result<ListOfUUID>(result, ListOfUUID);
    }

    
    async registerTermsOfUse(payload: any):Promise<KGError|null> {
        const params = {};
        const result = await this._put("setup/termsOfUse", payload, params);
        return translateError(result);
    }

    /*Remove a space definition*/
    async removeSpaceDefinition(space: string):Promise<KGError|null> {
        const params = {};
        const result = await this._delete(`spaces/${space}/specification`, params);
        return translateError(result);
    }

    /*Remove a type definition*/
    async removeTypeDefinition(isGlobal: boolean|null = null, targetType: string|null = null):Promise<KGError|null> {
        const params = { 
            "type": targetType,
            "global": isGlobal
        };
        const result = await this._delete("types/specification", params);
        return translateError(result);
    }

    /*Remove a type in space definition*/
    async removeTypeFromSpace(space: string, targetType: string):Promise<KGError|null> {
        const params = { 
            "type": targetType
        };
        const result = await this._delete(`spaces/${space}/types`, params);
        return translateError(result);
    }

    /*Trigger a rerun of the events of this space*/
    async rerunEvents(space: string):Promise<KGError|null> {
        const params = {};
        const result = await this._put(`spaces/${space}/eventHistory`, null, params);
        return translateError(result);
    }

    /*Triggers the inference of all documents of the given space*/
    async triggerInference(space: string, identifier: string|null = null, isAsync: boolean = false):Promise<KGError|null> {
        const params = { 
            "identifier": identifier,
            "async": isAsync
        };
        const result = await this._post(`spaces/${space}/inference`, null, params);
        return translateError(result);
    }

    
    async updateClaimForRole(payload: any, remove: boolean, role: string, space: string|null = null):Promise<KGError|null> {
        const params = { 
            "space": space,
            "remove": remove
        };
        const result = await this._patch(`setup/permissions/${role}`, payload, params);
        return translateError(result);
    }

}

class Instances extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Replace contribution to an existing instance*/
    async contributeToFullReplacement(payload: any, instanceId: string, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Promise<Result<Instance>> {
        const params = { 
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        };
        const result = await this._put(`instances/${instanceId}`, payload, params);
        return new Result<Instance>(result, Instance);
    }

    /*Partially update contribution to an existing instance*/
    async contributeToPartialReplacement(payload: any, instanceId: string, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Promise<Result<Instance>> {
        const params = { 
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        };
        const result = await this._patch(`instances/${instanceId}`, payload, params);
        return new Result<Instance>(result, Instance);
    }

    /*Create new instance with a system generated id*/
    async createNew(payload: any, space: string, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Promise<Result<Instance>> {
        const params = { 
            "space": space,
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        };
        const result = await this._post("instances", payload, params);
        return new Result<Instance>(result, Instance);
    }

    /*Create new instance with a client defined id*/
    async createNewWithId(payload: any, instanceId: string, space: string, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Promise<Result<Instance>> {
        const params = { 
            "space": space,
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        };
        const result = await this._post(`instances/${instanceId}`, payload, params);
        return new Result<Instance>(result, Instance);
    }

    /*Delete an instance*/
    async delete(instanceId: string):Promise<KGError|null> {
        const params = {};
        const result = await this._delete(`instances/${instanceId}`, params);
        return translateError(result);
    }

    /*Get the instance*/
    async getById(instanceId: string, stage: Stage = Stage.RELEASED, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Promise<Result<Instance>> {
        const params = { 
            "stage": stage,
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        };
        const result = await this._get(`instances/${instanceId}`, params);
        return new Result<Instance>(result, Instance);
    }

    /*Read instances by the given list of (external) identifiers*/
    async getByIdentifiers(payload: any, stage: Stage = Stage.RELEASED, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Promise<ResultsById<Instance>> {
        const params = { 
            "stage": stage,
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        };
        const result = await this._post("instancesByIdentifiers", payload, params);
        return new ResultsById<Instance>(result, Instance);
    }

    /*Bulk operation of /instances/{id} to read instances by their UUIDs*/
    async getByIds(payload: any, stage: Stage = Stage.RELEASED, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Promise<ResultsById<Instance>> {
        const params = { 
            "stage": stage,
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        };
        const result = await this._post("instancesByIds", payload, params);
        return new ResultsById<Instance>(result, Instance);
    }

    /*Get incoming links for a specific instance (paginated)*/
    async getIncomingLinks(instanceId: string, propertyName: string, targetType: string, stage: Stage = Stage.RELEASED, pagination: Pagination = new Pagination()):Promise<ResultPage<Instance>> {
        const params = { 
            "stage": stage,
            "property": propertyName,
            "type": targetType,
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults
        };
        const result = await this._get(`instances/${instanceId}/incomingLinks`, params);
        return new ResultPage<Instance>(result, Instance);
    }

    /*Get the release status for an instance*/
    async getReleaseStatus(instanceId: string, releaseTreeScope: ReleaseTreeScope):Promise<Result<ReleaseStatus>> {
        const params = { 
            "releaseTreeScope": releaseTreeScope
        };
        const result = await this._get(`instances/${instanceId}/release/status`, params);
        return new Result<ReleaseStatus>(result, ReleaseStatus);
    }

    /*Get the release status for multiple instances*/
    async getReleaseStatusByIds(payload: any, releaseTreeScope: ReleaseTreeScope):Promise<ResultsById<ReleaseStatus>> {
        const params = { 
            "releaseTreeScope": releaseTreeScope
        };
        const result = await this._post("instancesByIds/release/status", payload, params);
        return new ResultsById<ReleaseStatus>(result, ReleaseStatus);
    }

    /*Get the scope for the instance by its KG-internal ID*/
    async getScope(instanceId: string, applyRestrictions: boolean = false, returnPermissions: boolean = false, stage: Stage = Stage.RELEASED):Promise<Result<Scope>> {
        const params = { 
            "stage": stage,
            "returnPermissions": returnPermissions,
            "applyRestrictions": applyRestrictions
        };
        const result = await this._get(`instances/${instanceId}/scope`, params);
        return new Result<Scope>(result, Scope);
    }

    /*Create or update an invitation for the given user to review the given instance*/
    async inviteUserFor(instanceId: string, userId: string):Promise<KGError|null> {
        const params = {};
        const result = await this._put(`instances/${instanceId}/invitedUsers/${userId}`, null, params);
        return translateError(result);
    }

    /*Returns a list of instances according to their types*/
    async list(targetType: string, filterProperty: string|null = null, filterValue: string|null = null, searchByLabel: string|null = null, space: string|null = null, stage: Stage = Stage.RELEASED, responseConfiguration: ResponseConfiguration = new ResponseConfiguration(), pagination: Pagination = new Pagination()):Promise<ResultPage<Instance>> {
        const params = { 
            "stage": stage,
            "type": targetType,
            "space": space,
            "searchByLabel": searchByLabel,
            "filterProperty": filterProperty,
            "filterValue": filterValue,
            "returnPayload": responseConfiguration.returnPayload,
            "returnPermissions": responseConfiguration.returnPermissions,
            "returnAlternatives": responseConfiguration.returnAlternatives,
            "returnEmbedded": responseConfiguration.returnEmbedded,
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults
        };
        const result = await this._get("instances", params);
        return new ResultPage<Instance>(result, Instance);
    }

    /*List invitations for review for the given instance*/
    async listInvitations(instanceId: string):Promise<Result<ListOfReducedUserInformation>> {
        const params = {};
        const result = await this._get(`instances/${instanceId}/invitedUsers`, params);
        return new Result<ListOfReducedUserInformation>(result, ListOfReducedUserInformation);
    }

    /*Move an instance to another space*/
    async move(instanceId: string, space: string, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Promise<Result<Instance>> {
        const params = { 
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        };
        const result = await this._put(`instances/${instanceId}/spaces/${space}`, null, params);
        return new Result<Instance>(result, Instance);
    }

    /*Release or re-release an instance*/
    async release(instanceId: string, revision: string|null = null):Promise<KGError|null> {
        const params = { 
            "revision": revision
        };
        const result = await this._put(`instances/${instanceId}/release`, null, params);
        return translateError(result);
    }

    /*Revoke an invitation for the given user to review the given instance*/
    async revokeUserInvitation(instanceId: string, userId: string):Promise<KGError|null> {
        const params = {};
        const result = await this._delete(`instances/${instanceId}/invitedUsers/${userId}`, params);
        return translateError(result);
    }

    /*Unrelease an instance*/
    async unrelease(instanceId: string):Promise<KGError|null> {
        const params = {};
        const result = await this._delete(`instances/${instanceId}/release`, params);
        return translateError(result);
    }

}

class Jsonld extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Normalizes the passed payload according to the EBRAINS KG conventions*/
    async normalizePayload(payload: any):Promise<KGError|null> {
        const params = {};
        const result = await this._post("jsonld/normalizedPayload", payload, params);
        return translateError(result);
    }

}

class Queries extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Execute a stored query to receive the instances*/
    async executeQueryById(queryId: string, additionalRequestParams: any = {}, instanceId: string|null = null, restrictToSpaces: Array<string>|null = null, stage: Stage = Stage.RELEASED, pagination: Pagination = new Pagination()):Promise<ResultPage<JsonLdDocument>> {
        const params = { 
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults,
            "stage": stage,
            "instanceId": instanceId,
            "restrictToSpaces": restrictToSpaces,
            "additionalRequestParams": additionalRequestParams
        };
        const result = await this._get(`queries/${queryId}/instances`, params);
        return new ResultPage<JsonLdDocument>(result, JsonLdDocument);
    }

    /*Get the query specification with the given query id in a specific space*/
    async getQuerySpecification(queryId: string):Promise<Result<Instance>> {
        const params = {};
        const result = await this._get(`queries/${queryId}`, params);
        return new Result<Instance>(result, Instance);
    }

    /*List the queries and filter them by root type and/or text in the label, name or description*/
    async listPerRootType(search: string|null = null, targetType: string|null = null, pagination: Pagination = new Pagination()):Promise<ResultPage<Instance>> {
        const params = { 
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults,
            "type": targetType,
            "search": search
        };
        const result = await this._get("queries", params);
        return new ResultPage<Instance>(result, Instance);
    }

    /*Remove a query specification*/
    async removeQuery(queryId: string):Promise<KGError|null> {
        const params = {};
        const result = await this._delete(`queries/${queryId}`, params);
        return translateError(result);
    }

    /*Create or save a query specification*/
    async saveQuery(payload: any, queryId: string, space: string|null = null):Promise<Result<Instance>> {
        const params = { 
            "space": space
        };
        const result = await this._put(`queries/${queryId}`, payload, params);
        return new Result<Instance>(result, Instance);
    }

    /*Execute the query in the payload in test mode (e.g. for execution before saving with the KG QueryBuilder)*/
    async testQuery(payload: any, additionalRequestParams: any = {}, instanceId: string|null = null, restrictToSpaces: Array<string>|null = null, stage: Stage = Stage.RELEASED, pagination: Pagination = new Pagination()):Promise<ResultPage<JsonLdDocument>> {
        const params = { 
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults,
            "stage": stage,
            "instanceId": instanceId,
            "restrictToSpaces": restrictToSpaces,
            "additionalRequestParams": additionalRequestParams
        };
        const result = await this._post("queries", payload, params);
        return new ResultPage<JsonLdDocument>(result, JsonLdDocument);
    }

}

class Spaces extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    
    async get(space: string, permissions: boolean = false):Promise<Result<SpaceInformation>> {
        const params = { 
            "permissions": permissions
        };
        const result = await this._get(`spaces/${space}`, params);
        return new Result<SpaceInformation>(result, SpaceInformation);
    }

    
    async list(permissions: boolean = false, pagination: Pagination = new Pagination()):Promise<ResultPage<SpaceInformation>> {
        const params = { 
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults,
            "permissions": permissions
        };
        const result = await this._get("spaces", params);
        return new ResultPage<SpaceInformation>(result, SpaceInformation);
    }

}

class Types extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Returns the types according to the list of names - either with property information or without*/
    async getByName(payload: any, space: string|null = null, stage: Stage = Stage.RELEASED, withIncomingLinks: boolean = false, withProperties: boolean = false):Promise<ResultsById<TypeInformation>> {
        const params = { 
            "stage": stage,
            "withProperties": withProperties,
            "withIncomingLinks": withIncomingLinks,
            "space": space
        };
        const result = await this._post("typesByName", payload, params);
        return new ResultsById<TypeInformation>(result, TypeInformation);
    }

    /*Returns the types available - either with property information or without*/
    async list(space: string|null = null, stage: Stage = Stage.RELEASED, withIncomingLinks: boolean = false, withProperties: boolean = false, pagination: Pagination = new Pagination()):Promise<ResultPage<TypeInformation>> {
        const params = { 
            "stage": stage,
            "space": space,
            "withProperties": withProperties,
            "withIncomingLinks": withIncomingLinks,
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults
        };
        const result = await this._get("types", params);
        return new ResultPage<TypeInformation>(result, TypeInformation);
    }

}

class Users extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Accept the terms of use in the given version*/
    async acceptTermsOfUse(version: string):Promise<KGError|null> {
        const params = {};
        const result = await this._post(`users/termsOfUse/${version}/accept`, null, params);
        return translateError(result);
    }

    /*Get the endpoint of the openid configuration*/
    async getOpenIdConfigUrl():Promise<Result<JsonLdDocument>> {
        const params = {};
        const result = await this._get("users/authorization/config", params);
        return new Result<JsonLdDocument>(result, JsonLdDocument);
    }

    /*Get the current terms of use*/
    async getTermsOfUse():Promise<TermsOfUse|null> {
        const params = {};
        const result = await this._get("users/termsOfUse", params);
        return result.content?new TermsOfUse(result.content):null;
    }

    /*Retrieve user information from the passed token (including detailed information such as e-mail address)*/
    async myInfo():Promise<Result<User>> {
        const params = {};
        const result = await this._get("users/me", params);
        return new Result<User>(result, User);
    }

}


class ClientBuilder {
    _hostName: string;
    _tokenHandler?: TokenHandler; 
    constructor(hostName: string) {
        this._tokenHandler = undefined;
        this._hostName = hostName;
    }

    _resolveTokenHandler(): TokenHandler | undefined{
        return this._tokenHandler;
    }

    withCustomTokenProvider(tokenProvider: () => string): ClientBuilder {
        this._tokenHandler = new CallableTokenHandler(tokenProvider);
        return this;
    }
    
    build():Client {
        return new Client(this._hostName, this._resolveTokenHandler());
    }

    buildAdmin():Admin {
        return new Admin(_createKgConfig(this._hostName, this._resolveTokenHandler()));
    }
    
}

export const kg = (host:string = "core.kg.ebrains.eu"):ClientBuilder => new ClientBuilder(host);

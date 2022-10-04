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
import { KGConfig, RequestsWithTokenHandler, CallableTokenHandler } from "./communication";
import { ResponseConfiguration, ExtendedResponseConfiguration, Pagination, Stage } from "./request";
import { Result, Instance, JsonLdDocument, ResultsById, ResultPage, ReleaseStatus, translateError, User, Scope, SpaceInformation, TypeInformation, TermsOfUse, ListOfUUID, ListOfReducedUserInformation } from "./response";
const _calculateBaseUrl = (host) => `http${host.startsWith('localhost') ? '' : 's'}://${host}/v3-beta/`;
const _createKgConfig = (host, tokenHandler) => new KGConfig(_calculateBaseUrl(host), tokenHandler, "https://kg.ebrains.eu/api/instances/");
export class Client {
    constructor(host, tokenHandler) {
        if (!host) {
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
export class Admin extends RequestsWithTokenHandler {
    constructor(config) {
        super(config);
    }
    /*Assign a type to a space*/
    async assignTypeToSpace(space, targetType) {
        const params = {
            "type": targetType
        };
        const result = await this._put(`spaces/${space}/types`, null, params);
        return translateError(result);
    }
    /*Update invitation scope for this instance*/
    async calculateInstanceInvitationScope(instanceId) {
        const params = {};
        const result = await this._put(`instances/${instanceId}/invitationScope`, null, params);
        return translateError(result);
    }
    /*Explicitly specify a space*/
    async createSpaceDefinition(space, autorelease = false, clientSpace = false, deferCache = false) {
        const params = {
            "autorelease": autorelease,
            "clientSpace": clientSpace,
            "deferCache": deferCache
        };
        const result = await this._put(`spaces/${space}/specification`, null, params);
        return translateError(result);
    }
    /*Specify a type*/
    async createTypeDefinition(payload, targetType, isGlobal = null) {
        const params = {
            "global": isGlobal,
            "type": targetType
        };
        const result = await this._put("types/specification", payload, params);
        return translateError(result);
    }
    /*Upload a property specification either globally or for the requesting client*/
    async defineProperty(payload, propertyName, isGlobal = null) {
        const params = {
            "global": isGlobal,
            "property": propertyName
        };
        const result = await this._put("properties", payload, params);
        return translateError(result);
    }
    /*Define a property specification either globally for the requesting client*/
    async definePropertyForType(payload, propertyName, targetType, isGlobal = null) {
        const params = {
            "global": isGlobal,
            "property": propertyName,
            "type": targetType
        };
        const result = await this._put("propertiesForType", payload, params);
        return translateError(result);
    }
    /*Upload a property specification either globally or for the requesting client*/
    async deprecateProperty(propertyName, isGlobal = null) {
        const params = {
            "global": isGlobal,
            "property": propertyName
        };
        const result = await this._delete("properties", params);
        return translateError(result);
    }
    /*Deprecate a property specification for a specific type either globally or for the requesting client*/
    async deprecatePropertyForType(propertyName, targetType, isGlobal = null) {
        const params = {
            "global": isGlobal,
            "property": propertyName,
            "type": targetType
        };
        const result = await this._delete("propertiesForType", params);
        return translateError(result);
    }
    async getAllRoleDefinitions() {
        const params = {};
        const result = await this._get("setup/permissions", params);
        return translateError(result);
    }
    async getClaimForRole(role, space = null) {
        const params = {
            "space": space
        };
        const result = await this._get(`setup/permissions/${role}`, params);
        return translateError(result);
    }
    /*List instances with invitations*/
    async listInstancesWithInvitations() {
        const params = {};
        const result = await this._get("instancesWithInvitations", params);
        return new Result(result, ListOfUUID);
    }
    async registerTermsOfUse(payload) {
        const params = {};
        const result = await this._put("setup/termsOfUse", payload, params);
        return translateError(result);
    }
    /*Remove a space definition*/
    async removeSpaceDefinition(space) {
        const params = {};
        const result = await this._delete(`spaces/${space}/specification`, params);
        return translateError(result);
    }
    /*Remove a type definition*/
    async removeTypeDefinition(isGlobal = null, targetType = null) {
        const params = {
            "type": targetType,
            "global": isGlobal
        };
        const result = await this._delete("types/specification", params);
        return translateError(result);
    }
    /*Remove a type in space definition*/
    async removeTypeFromSpace(space, targetType) {
        const params = {
            "type": targetType
        };
        const result = await this._delete(`spaces/${space}/types`, params);
        return translateError(result);
    }
    /*Trigger a rerun of the events of this space*/
    async rerunEvents(space) {
        const params = {};
        const result = await this._put(`spaces/${space}/eventHistory`, null, params);
        return translateError(result);
    }
    /*Triggers the inference of all documents of the given space*/
    async triggerInference(space, identifier = null, isAsync = false) {
        const params = {
            "identifier": identifier,
            "async": isAsync
        };
        const result = await this._post(`spaces/${space}/inference`, null, params);
        return translateError(result);
    }
    async updateClaimForRole(payload, remove, role, space = null) {
        const params = {
            "space": space,
            "remove": remove
        };
        const result = await this._patch(`setup/permissions/${role}`, payload, params);
        return translateError(result);
    }
}
export class Instances extends RequestsWithTokenHandler {
    constructor(config) {
        super(config);
    }
    /*Replace contribution to an existing instance*/
    async contributeToFullReplacement(payload, instanceId, extendedResponseConfiguration = new ExtendedResponseConfiguration()) {
        const params = {
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        };
        const result = await this._put(`instances/${instanceId}`, payload, params);
        return new Result(result, Instance);
    }
    /*Partially update contribution to an existing instance*/
    async contributeToPartialReplacement(payload, instanceId, extendedResponseConfiguration = new ExtendedResponseConfiguration()) {
        const params = {
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        };
        const result = await this._patch(`instances/${instanceId}`, payload, params);
        return new Result(result, Instance);
    }
    /*Create new instance with a system generated id*/
    async createNew(payload, space, extendedResponseConfiguration = new ExtendedResponseConfiguration()) {
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
        return new Result(result, Instance);
    }
    /*Create new instance with a client defined id*/
    async createNewWithId(payload, instanceId, space, extendedResponseConfiguration = new ExtendedResponseConfiguration()) {
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
        return new Result(result, Instance);
    }
    /*Delete an instance*/
    async delete(instanceId) {
        const params = {};
        const result = await this._delete(`instances/${instanceId}`, params);
        return translateError(result);
    }
    /*Get the instance*/
    async getById(instanceId, stage = Stage.RELEASED, extendedResponseConfiguration = new ExtendedResponseConfiguration()) {
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
        return new Result(result, Instance);
    }
    /*Read instances by the given list of (external) identifiers*/
    async getByIdentifiers(payload, stage = Stage.RELEASED, extendedResponseConfiguration = new ExtendedResponseConfiguration()) {
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
        return new ResultsById(result, Instance);
    }
    /*Bulk operation of /instances/{id} to read instances by their UUIDs*/
    async getByIds(payload, stage = Stage.RELEASED, extendedResponseConfiguration = new ExtendedResponseConfiguration()) {
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
        return new ResultsById(result, Instance);
    }
    /*Get incoming links for a specific instance (paginated)*/
    async getIncomingLinks(instanceId, propertyName, targetType, stage = Stage.RELEASED, pagination = new Pagination()) {
        const params = {
            "stage": stage,
            "property": propertyName,
            "type": targetType,
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults
        };
        const result = await this._get(`instances/${instanceId}/incomingLinks`, params);
        return new ResultPage(result, Instance);
    }
    /*Get the release status for an instance*/
    async getReleaseStatus(instanceId, releaseTreeScope) {
        const params = {
            "releaseTreeScope": releaseTreeScope
        };
        const result = await this._get(`instances/${instanceId}/release/status`, params);
        return new Result(result, ReleaseStatus);
    }
    /*Get the release status for multiple instances*/
    async getReleaseStatusByIds(payload, releaseTreeScope) {
        const params = {
            "releaseTreeScope": releaseTreeScope
        };
        const result = await this._post("instancesByIds/release/status", payload, params);
        return new ResultsById(result, ReleaseStatus);
    }
    /*Get the scope for the instance by its KG-internal ID*/
    async getScope(instanceId, applyRestrictions = false, returnPermissions = false, stage = Stage.RELEASED) {
        const params = {
            "stage": stage,
            "returnPermissions": returnPermissions,
            "applyRestrictions": applyRestrictions
        };
        const result = await this._get(`instances/${instanceId}/scope`, params);
        return new Result(result, Scope);
    }
    /*Create or update an invitation for the given user to review the given instance*/
    async inviteUserFor(instanceId, userId) {
        const params = {};
        const result = await this._put(`instances/${instanceId}/invitedUsers/${userId}`, null, params);
        return translateError(result);
    }
    /*Returns a list of instances according to their types*/
    async list(targetType, filterProperty = null, filterValue = null, searchByLabel = null, space = null, stage = Stage.RELEASED, responseConfiguration = new ResponseConfiguration(), pagination = new Pagination()) {
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
        return new ResultPage(result, Instance);
    }
    /*List invitations for review for the given instance*/
    async listInvitations(instanceId) {
        const params = {};
        const result = await this._get(`instances/${instanceId}/invitedUsers`, params);
        return new Result(result, ListOfReducedUserInformation);
    }
    /*Move an instance to another space*/
    async move(instanceId, space, extendedResponseConfiguration = new ExtendedResponseConfiguration()) {
        const params = {
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        };
        const result = await this._put(`instances/${instanceId}/spaces/${space}`, null, params);
        return new Result(result, Instance);
    }
    /*Release or re-release an instance*/
    async release(instanceId, revision = null) {
        const params = {
            "revision": revision
        };
        const result = await this._put(`instances/${instanceId}/release`, null, params);
        return translateError(result);
    }
    /*Revoke an invitation for the given user to review the given instance*/
    async revokeUserInvitation(instanceId, userId) {
        const params = {};
        const result = await this._delete(`instances/${instanceId}/invitedUsers/${userId}`, params);
        return translateError(result);
    }
    /*Unrelease an instance*/
    async unrelease(instanceId) {
        const params = {};
        const result = await this._delete(`instances/${instanceId}/release`, params);
        return translateError(result);
    }
}
export class Jsonld extends RequestsWithTokenHandler {
    constructor(config) {
        super(config);
    }
    /*Normalizes the passed payload according to the EBRAINS KG conventions*/
    async normalizePayload(payload) {
        const params = {};
        const result = await this._post("jsonld/normalizedPayload", payload, params);
        return translateError(result);
    }
}
export class Queries extends RequestsWithTokenHandler {
    constructor(config) {
        super(config);
    }
    /*Execute a stored query to receive the instances*/
    async executeQueryById(queryId, additionalRequestParams = {}, instanceId = null, restrictToSpaces = null, stage = Stage.RELEASED, pagination = new Pagination()) {
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
        return new ResultPage(result, JsonLdDocument);
    }
    /*Get the query specification with the given query id in a specific space*/
    async getQuerySpecification(queryId) {
        const params = {};
        const result = await this._get(`queries/${queryId}`, params);
        return new Result(result, Instance);
    }
    /*List the queries and filter them by root type and/or text in the label, name or description*/
    async listPerRootType(search = null, targetType = null, pagination = new Pagination()) {
        const params = {
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults,
            "type": targetType,
            "search": search
        };
        const result = await this._get("queries", params);
        return new ResultPage(result, Instance);
    }
    /*Remove a query specification*/
    async removeQuery(queryId) {
        const params = {};
        const result = await this._delete(`queries/${queryId}`, params);
        return translateError(result);
    }
    /*Create or save a query specification*/
    async saveQuery(payload, queryId, space = null) {
        const params = {
            "space": space
        };
        const result = await this._put(`queries/${queryId}`, payload, params);
        return new Result(result, Instance);
    }
    /*Execute the query in the payload in test mode (e.g. for execution before saving with the KG QueryBuilder)*/
    async testQuery(payload, additionalRequestParams = {}, instanceId = null, restrictToSpaces = null, stage = Stage.RELEASED, pagination = new Pagination()) {
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
        return new ResultPage(result, JsonLdDocument);
    }
}
export class Spaces extends RequestsWithTokenHandler {
    constructor(config) {
        super(config);
    }
    async get(space, permissions = false) {
        const params = {
            "permissions": permissions
        };
        const result = await this._get(`spaces/${space}`, params);
        return new Result(result, SpaceInformation);
    }
    async list(permissions = false, pagination = new Pagination()) {
        const params = {
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults,
            "permissions": permissions
        };
        const result = await this._get("spaces", params);
        return new ResultPage(result, SpaceInformation);
    }
}
export class Types extends RequestsWithTokenHandler {
    constructor(config) {
        super(config);
    }
    /*Returns the types according to the list of names - either with property information or without*/
    async getByName(payload, space = null, stage = Stage.RELEASED, withIncomingLinks = false, withProperties = false) {
        const params = {
            "stage": stage,
            "withProperties": withProperties,
            "withIncomingLinks": withIncomingLinks,
            "space": space
        };
        const result = await this._post("typesByName", payload, params);
        return new ResultsById(result, TypeInformation);
    }
    /*Returns the types available - either with property information or without*/
    async list(space = null, stage = Stage.RELEASED, withIncomingLinks = false, withProperties = false, pagination = new Pagination()) {
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
        return new ResultPage(result, TypeInformation);
    }
}
export class Users extends RequestsWithTokenHandler {
    constructor(config) {
        super(config);
    }
    /*Accept the terms of use in the given version*/
    async acceptTermsOfUse(version) {
        const params = {};
        const result = await this._post(`users/termsOfUse/${version}/accept`, null, params);
        return translateError(result);
    }
    /*Get the endpoint of the openid configuration*/
    async getOpenIdConfigUrl() {
        const params = {};
        const result = await this._get("users/authorization/config", params);
        return new Result(result, JsonLdDocument);
    }
    /*Get the current terms of use*/
    async getTermsOfUse() {
        const params = {};
        const result = await this._get("users/termsOfUse", params);
        return result.content ? new TermsOfUse(result.content) : null;
    }
    /*Retrieve user information from the passed token (including detailed information such as e-mail address)*/
    async myInfo() {
        const params = {};
        const result = await this._get("users/me", params);
        return new Result(result, User);
    }
}
class ClientBuilder {
    constructor(hostName) {
        this._tokenHandler = null;
        this._hostName = hostName;
    }
    _resolveTokenHandler() {
        return this._tokenHandler;
    }
    withCustomTokenProvider(tokenProvider) {
        this._tokenHandler = new CallableTokenHandler(tokenProvider);
        return this;
    }
    build() {
        return new Client(this._hostName, this._resolveTokenHandler());
    }
    buildAdmin() {
        return new Admin(_createKgConfig(this._hostName, this._resolveTokenHandler()));
    }
}
export const kg = (host = "core.kg.ebrains.eu") => new ClientBuilder(host);

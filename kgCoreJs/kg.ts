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

import { SimpleToken, ClientCredentials } from "./oauth";
import { KGConfig, CallableTokenHandler, TokenHandler, RequestsWithTokenHandler } from "./communication";
import { ResponseConfiguration, ExtendedResponseConfiguration, Pagination, Stage, ReleaseTreeScope } from "./request";


const _calculateBaseUrl = (host:string) => `http${host.startsWith('localhost')?'':'s'}://${host}/v3-beta/`;


const _createKgConfig = (host:string, tokenHandler: TokenHandler, clientTokenHandler: TokenHandler | null = null):KGConfig => new KGConfig(_calculateBaseUrl(host), tokenHandler, clientTokenHandler, "https://kg.ebrains.eu/api/instances/");

class Client {
    constructor(host:string, tokenHandler: TokenHandler, clientTokenHandler: TokenHandler | null = null) {
        if(!host) {
            throw new Error("No hostname specified");
        } else if(!tokenHandler) {
            throw new Error("No token provided");
        }
        const kgConfig = _createKgConfig(host, tokenHandler, clientTokenHandler);
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
    assignTypeToSpace(space: string, targetType: string):Error|null {
        const params = { 
            "type": targetType
        }
        const result = this._put(`spaces/${space}/types`, null, params);
        return result;
        //return translate_error(result)
    }

    /*Update invitation scope for this instance*/
    calculateInstanceInvitationScope(instanceId: string):Error|null {
        const params = {}
        const result = this._put(`instances/${instanceId}/invitationScope`, null, params);
        return result;
        //return translate_error(result)
    }

    /*Explicitly specify a space*/
    createSpaceDefinition(space: string, autorelease: boolean = false, clientSpace: boolean = false, deferCache: boolean = false):Error|null {
        const params = { 
            "autorelease": autorelease,
            "clientSpace": clientSpace,
            "deferCache": deferCache
        }
        const result = this._put(`spaces/${space}/specification`, null, params);
        return result;
        //return translate_error(result)
    }

    /*Specify a type*/
    createTypeDefinition(payload: any, targetType: string, isGlobal: boolean|null = null):Error|null {
        const params = { 
            "global": isGlobal,
            "type": targetType
        }
        const result = this._put("types/specification", payload, params);
        return result;
        //return translate_error(result)
    }

    /*Upload a property specification either globally or for the requesting client*/
    defineProperty(payload: any, propertyName: string, isGlobal: boolean|null = null):Error|null {
        const params = { 
            "global": isGlobal,
            "property": propertyName
        }
        const result = this._put("properties", payload, params);
        return result;
        //return translate_error(result)
    }

    /*Define a property specification either globally for the requesting client*/
    definePropertyForType(payload: any, propertyName: string, targetType: string, isGlobal: boolean|null = null):Error|null {
        const params = { 
            "global": isGlobal,
            "property": propertyName,
            "type": targetType
        }
        const result = this._put("propertiesForType", payload, params);
        return result;
        //return translate_error(result)
    }

    /*Upload a property specification either globally or for the requesting client*/
    deprecateProperty(propertyName: string, isGlobal: boolean|null = null):Error|null {
        const params = { 
            "global": isGlobal,
            "property": propertyName
        }
        const result = this._delete("properties", params);
        return result;
        //return translate_error(result)
    }

    /*Deprecate a property specification for a specific type either globally or for the requesting client*/
    deprecatePropertyForType(propertyName: string, targetType: string, isGlobal: boolean|null = null):Error|null {
        const params = { 
            "global": isGlobal,
            "property": propertyName,
            "type": targetType
        }
        const result = this._delete("propertiesForType", params);
        return result;
        //return translate_error(result)
    }

    
    getAllRoleDefinitions():Error|null {
        const params = {}
        const result = this._get("setup/permissions", params);
        return result;
        //return translate_error(result)
    }

    
    getClaimForRole(role: string, space: string|null = null):Error|null {
        const params = { 
            "space": space
        }
        const result = this._get(`setup/permissions/${role}`, params);
        return result;
        //return translate_error(result)
    }

    /*List instances with invitations*/
    listInstancesWithInvitations():Result[ListOfUUID] {
        const params = {}
        const result = this._get("instancesWithInvitations", params);
        return result;
        //return Result[ListOfUUID](response=result, constructor=ListOfUUID)
    }

    
    registerTermsOfUse(payload: any):Error|null {
        const params = {}
        const result = this._put("setup/termsOfUse", payload, params);
        return result;
        //return translate_error(result)
    }

    /*Remove a space definition*/
    removeSpaceDefinition(space: string):Error|null {
        const params = {}
        const result = this._delete(`spaces/${space}/specification`, params);
        return result;
        //return translate_error(result)
    }

    /*Remove a type definition*/
    removeTypeDefinition(isGlobal: boolean|null = null, targetType: string|null = null):Error|null {
        const params = { 
            "type": targetType,
            "global": isGlobal
        }
        const result = this._delete("types/specification", params);
        return result;
        //return translate_error(result)
    }

    /*Remove a type in space definition*/
    removeTypeFromSpace(space: string, targetType: string):Error|null {
        const params = { 
            "type": targetType
        }
        const result = this._delete(`spaces/${space}/types`, params);
        return result;
        //return translate_error(result)
    }

    /*Trigger a rerun of the events of this space*/
    rerunEvents(space: string):Error|null {
        const params = {}
        const result = this._put(`spaces/${space}/eventHistory`, null, params);
        return result;
        //return translate_error(result)
    }

    /*Triggers the inference of all documents of the given space*/
    triggerInference(space: string, identifier: string|null = null, isAsync: boolean = false):Error|null {
        const params = { 
            "identifier": identifier,
            "async": isAsync
        }
        const result = this._post(`spaces/${space}/inference`, null, params);
        return result;
        //return translate_error(result)
    }

    
    updateClaimForRole(payload: any, remove: boolean, role: string, space: string|null = null):Error|null {
        const params = { 
            "space": space,
            "remove": remove
        }
        const result = this._patch(`setup/permissions/${role}`, payload, params);
        return result;
        //return translate_error(result)
    }

}

class Instances extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Replace contribution to an existing instance*/
    contributeToFullReplacement(payload: any, instanceId: string, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Result[Instance] {
        const params = { 
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        }
        const result = this._put(`instances/${instanceId}`, payload, params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Partially update contribution to an existing instance*/
    contributeToPartialReplacement(payload: any, instanceId: string, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Result[Instance] {
        const params = { 
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        }
        const result = this._patch(`instances/${instanceId}`, payload, params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Create new instance with a system generated id*/
    createNew(payload: any, space: string, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Result[Instance] {
        const params = { 
            "space": space,
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        }
        const result = this._post("instances", payload, params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Create new instance with a client defined id*/
    createNewWithId(payload: any, instanceId: string, space: string, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Result[Instance] {
        const params = { 
            "space": space,
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        }
        const result = this._post(`instances/${instanceId}`, payload, params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Delete an instance*/
    delete(instanceId: string):Error|null {
        const params = {}
        const result = this._delete(`instances/${instanceId}`, params);
        return result;
        //return translate_error(result)
    }

    /*Get the instance*/
    getById(instanceId: string, stage: Stage = Stage.RELEASED, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Result[Instance] {
        const params = { 
            "stage": stage,
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        }
        const result = this._get(`instances/${instanceId}`, params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Read instances by the given list of (external) identifiers*/
    getByIdentifiers(payload: any, stage: Stage = Stage.RELEASED, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):ResultsById[Instance] {
        const params = { 
            "stage": stage,
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        }
        const result = this._post("instancesByIdentifiers", payload, params);
        return result;
        //return ResultsById[Instance](response=result, constructor=Instance)
    }

    /*Bulk operation of /instances/{id} to read instances by their UUIDs*/
    getByIds(payload: any, stage: Stage = Stage.RELEASED, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):ResultsById[Instance] {
        const params = { 
            "stage": stage,
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        }
        const result = this._post("instancesByIds", payload, params);
        return result;
        //return ResultsById[Instance](response=result, constructor=Instance)
    }

    /*Get incoming links for a specific instance (paginated)*/
    getIncomingLinks(instanceId: string, propertyName: string, targetType: string, stage: Stage = Stage.RELEASED, pagination: Pagination = new Pagination()):ResultPage[Instance] {
        const params = { 
            "stage": stage,
            "property": propertyName,
            "type": targetType,
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults
        }
        const result = this._get(`instances/${instanceId}/incomingLinks`, params);
        return result;
        //return ResultPage[Instance](response=result, constructor=Instance)
    }

    /*Get the release status for an instance*/
    getReleaseStatus(instanceId: string, releaseTreeScope: ReleaseTreeScope):Result[ReleaseStatus] {
        const params = { 
            "releaseTreeScope": releaseTreeScope
        }
        const result = this._get(`instances/${instanceId}/release/status`, params);
        return result;
        //return Result[ReleaseStatus](response=result, constructor=ReleaseStatus)
    }

    /*Get the release status for multiple instances*/
    getReleaseStatusByIds(payload: any, releaseTreeScope: ReleaseTreeScope):ResultsById[ReleaseStatus] {
        const params = { 
            "releaseTreeScope": releaseTreeScope
        }
        const result = this._post("instancesByIds/release/status", payload, params);
        return result;
        //return ResultsById[ReleaseStatus](response=result, constructor=ReleaseStatus)
    }

    /*Get the scope for the instance by its KG-internal ID*/
    getScope(instanceId: string, applyRestrictions: boolean = false, returnPermissions: boolean = false, stage: Stage = Stage.RELEASED):Result[Scope] {
        const params = { 
            "stage": stage,
            "returnPermissions": returnPermissions,
            "applyRestrictions": applyRestrictions
        }
        const result = this._get(`instances/${instanceId}/scope`, params);
        return result;
        //return Result[Scope](response=result, constructor=Scope)
    }

    /*Create or update an invitation for the given user to review the given instance*/
    inviteUserFor(instanceId: string, userId: string):Error|null {
        const params = {}
        const result = this._put(`instances/${instanceId}/invitedUsers/${userId}`, null, params);
        return result;
        //return translate_error(result)
    }

    /*Returns a list of instances according to their types*/
    list(targetType: string, filterProperty: string|null = null, filterValue: string|null = null, searchByLabel: string|null = null, space: string|null = null, stage: Stage = Stage.RELEASED, responseConfiguration: ResponseConfiguration = new ResponseConfiguration(), pagination: Pagination = new Pagination()):ResultPage[Instance] {
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
        }
        const result = this._get("instances", params);
        return result;
        //return ResultPage[Instance](response=result, constructor=Instance)
    }

    /*List invitations for review for the given instance*/
    listInvitations(instanceId: string):Result[ListOfReducedUserInformation] {
        const params = {}
        const result = this._get(`instances/${instanceId}/invitedUsers`, params);
        return result;
        //return Result[ListOfReducedUserInformation](response=result, constructor=ListOfReducedUserInformation)
    }

    /*Move an instance to another space*/
    move(instanceId: string, space: string, extendedResponseConfiguration: ExtendedResponseConfiguration = new ExtendedResponseConfiguration()):Result[Instance] {
        const params = { 
            "returnIncomingLinks": extendedResponseConfiguration.returnIncomingLinks,
            "incomingLinksPageSize": extendedResponseConfiguration.incomingLinksPageSize,
            "returnPayload": extendedResponseConfiguration.returnPayload,
            "returnPermissions": extendedResponseConfiguration.returnPermissions,
            "returnAlternatives": extendedResponseConfiguration.returnAlternatives,
            "returnEmbedded": extendedResponseConfiguration.returnEmbedded
        }
        const result = this._put(`instances/${instanceId}/spaces/${space}`, null, params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Release or re-release an instance*/
    release(instanceId: string, revision: string|null = null):Error|null {
        const params = { 
            "revision": revision
        }
        const result = this._put(`instances/${instanceId}/release`, null, params);
        return result;
        //return translate_error(result)
    }

    /*Revoke an invitation for the given user to review the given instance*/
    revokeUserInvitation(instanceId: string, userId: string):Error|null {
        const params = {}
        const result = this._delete(`instances/${instanceId}/invitedUsers/${userId}`, params);
        return result;
        //return translate_error(result)
    }

    /*Unrelease an instance*/
    unrelease(instanceId: string):Error|null {
        const params = {}
        const result = this._delete(`instances/${instanceId}/release`, params);
        return result;
        //return translate_error(result)
    }

}

class Jsonld extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Normalizes the passed payload according to the EBRAINS KG conventions*/
    normalizePayload(payload: any):Error|null {
        const params = {}
        const result = this._post("jsonld/normalizedPayload", payload, params);
        return result;
        //return translate_error(result)
    }

}

class Queries extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Execute a stored query to receive the instances*/
    executeQueryById(queryId: string, additionalRequestParams: any = {}, instanceId: string|null = null, restrictToSpaces: Array<string>|null = null, stage: Stage = Stage.RELEASED, pagination: Pagination = new Pagination()):ResultPage[JsonLdDocument] {
        const params = { 
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults,
            "stage": stage,
            "instanceId": instanceId,
            "restrictToSpaces": restrictToSpaces,
            "additionalRequestParams": additionalRequestParams
        }
        const result = this._get(`queries/${queryId}/instances`, params);
        return result;
        //return ResultPage[JsonLdDocument](response=result, constructor=JsonLdDocument)
    }

    /*Get the query specification with the given query id in a specific space*/
    getQuerySpecification(queryId: string):Result[Instance] {
        const params = {}
        const result = this._get(`queries/${queryId}`, params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*List the queries and filter them by root type and/or text in the label, name or description*/
    listPerRootType(search: string|null = null, targetType: string|null = null, pagination: Pagination = new Pagination()):ResultPage[Instance] {
        const params = { 
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults,
            "type": targetType,
            "search": search
        }
        const result = this._get("queries", params);
        return result;
        //return ResultPage[Instance](response=result, constructor=Instance)
    }

    /*Remove a query specification*/
    removeQuery(queryId: string):Error|null {
        const params = {}
        const result = this._delete(`queries/${queryId}`, params);
        return result;
        //return translate_error(result)
    }

    /*Create or save a query specification*/
    saveQuery(payload: any, queryId: string, space: string|null = null):Result[Instance] {
        const params = { 
            "space": space
        }
        const result = this._put(`queries/${queryId}`, payload, params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Execute the query in the payload in test mode (e.g. for execution before saving with the KG QueryBuilder)*/
    testQuery(payload: any, additionalRequestParams: any = {}, instanceId: string|null = null, restrictToSpaces: Array<string>|null = null, stage: Stage = Stage.RELEASED, pagination: Pagination = new Pagination()):ResultPage[JsonLdDocument] {
        const params = { 
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults,
            "stage": stage,
            "instanceId": instanceId,
            "restrictToSpaces": restrictToSpaces,
            "additionalRequestParams": additionalRequestParams
        }
        const result = this._post("queries", payload, params);
        return result;
        //return ResultPage[JsonLdDocument](response=result, constructor=JsonLdDocument)
    }

}

class Spaces extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    
    get(space: string, permissions: boolean = false):Result[SpaceInformation] {
        const params = { 
            "permissions": permissions
        }
        const result = this._get(`spaces/${space}`, params);
        return result;
        //return Result[SpaceInformation](response=result, constructor=SpaceInformation)
    }

    
    list(permissions: boolean = false, pagination: Pagination = new Pagination()):ResultPage[SpaceInformation] {
        const params = { 
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults,
            "permissions": permissions
        }
        const result = this._get("spaces", params);
        return result;
        //return ResultPage[SpaceInformation](response=result, constructor=SpaceInformation)
    }

}

class Types extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Returns the types according to the list of names - either with property information or without*/
    getByName(payload: any, space: string|null = null, stage: Stage = Stage.RELEASED, withIncomingLinks: boolean = false, withProperties: boolean = false):ResultsById[TypeInformation] {
        const params = { 
            "stage": stage,
            "withProperties": withProperties,
            "withIncomingLinks": withIncomingLinks,
            "space": space
        }
        const result = this._post("typesByName", payload, params);
        return result;
        //return ResultsById[TypeInformation](response=result, constructor=TypeInformation)
    }

    /*Returns the types available - either with property information or without*/
    list(space: string|null = null, stage: Stage = Stage.RELEASED, withIncomingLinks: boolean = false, withProperties: boolean = false, pagination: Pagination = new Pagination()):ResultPage[TypeInformation] {
        const params = { 
            "stage": stage,
            "space": space,
            "withProperties": withProperties,
            "withIncomingLinks": withIncomingLinks,
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.returnTotalResults
        }
        const result = this._get("types", params);
        return result;
        //return ResultPage[TypeInformation](response=result, constructor=TypeInformation)
    }

}

class Users extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Accept the terms of use in the given version*/
    acceptTermsOfUse(version: string):Error|null {
        const params = {}
        const result = this._post(`users/termsOfUse/${version}/accept`, null, params);
        return result;
        //return translate_error(result)
    }

    /*Get the endpoint of the openid configuration*/
    getOpenIdConfigUrl():Result[JsonLdDocument] {
        const params = {}
        const result = this._get("users/authorization/config", params);
        return result;
        //return Result[JsonLdDocument](response=result, constructor=JsonLdDocument)
    }

    /*Get the current terms of use*/
    getTermsOfUse():Optional[TermsOfUse] {
        const params = {}
        const result = this._get("users/termsOfUse", params);
        return result;
        //return null if not result.content else TermsOfUse(**result.content)
    }

    /*Retrieve user information from the passed token (including detailed information such as e-mail address)*/
    myInfo():Result[User] {
        const params = {}
        const result = this._get("users/me", params);
        return result;
        //return Result[User](response=result, constructor=User)
    }

}


class ClientBuilder {
    _hostName: string;
    _tokenHandler: TokenHandler | null = null;
    _clientTokenHandler: TokenHandler | null;
    constructor(hostName: string) {
        this._hostName = hostName;
        this._tokenHandler = null;
        this._clientTokenHandler = null;
    }

    _resolveClientTokenHandler():TokenHandler|null {
        if(!this._clientTokenHandler) {
            if("KG_CLIENT_ID" in process.env && "KG_CLIENT_SECRET" in process.env){
                return new ClientCredentials(process.env["KG_CLIENT_ID"], process.env["KG_CLIENT_SECRET"]);
            } else if("KG_CLIENT_TOKEN" in process.env) {
                return new SimpleToken(process.env["KG_CLIENT_TOKEN"]);
            } else {
                return null;
            }
        } 
        return this._clientTokenHandler;
    }

    withToken(token:string|null = null):ClientBuilder {
        this._tokenHandler = new SimpleToken(token?token:process.env["KG_TOKEN"]);
        return this;
    }

    withCustomTokenProvider(tokenProvider):ClientBuilder {
        this._tokenHandler = new CallableTokenHandler(tokenProvider);
        return this;
    }

    withCredentials(client_id:string|null = null, client_secret:string|null = null):ClientBuilder{
        this._tokenHandler = new ClientCredentials(client_id ? client_id : process.env["KG_CLIENT_ID"], client_secret ? client_secret : process.env["KG_CLIENT_SECRET"]);
        return this;
    }

    addClientAuthentication(client_id:string|null = null, client_secret:string|null = null):ClientBuilder {
        this._clientTokenHandler = new ClientCredentials(client_id ? client_id : process.env["KG_CLIENT_ID"], client_secret ? client_secret : process.env["KG_CLIENT_SECRET"]);
        return this;
    }
        
    build():Client {
        return new Client(this._hostName, this._tokenHandler, this._resolveClientTokenHandler());
    }

    buildAdmin():Admin {
        return new Admin(_createKgConfig(this._hostName, this._tokenHandler, this._resolveClientTokenHandler()));
    }
        
}

export const kg = (host:string = "core.kg.ebrains.eu"):ClientBuilder => new ClientBuilder(host);
    

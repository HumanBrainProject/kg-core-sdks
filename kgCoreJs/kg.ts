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

import { SimpleToken, ClientCredentials } from "kgCoreJs/oauth";
import { KGConfig, CallableTokenHandler, TokenHandler } from "kgCoreJs/communication";


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
    assign_type_to_space(space: str, targetType: str):Error|null {
        const params = { 
            "type": targetType
        }
        const result = this._put(path=`spaces/${space}/types`, payload=null, params=params);
        return result;
        //return translate_error(result)
    }

    /*Update invitation scope for this instance*/
    calculate_instance_invitation_scope(instanceId: UUID):Error|null {
        const params = {}
        const result = this._put(path=`instances/${instanceId}/invitationScope`, payload=null, params=params);
        return result;
        //return translate_error(result)
    }

    /*Explicitly specify a space*/
    create_space_definition(space: str, autorelease: bool = False, client_space: bool = False, defer_cache: bool = False):Error|null {
        const params = { 
            "autorelease": autorelease,
            "clientSpace": client_space,
            "deferCache": defer_cache
        }
        const result = this._put(path=`spaces/${space}/specification`, payload=null, params=params);
        return result;
        //return translate_error(result)
    }

    /*Specify a type*/
    create_type_definition(payload: any, targetType: str, isGlobal: Optional[bool] = None):Error|null {
        const params = { 
            "global": isGlobal,
            "type": targetType
        }
        const result = this._put(path="types/specification", payload=payload, params=params);
        return result;
        //return translate_error(result)
    }

    /*Upload a property specification either globally or for the requesting client*/
    define_property(payload: any, propertyName: str, isGlobal: Optional[bool] = None):Error|null {
        const params = { 
            "global": isGlobal,
            "property": propertyName
        }
        const result = this._put(path="properties", payload=payload, params=params);
        return result;
        //return translate_error(result)
    }

    /*Define a property specification either globally for the requesting client*/
    define_property_for_type(payload: any, propertyName: str, targetType: str, isGlobal: Optional[bool] = None):Error|null {
        const params = { 
            "global": isGlobal,
            "property": propertyName,
            "type": targetType
        }
        const result = this._put(path="propertiesForType", payload=payload, params=params);
        return result;
        //return translate_error(result)
    }

    /*Upload a property specification either globally or for the requesting client*/
    deprecate_property(propertyName: str, isGlobal: Optional[bool] = None):Error|null {
        const params = { 
            "global": isGlobal,
            "property": propertyName
        }
        const result = this._delete(path="properties", params=params);
        return result;
        //return translate_error(result)
    }

    /*Deprecate a property specification for a specific type either globally or for the requesting client*/
    deprecate_property_for_type(propertyName: str, targetType: str, isGlobal: Optional[bool] = None):Error|null {
        const params = { 
            "global": isGlobal,
            "property": propertyName,
            "type": targetType
        }
        const result = this._delete(path="propertiesForType", params=params);
        return result;
        //return translate_error(result)
    }

    
    get_all_role_definitions():Error|null {
        const params = {}
        const result = this._get(path="setup/permissions", params=params);
        return result;
        //return translate_error(result)
    }

    
    get_claim_for_role(role: str, space: Optional[str] = None):Error|null {
        const params = { 
            "space": space
        }
        const result = this._get(path=`setup/permissions/${role}`, params=params);
        return result;
        //return translate_error(result)
    }

    /*List instances with invitations*/
    list_instances_with_invitations():Result[ListOfUUID] {
        const params = {}
        const result = this._get(path="instancesWithInvitations", params=params);
        return result;
        //return Result[ListOfUUID](response=result, constructor=ListOfUUID)
    }

    
    register_terms_of_use(payload: any):Error|null {
        const params = {}
        const result = this._put(path="setup/termsOfUse", payload=payload, params=params);
        return result;
        //return translate_error(result)
    }

    /*Remove a space definition*/
    remove_space_definition(space: str):Error|null {
        const params = {}
        const result = this._delete(path=`spaces/${space}/specification`, params=params);
        return result;
        //return translate_error(result)
    }

    /*Remove a type definition*/
    remove_type_definition(isGlobal: Optional[bool] = None, targetType: Optional[str] = None):Error|null {
        const params = { 
            "type": targetType,
            "global": isGlobal
        }
        const result = this._delete(path="types/specification", params=params);
        return result;
        //return translate_error(result)
    }

    /*Remove a type in space definition*/
    remove_type_from_space(space: str, targetType: str):Error|null {
        const params = { 
            "type": targetType
        }
        const result = this._delete(path=`spaces/${space}/types`, params=params);
        return result;
        //return translate_error(result)
    }

    /*Trigger a rerun of the events of this space*/
    rerun_events(space: str):Error|null {
        const params = {}
        const result = this._put(path=`spaces/${space}/eventHistory`, payload=null, params=params);
        return result;
        //return translate_error(result)
    }

    /*Triggers the inference of all documents of the given space*/
    trigger_inference(space: str, identifier: Optional[str] = None, isAsync: bool = False):Error|null {
        const params = { 
            "identifier": identifier,
            "async": isAsync
        }
        const result = this._post(path=`spaces/${space}/inference`, payload=null, params=params);
        return result;
        //return translate_error(result)
    }

    
    update_claim_for_role(payload: any, remove: bool, role: str, space: Optional[str] = None):Error|null {
        const params = { 
            "space": space,
            "remove": remove
        }
        const result = this._patch(path=`setup/permissions/${role}`, payload=payload, params=params);
        return result;
        //return translate_error(result)
    }

}

class Instances extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Replace contribution to an existing instance*/
    contribute_to_full_replacement(payload: any, instanceId: UUID, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()):Result[Instance] {
        const params = { 
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        }
        const result = this._put(path=`instances/${instanceId}`, payload=payload, params=params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Partially update contribution to an existing instance*/
    contribute_to_partial_replacement(payload: any, instanceId: UUID, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()):Result[Instance] {
        const params = { 
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        }
        const result = this._patch(path=`instances/${instanceId}`, payload=payload, params=params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Create new instance with a system generated id*/
    create_new(payload: any, space: str, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()):Result[Instance] {
        const params = { 
            "space": space,
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        }
        const result = this._post(path="instances", payload=payload, params=params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Create new instance with a client defined id*/
    create_new_with_id(payload: any, instanceId: UUID, space: str, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()):Result[Instance] {
        const params = { 
            "space": space,
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        }
        const result = this._post(path=`instances/${instanceId}`, payload=payload, params=params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Delete an instance*/
    delete(instanceId: UUID):Error|null {
        const params = {}
        const result = this._delete(path=`instances/${instanceId}`, params=params);
        return result;
        //return translate_error(result)
    }

    /*Get the instance*/
    get_by_id(instanceId: UUID, stage: Stage = Stage.RELEASED, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()):Result[Instance] {
        const params = { 
            "stage": stage,
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        }
        const result = this._get(path=`instances/${instanceId}`, params=params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Read instances by the given list of (external) identifiers*/
    get_by_identifiers(payload: any, stage: Stage = Stage.RELEASED, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()):ResultsById[Instance] {
        const params = { 
            "stage": stage,
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        }
        const result = this._post(path="instancesByIdentifiers", payload=payload, params=params);
        return result;
        //return ResultsById[Instance](response=result, constructor=Instance)
    }

    /*Bulk operation of /instances/{id} to read instances by their UUIDs*/
    get_by_ids(payload: any, stage: Stage = Stage.RELEASED, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()):ResultsById[Instance] {
        const params = { 
            "stage": stage,
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        }
        const result = this._post(path="instancesByIds", payload=payload, params=params);
        return result;
        //return ResultsById[Instance](response=result, constructor=Instance)
    }

    /*Get incoming links for a specific instance (paginated)*/
    get_incoming_links(instanceId: UUID, propertyName: str, targetType: str, stage: Stage = Stage.RELEASED, pagination: Pagination = Pagination()):ResultPage[Instance] {
        const params = { 
            "stage": stage,
            "property": propertyName,
            "type": targetType,
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.return_total_results
        }
        const result = this._get(path=`instances/${instanceId}/incomingLinks`, params=params);
        return result;
        //return ResultPage[Instance](response=result, constructor=Instance)
    }

    /*Get the release status for an instance*/
    get_release_status(instanceId: UUID, release_tree_scope: ReleaseTreeScope):Result[ReleaseStatus] {
        const params = { 
            "releaseTreeScope": release_tree_scope
        }
        const result = this._get(path=`instances/${instanceId}/release/status`, params=params);
        return result;
        //return Result[ReleaseStatus](response=result, constructor=ReleaseStatus)
    }

    /*Get the release status for multiple instances*/
    get_release_status_by_ids(payload: any, release_tree_scope: ReleaseTreeScope):ResultsById[ReleaseStatus] {
        const params = { 
            "releaseTreeScope": release_tree_scope
        }
        const result = this._post(path="instancesByIds/release/status", payload=payload, params=params);
        return result;
        //return ResultsById[ReleaseStatus](response=result, constructor=ReleaseStatus)
    }

    /*Get the scope for the instance by its KG-internal ID*/
    get_scope(instanceId: UUID, apply_restrictions: bool = False, return_permissions: bool = False, stage: Stage = Stage.RELEASED):Result[Scope] {
        const params = { 
            "stage": stage,
            "returnPermissions": return_permissions,
            "applyRestrictions": apply_restrictions
        }
        const result = this._get(path=`instances/${instanceId}/scope`, params=params);
        return result;
        //return Result[Scope](response=result, constructor=Scope)
    }

    /*Create or update an invitation for the given user to review the given instance*/
    invite_user_for(instanceId: UUID, user_id: UUID):Error|null {
        const params = {}
        const result = this._put(path=`instances/${instanceId}/invitedUsers/${user_id}`, payload=null, params=params);
        return result;
        //return translate_error(result)
    }

    /*Returns a list of instances according to their types*/
    list(targetType: str, filter_property: Optional[str] = None, filter_value: Optional[str] = None, search_by_label: Optional[str] = None, space: Optional[str] = None, stage: Stage = Stage.RELEASED, response_configuration: ResponseConfiguration = ResponseConfiguration(), pagination: Pagination = Pagination()):ResultPage[Instance] {
        const params = { 
            "stage": stage,
            "type": targetType,
            "space": space,
            "searchByLabel": search_by_label,
            "filterProperty": filter_property,
            "filterValue": filter_value,
            "returnPayload": response_configuration.return_payload,
            "returnPermissions": response_configuration.return_permissions,
            "returnAlternatives": response_configuration.return_alternatives,
            "returnEmbedded": response_configuration.return_embedded,
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.return_total_results
        }
        const result = this._get(path="instances", params=params);
        return result;
        //return ResultPage[Instance](response=result, constructor=Instance)
    }

    /*List invitations for review for the given instance*/
    list_invitations(instanceId: UUID):Result[ListOfReducedUserInformation] {
        const params = {}
        const result = this._get(path=`instances/${instanceId}/invitedUsers`, params=params);
        return result;
        //return Result[ListOfReducedUserInformation](response=result, constructor=ListOfReducedUserInformation)
    }

    /*Move an instance to another space*/
    move(instanceId: UUID, space: str, extended_response_configuration: ExtendedResponseConfiguration = ExtendedResponseConfiguration()):Result[Instance] {
        const params = { 
            "returnIncomingLinks": extended_response_configuration.return_incoming_links,
            "incomingLinksPageSize": extended_response_configuration.incoming_links_page_size,
            "returnPayload": extended_response_configuration.return_payload,
            "returnPermissions": extended_response_configuration.return_permissions,
            "returnAlternatives": extended_response_configuration.return_alternatives,
            "returnEmbedded": extended_response_configuration.return_embedded
        }
        const result = this._put(path=`instances/${instanceId}/spaces/${space}`, payload=null, params=params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Release or re-release an instance*/
    release(instanceId: UUID, revision: Optional[str] = None):Error|null {
        const params = { 
            "revision": revision
        }
        const result = this._put(path=`instances/${instanceId}/release`, payload=null, params=params);
        return result;
        //return translate_error(result)
    }

    /*Revoke an invitation for the given user to review the given instance*/
    revoke_user_invitation(instanceId: UUID, user_id: UUID):Error|null {
        const params = {}
        const result = this._delete(path=`instances/${instanceId}/invitedUsers/${user_id}`, params=params);
        return result;
        //return translate_error(result)
    }

    /*Unrelease an instance*/
    unrelease(instanceId: UUID):Error|null {
        const params = {}
        const result = this._delete(path=`instances/${instanceId}/release`, params=params);
        return result;
        //return translate_error(result)
    }

}

class Jsonld extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Normalizes the passed payload according to the EBRAINS KG conventions*/
    normalize_payload(payload: any):Error|null {
        const params = {}
        const result = this._post(path="jsonld/normalizedPayload", payload=payload, params=params);
        return result;
        //return translate_error(result)
    }

}

class Queries extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Execute a stored query to receive the instances*/
    execute_query_by_id(query_id: UUID, additional_request_params: Dict[str, Any] = {}, instance_id: Optional[UUID] = None, restrict_to_spaces: Optional[List[str]] = None, stage: Stage = Stage.RELEASED, pagination: Pagination = Pagination()):ResultPage[JsonLdDocument] {
        const params = { 
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.return_total_results,
            "stage": stage,
            "instanceId": instance_id,
            "restrictToSpaces": restrict_to_spaces
        }
        Object.entries(additional_request_params).forEach(([k, v]) => {
            if(!params[k]) {
                params[k] = v;
            }
        });
        const result = this._get(path=`queries/${query_id}/instances`, params=params);
        return result;
        //return ResultPage[JsonLdDocument](response=result, constructor=JsonLdDocument)
    }

    /*Get the query specification with the given query id in a specific space*/
    get_query_specification(query_id: UUID):Result[Instance] {
        const params = {}
        const result = this._get(path=`queries/${query_id}`, params=params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*List the queries and filter them by root type and/or text in the label, name or description*/
    list_per_root_type(search: Optional[str] = None, targetType: Optional[str] = None, pagination: Pagination = Pagination()):ResultPage[Instance] {
        const params = { 
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.return_total_results,
            "type": targetType,
            "search": search
        }
        const result = this._get(path="queries", params=params);
        return result;
        //return ResultPage[Instance](response=result, constructor=Instance)
    }

    /*Remove a query specification*/
    remove_query(query_id: UUID):Error|null {
        const params = {}
        const result = this._delete(path=`queries/${query_id}`, params=params);
        return result;
        //return translate_error(result)
    }

    /*Create or save a query specification*/
    save_query(payload: any, query_id: UUID, space: Optional[str] = None):Result[Instance] {
        const params = { 
            "space": space
        }
        const result = this._put(path=`queries/${query_id}`, payload=payload, params=params);
        return result;
        //return Result[Instance](response=result, constructor=Instance)
    }

    /*Execute the query in the payload in test mode (e.g. for execution before saving with the KG QueryBuilder)*/
    test_query(payload: any, additional_request_params: Dict[str, Any] = {}, instance_id: Optional[UUID] = None, restrict_to_spaces: Optional[List[str]] = None, stage: Stage = Stage.RELEASED, pagination: Pagination = Pagination()):ResultPage[JsonLdDocument] {
        const params = { 
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.return_total_results,
            "stage": stage,
            "instanceId": instance_id,
            "restrictToSpaces": restrict_to_spaces
        }
        Object.entries(additional_request_params).forEach(([k, v]) => {
            if(!params[k]) {
                params[k] = v;
            }
        });
        const result = this._post(path="queries", payload=payload, params=params);
        return result;
        //return ResultPage[JsonLdDocument](response=result, constructor=JsonLdDocument)
    }

}

class Spaces extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    
    get(space: str, permissions: bool = False):Result[SpaceInformation] {
        const params = { 
            "permissions": permissions
        }
        const result = this._get(path=`spaces/${space}`, params=params);
        return result;
        //return Result[SpaceInformation](response=result, constructor=SpaceInformation)
    }

    
    list(permissions: bool = False, pagination: Pagination = Pagination()):ResultPage[SpaceInformation] {
        const params = { 
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.return_total_results,
            "permissions": permissions
        }
        const result = this._get(path="spaces", params=params);
        return result;
        //return ResultPage[SpaceInformation](response=result, constructor=SpaceInformation)
    }

}

class Types extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Returns the types according to the list of names - either with property information or without*/
    get_by_name(payload: any, space: Optional[str] = None, stage: Stage = Stage.RELEASED, with_incoming_links: bool = False, with_properties: bool = False):ResultsById[TypeInformation] {
        const params = { 
            "stage": stage,
            "withProperties": with_properties,
            "withIncomingLinks": with_incoming_links,
            "space": space
        }
        const result = this._post(path="typesByName", payload=payload, params=params);
        return result;
        //return ResultsById[TypeInformation](response=result, constructor=TypeInformation)
    }

    /*Returns the types available - either with property information or without*/
    list(space: Optional[str] = None, stage: Stage = Stage.RELEASED, with_incoming_links: bool = False, with_properties: bool = False, pagination: Pagination = Pagination()):ResultPage[TypeInformation] {
        const params = { 
            "stage": stage,
            "space": space,
            "withProperties": with_properties,
            "withIncomingLinks": with_incoming_links,
            "from": pagination.start,
            "size": pagination.size,
            "returnTotalResults": pagination.return_total_results
        }
        const result = this._get(path="types", params=params);
        return result;
        //return ResultPage[TypeInformation](response=result, constructor=TypeInformation)
    }

}

class Users extends RequestsWithTokenHandler {
    constructor(config: KGConfig) {
        super(config);
    }

    /*Accept the terms of use in the given version*/
    accept_terms_of_use(version: str):Error|null {
        const params = {}
        const result = this._post(path=`users/termsOfUse/${version}/accept`, payload=null, params=params);
        return result;
        //return translate_error(result)
    }

    /*Get the endpoint of the openid configuration*/
    get_open_id_config_url():Result[JsonLdDocument] {
        const params = {}
        const result = this._get(path="users/authorization/config", params=params);
        return result;
        //return Result[JsonLdDocument](response=result, constructor=JsonLdDocument)
    }

    /*Get the current terms of use*/
    get_terms_of_use():Optional[TermsOfUse] {
        const params = {}
        const result = this._get(path="users/termsOfUse", params=params);
        return result;
        //return null if not result.content else TermsOfUse(**result.content)
    }

    /*Retrieve user information from the passed token (including detailed information such as e-mail address)*/
    my_info():Result[User] {
        const params = {}
        const result = this._get(path="users/me", params=params);
        return result;
        //return Result[User](response=result, constructor=User)
    }

}


class ClientBuilder {
    constructor(hostName: string) {
        this._hostName: string = hostName;
        this._tokenHandler: TokenHandler | null = null;
        this._clientTokenHandler: TokenHandler | null = null;
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
    

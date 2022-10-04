import { KGConfig, RequestsWithTokenHandler, TokenHandler } from "./communication";
import { ResponseConfiguration, ExtendedResponseConfiguration, Pagination, Stage, ReleaseTreeScope } from "./request";
import { Result, Instance, JsonLdDocument, ResultsById, ResultPage, ReleaseStatus, KGError, User, Scope, SpaceInformation, TypeInformation, TermsOfUse, ListOfUUID, ListOfReducedUserInformation } from "./response";
export declare class Client {
    instances: Instances;
    jsonld: Jsonld;
    queries: Queries;
    spaces: Spaces;
    types: Types;
    users: Users;
    constructor(host: string, tokenHandler: TokenHandler | null);
}
export declare class Admin extends RequestsWithTokenHandler {
    constructor(config: KGConfig);
    assignTypeToSpace(space: string, targetType: string): Promise<KGError | null>;
    calculateInstanceInvitationScope(instanceId: string): Promise<KGError | null>;
    createSpaceDefinition(space: string, autorelease?: boolean, clientSpace?: boolean, deferCache?: boolean): Promise<KGError | null>;
    createTypeDefinition(payload: any, targetType: string, isGlobal?: boolean | null): Promise<KGError | null>;
    defineProperty(payload: any, propertyName: string, isGlobal?: boolean | null): Promise<KGError | null>;
    definePropertyForType(payload: any, propertyName: string, targetType: string, isGlobal?: boolean | null): Promise<KGError | null>;
    deprecateProperty(propertyName: string, isGlobal?: boolean | null): Promise<KGError | null>;
    deprecatePropertyForType(propertyName: string, targetType: string, isGlobal?: boolean | null): Promise<KGError | null>;
    getAllRoleDefinitions(): Promise<KGError | null>;
    getClaimForRole(role: string, space?: string | null): Promise<KGError | null>;
    listInstancesWithInvitations(): Promise<Result<ListOfUUID>>;
    registerTermsOfUse(payload: any): Promise<KGError | null>;
    removeSpaceDefinition(space: string): Promise<KGError | null>;
    removeTypeDefinition(isGlobal?: boolean | null, targetType?: string | null): Promise<KGError | null>;
    removeTypeFromSpace(space: string, targetType: string): Promise<KGError | null>;
    rerunEvents(space: string): Promise<KGError | null>;
    triggerInference(space: string, identifier?: string | null, isAsync?: boolean): Promise<KGError | null>;
    updateClaimForRole(payload: any, remove: boolean, role: string, space?: string | null): Promise<KGError | null>;
}
export declare class Instances extends RequestsWithTokenHandler {
    constructor(config: KGConfig);
    contributeToFullReplacement(payload: any, instanceId: string, extendedResponseConfiguration?: ExtendedResponseConfiguration): Promise<Result<Instance>>;
    contributeToPartialReplacement(payload: any, instanceId: string, extendedResponseConfiguration?: ExtendedResponseConfiguration): Promise<Result<Instance>>;
    createNew(payload: any, space: string, extendedResponseConfiguration?: ExtendedResponseConfiguration): Promise<Result<Instance>>;
    createNewWithId(payload: any, instanceId: string, space: string, extendedResponseConfiguration?: ExtendedResponseConfiguration): Promise<Result<Instance>>;
    delete(instanceId: string): Promise<KGError | null>;
    getById(instanceId: string, stage?: Stage, extendedResponseConfiguration?: ExtendedResponseConfiguration): Promise<Result<Instance>>;
    getByIdentifiers(payload: any, stage?: Stage, extendedResponseConfiguration?: ExtendedResponseConfiguration): Promise<ResultsById<Instance>>;
    getByIds(payload: any, stage?: Stage, extendedResponseConfiguration?: ExtendedResponseConfiguration): Promise<ResultsById<Instance>>;
    getIncomingLinks(instanceId: string, propertyName: string, targetType: string, stage?: Stage, pagination?: Pagination): Promise<ResultPage<Instance>>;
    getReleaseStatus(instanceId: string, releaseTreeScope: ReleaseTreeScope): Promise<Result<ReleaseStatus>>;
    getReleaseStatusByIds(payload: any, releaseTreeScope: ReleaseTreeScope): Promise<ResultsById<ReleaseStatus>>;
    getScope(instanceId: string, applyRestrictions?: boolean, returnPermissions?: boolean, stage?: Stage): Promise<Result<Scope>>;
    inviteUserFor(instanceId: string, userId: string): Promise<KGError | null>;
    list(targetType: string, filterProperty?: string | null, filterValue?: string | null, searchByLabel?: string | null, space?: string | null, stage?: Stage, responseConfiguration?: ResponseConfiguration, pagination?: Pagination): Promise<ResultPage<Instance>>;
    listInvitations(instanceId: string): Promise<Result<ListOfReducedUserInformation>>;
    move(instanceId: string, space: string, extendedResponseConfiguration?: ExtendedResponseConfiguration): Promise<Result<Instance>>;
    release(instanceId: string, revision?: string | null): Promise<KGError | null>;
    revokeUserInvitation(instanceId: string, userId: string): Promise<KGError | null>;
    unrelease(instanceId: string): Promise<KGError | null>;
}
export declare class Jsonld extends RequestsWithTokenHandler {
    constructor(config: KGConfig);
    normalizePayload(payload: any): Promise<KGError | null>;
}
export declare class Queries extends RequestsWithTokenHandler {
    constructor(config: KGConfig);
    executeQueryById(queryId: string, additionalRequestParams?: any, instanceId?: string | null, restrictToSpaces?: Array<string> | null, stage?: Stage, pagination?: Pagination): Promise<ResultPage<JsonLdDocument>>;
    getQuerySpecification(queryId: string): Promise<Result<Instance>>;
    listPerRootType(search?: string | null, targetType?: string | null, pagination?: Pagination): Promise<ResultPage<Instance>>;
    removeQuery(queryId: string): Promise<KGError | null>;
    saveQuery(payload: any, queryId: string, space?: string | null): Promise<Result<Instance>>;
    testQuery(payload: any, additionalRequestParams?: any, instanceId?: string | null, restrictToSpaces?: Array<string> | null, stage?: Stage, pagination?: Pagination): Promise<ResultPage<JsonLdDocument>>;
}
export declare class Spaces extends RequestsWithTokenHandler {
    constructor(config: KGConfig);
    get(space: string, permissions?: boolean): Promise<Result<SpaceInformation>>;
    list(permissions?: boolean, pagination?: Pagination): Promise<ResultPage<SpaceInformation>>;
}
export declare class Types extends RequestsWithTokenHandler {
    constructor(config: KGConfig);
    getByName(payload: any, space?: string | null, stage?: Stage, withIncomingLinks?: boolean, withProperties?: boolean): Promise<ResultsById<TypeInformation>>;
    list(space?: string | null, stage?: Stage, withIncomingLinks?: boolean, withProperties?: boolean, pagination?: Pagination): Promise<ResultPage<TypeInformation>>;
}
export declare class Users extends RequestsWithTokenHandler {
    constructor(config: KGConfig);
    acceptTermsOfUse(version: string): Promise<KGError | null>;
    getOpenIdConfigUrl(): Promise<Result<JsonLdDocument>>;
    getTermsOfUse(): Promise<TermsOfUse | null>;
    myInfo(): Promise<Result<User>>;
}
declare class ClientBuilder {
    _hostName: string;
    _tokenHandler: TokenHandler | null;
    constructor(hostName: string);
    _resolveTokenHandler(): TokenHandler | null;
    withCustomTokenProvider(tokenProvider: () => string | null): ClientBuilder;
    build(): Client;
    buildAdmin(): Admin;
}
export declare const kg: (host?: string) => ClientBuilder;
export {};

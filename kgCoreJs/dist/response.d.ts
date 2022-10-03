import { KGRequestWithResponseContext } from "./communication";
declare type UUID = string;
export declare enum ReleaseStatus {
    RELEASED = "RELEASED",
    UNRELEASED = "UNRELEASED",
    HAS_CHANGED = "HAS_CHANGED"
}
export declare class JsonLdDocument {
    [index: string]: any;
    idNamespace?: string;
    constructor(json: any, idNamespace?: string);
    toUuid(value: string): UUID | null;
}
export declare class Instance extends JsonLdDocument {
    uuid: UUID | null;
    constructor(data: any, idNamespace?: string);
}
export declare class TermsOfUse {
    accepted: boolean;
    version: string;
    data: string;
    constructor(data: any);
}
export declare class KGError {
    code?: number;
    message?: string;
    uuid?: UUID;
    constructor(code?: number, message?: string, uuid?: UUID);
}
export declare class Scope {
    uuid?: UUID;
    label?: string;
    space?: string;
    types?: Array<string>;
    children?: Array<Scope>;
    permissions?: Array<string>;
    constructor(data: any);
}
export declare class SpaceInformation {
    identifier?: string;
    name?: string;
    permissions?: Array<string>;
    constructor(data: any);
}
export declare class TypeInformation {
    identifier?: string;
    description?: string;
    name?: string;
    occurrences?: number;
    constructor(data: any);
}
declare class ReducedUserInformation {
    alternateName?: string;
    name?: string;
    uuid?: UUID;
    constructor(data: any);
}
export declare class ListOfUUID extends Array<string> {
    constructor(items: Array<string>);
}
export declare class ListOfReducedUserInformation extends Array<ReducedUserInformation> {
    constructor(items: Array<ReducedUserInformation>);
}
export declare class User {
    alternateName?: string;
    name?: string;
    email?: string;
    givenName?: string;
    familyName?: string;
    identifiers?: Array<string>;
    constructor(user: any);
}
export declare class ErrorStatusText {
    [index: number]: string;
}
export declare const translateError: (response: KGRequestWithResponseContext) => KGError | null;
declare abstract class _AbstractResult {
    message?: string;
    startTime?: number;
    durationInMs?: number;
    transactionId?: number;
    error: KGError | null;
    constructor(response: KGRequestWithResponseContext);
}
declare class _AbstractResultPage extends _AbstractResult {
    total?: number;
    size?: number;
    startFrom?: number;
    constructor(response: KGRequestWithResponseContext);
}
declare class ResultPageIterator<T> implements Iterator<T> {
    resultPage: ResultPage<T> | null;
    private counter;
    constructor(resultPage: ResultPage<T> | null);
    next(): IteratorResult<T>;
}
export declare class ResultPage<T> extends _AbstractResultPage {
    data: Array<T>;
    _originalResponse: any;
    _originalConstructor: any;
    constructor(response: KGRequestWithResponseContext, constructor: any);
    _getData(constructor: any, content: any, idNamespace: string): any[];
    nextPage(): ResultPage<T> | null;
    hasNextPage(): boolean | null;
    items(): ResultPageIterator<T>;
}
export declare class Result<T> extends _AbstractResult {
    data: T | null;
    constructor(response: KGRequestWithResponseContext, constructor: any);
}
interface ResultById<T> {
    [index: string]: Result<T>;
}
export declare class ResultsById<T> extends _AbstractResult {
    data: ResultById<T> | null;
    constructor(response: KGRequestWithResponseContext, constructor: any);
    _getData(data: any, response: KGRequestWithResponseContext, constructor: any): ResultById<T>;
}
export {};

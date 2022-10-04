export interface TokenHandler {
    fetchToken(): string | null;
}
export declare class CallableTokenHandler implements TokenHandler {
    _callable: () => string | null;
    constructor(callable: () => string | null);
    fetchToken(): string | null;
}
export declare class KGConfig {
    endpoint: string;
    idNamespace: string;
    tokenHandler: TokenHandler | null;
    constructor(endpoint: string, tokenHandler: TokenHandler | null, idNamespace: string);
}
export declare class KGRequestWithResponseContext {
    content?: any;
    requestArguments?: any;
    requestPayload?: any;
    statusCode?: number;
    idNamespace: string;
    kgConfig: KGConfig;
    constructor(kgConfig: KGConfig, content?: any, requestArguments?: any, requestPayload?: any, statusCode?: number);
    copyContext(content: any): KGRequestWithResponseContext;
    nextPage(originalStartFrom: number, originalSize: number): Promise<KGRequestWithResponseContext>;
    _defineArgumentsForNextPage(newStartFrom: number, newSize: number): any;
}
export declare abstract class RequestsWithTokenHandler {
    kgConfig: KGConfig;
    constructor(kgConfig: KGConfig);
    _setHeaders(options: RequestInit): void;
    _request(method: string, path: string, payload: any | null, params: any): Promise<KGRequestWithResponseContext>;
    _buildUrl(url: string, params: any): URL;
    _doRequest(args: any, payload: any | null): Promise<KGRequestWithResponseContext>;
    _get(path: string, params: any): Promise<KGRequestWithResponseContext>;
    _post(path: string, payload: any | null, params: any): Promise<KGRequestWithResponseContext>;
    _put(path: string, payload: any | null, params: any): Promise<KGRequestWithResponseContext>;
    _delete(path: string, params: any): Promise<KGRequestWithResponseContext>;
    _patch(path: string, payload: any | null, params: any): Promise<KGRequestWithResponseContext>;
}

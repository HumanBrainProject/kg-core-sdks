export declare enum Stage {
    IN_PROGRESS = "IN_PROGRESS",
    RELEASED = "RELEASED"
}
export declare enum ReleaseTreeScope {
    TOP_INSTANCE_ONLY = "TOP_INSTANCE_ONLY",
    CHILDREN_ONLY = "CHILDREN_ONLY"
}
export declare class Pagination {
    start: number;
    size: number;
    returnTotalResults: boolean;
    constructor(start?: number, size?: number, returnTotalResults?: boolean);
}
export declare class ResponseConfiguration {
    returnAlternatives?: boolean;
    returnEmbedded?: boolean;
    returnPayload?: boolean;
    returnPermissions?: boolean;
    constructor(returnAlternatives?: boolean, returnEmbedded?: boolean, returnPayload?: boolean, returnPermissions?: boolean);
}
export declare class ExtendedResponseConfiguration extends ResponseConfiguration {
    incomingLinksPageSize?: number;
    returnIncomingLinks?: boolean;
    constructor(incomingLinksPageSize?: number, returnAlternatives?: boolean, returnEmbedded?: boolean, returnIncomingLinks?: boolean, returnPayload?: boolean, returnPermissions?: boolean);
}

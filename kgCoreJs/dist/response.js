export var ReleaseStatus;
(function (ReleaseStatus) {
    ReleaseStatus["RELEASED"] = "RELEASED";
    ReleaseStatus["UNRELEASED"] = "UNRELEASED";
    ReleaseStatus["HAS_CHANGED"] = "HAS_CHANGED";
})(ReleaseStatus || (ReleaseStatus = {}));
export class JsonLdDocument {
    constructor(json, idNamespace) {
        Object.keys(json).forEach((key) => {
            this[key] = json[key];
        });
        this.idNamespace = idNamespace;
    }
    toUuid(value) {
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
    constructor(data, idNamespace) {
        var _a;
        super(data, idNamespace);
        this.instanceId = (_a = this["@id"]) !== null && _a !== void 0 ? _a : null;
        this.uuid = this.toUuid(this.instanceId);
    }
}
export class TermsOfUse {
    constructor(data) {
        var _a;
        this.accepted = (_a = data["accepted"]) !== null && _a !== void 0 ? _a : false;
        this.version = data["version"];
        this.data = data["data"];
    }
}
export class KGError {
    constructor(code, message, uuid) {
        this.code = code;
        this.message = message;
        this.uuid = uuid;
    }
}
export class Scope {
    constructor(data) {
        this.uuid = data["id"];
        this.label = data["label"];
        this.space = data["space"];
        this.types = data["types"];
        this.children = data["children"];
        this.permissions = data["permissions"];
    }
}
export class SpaceInformation {
    constructor(data) {
        this.identifier = data["http://schema.org/identifier"];
        this.name = data["http://schema.org/name"];
        this.permissions = data["https://core.kg.ebrains.eu/vocab/meta/permissions"];
    }
}
export class TypeInformation {
    constructor(data) {
        this.identifier = data["http://schema.org/identifier"];
        this.description = data["http://schema.org/description"];
        this.name = data["http://schema.org/name"];
        this.occurrences = data["https://core.kg.ebrains.eu/vocab/meta/occurrences"];
    }
}
class ReducedUserInformation {
    constructor(data) {
        this.alternateName = data["http://schema.org/alternateName"];
        this.name = data["http://schema.org/name"];
        this.uuid = data["@id"];
    }
}
export class ListOfUUID extends Array {
    //WARNING: Do not extend this class
    constructor(items) {
        super(...items);
        Object.setPrototypeOf(this, Array.prototype);
    }
}
export class ListOfReducedUserInformation extends Array {
    //WARNING: Do not extend this class
    constructor(items) {
        super(...items);
        Object.setPrototypeOf(this, Array.prototype);
    }
}
export class User {
    constructor(user) {
        this.alternateName = user["http://schema.org/alternateName"];
        this.name = user["http://schema.org/name"];
        this.email = user["http://schema.org/email"];
        this.givenName = user["http://schema.org/givenName"];
        this.familyName = user["http://schema.org/familyName"];
        this.identifiers = user["http://schema.org/identifier"];
    }
}
class UserWithRoles {
    constructor(user, clientRoles, userRoles, invitations, clientId) {
        this.user = user;
        this.clientRoles = clientRoles;
        this.userRoles = userRoles;
        this.invitations = invitations;
        this.clientId = clientId;
    }
}
const errorStatusText = {
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
export const translateError = (response) => {
    var _a;
    if (((_a = response === null || response === void 0 ? void 0 : response.content) === null || _a === void 0 ? void 0 : _a.error) &&
        !(response.content.error instanceof String)) {
        return new KGError(response.statusCode, response.content.error, response.idNamespace);
    }
    else {
        if (response.statusCode && response.statusCode >= 400) {
            return new KGError(response.statusCode, errorStatusText[response.statusCode]);
        }
    }
    return null;
};
class _AbstractResult {
    constructor(response) {
        var _a, _b, _c, _d;
        this.message = (_a = response === null || response === void 0 ? void 0 : response.content) === null || _a === void 0 ? void 0 : _a.message;
        this.startTime = (_b = response === null || response === void 0 ? void 0 : response.content) === null || _b === void 0 ? void 0 : _b.startTime;
        this.durationInMs = (_c = response === null || response === void 0 ? void 0 : response.content) === null || _c === void 0 ? void 0 : _c.durationInMs;
        this.transactionId = (_d = response === null || response === void 0 ? void 0 : response.content) === null || _d === void 0 ? void 0 : _d.transactionId;
        this.error = translateError(response);
    }
}
class _AbstractResultPage extends _AbstractResult {
    constructor(response) {
        var _a, _b, _c;
        super(response);
        this.total = (_a = response === null || response === void 0 ? void 0 : response.content) === null || _a === void 0 ? void 0 : _a.total;
        this.size = (_b = response === null || response === void 0 ? void 0 : response.content) === null || _b === void 0 ? void 0 : _b.size;
        this.startFrom = (_c = response === null || response === void 0 ? void 0 : response.content) === null || _c === void 0 ? void 0 : _c.from;
    }
}
class ResponseObjectConstructor {
    static initResponseObject(constructor, data, idNamespace) {
        if (constructor === JsonLdDocument || constructor === Instance) {
            return new constructor(data, idNamespace);
        }
        else if (constructor === ReleaseStatus) {
            return constructor[data];
        }
        return new constructor(data);
    }
}
class ResultPageIterator {
    constructor(resultPage) {
        this.counter = 0;
        this.resultPage = resultPage;
    }
    next() {
        var _a, _b, _c;
        if (this.resultPage) {
            if (this.resultPage.error) {
                throw new Error((_c = (_b = (_a = this.resultPage) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : undefined);
            }
            else if (this.resultPage.data) {
                if (!this.resultPage.total ||
                    (this.resultPage.total && this.counter < this.resultPage.total)) {
                    if (this.resultPage.startFrom && this.resultPage.size) {
                        if (this.counter >=
                            this.resultPage.startFrom + this.resultPage.size &&
                            this.resultPage.hasNextPage()) {
                            this.resultPage = this.resultPage.nextPage();
                        }
                    }
                    if (this.resultPage && this.resultPage.startFrom) {
                        const result = this.resultPage.data[this.counter - this.resultPage.startFrom];
                        this.counter++;
                        return { value: result, done: false };
                    }
                }
            }
        }
        return { value: null, done: true };
    }
}
export class ResultPage extends _AbstractResultPage {
    constructor(response, constructor) {
        super(response);
        this.data = this._getData(constructor, response.content, response.idNamespace);
        this._originalResponse = response;
        this._originalConstructor = constructor;
    }
    _getData(constructor, content, idNamespace) {
        if (content === null || content === void 0 ? void 0 : content.data) {
            const d = content.data;
            return d.map(c => ResponseObjectConstructor.initResponseObject(constructor, c, idNamespace));
        }
        return [];
    }
    nextPage() {
        const nextPage = this.hasNextPage();
        if (nextPage === null || nextPage === true) {
            const result = this._originalResponse.nextPage(this.startFrom, this.size);
            const resultPage = new ResultPage(result, this._originalConstructor);
            if (resultPage && resultPage.data) {
                return resultPage;
            }
            return null;
        }
        return null;
    }
    hasNextPage() {
        if (this.total) {
            if (this.startFrom && this.size) {
                return this.startFrom + this.size < this.total;
            }
            return false;
        }
        return null;
    }
    items() {
        return new ResultPageIterator(this);
    }
}
export class Result extends _AbstractResult {
    constructor(response, constructor) {
        var _a, _b;
        super(response);
        this.data = ((_a = response === null || response === void 0 ? void 0 : response.content) === null || _a === void 0 ? void 0 : _a.data)
            ? ResponseObjectConstructor.initResponseObject(constructor, (_b = response.content) === null || _b === void 0 ? void 0 : _b.data, response.idNamespace)
            : null;
    }
}
;
export class ResultsById extends _AbstractResult {
    constructor(response, constructor) {
        var _a, _b;
        super(response);
        this.data = ((_a = response === null || response === void 0 ? void 0 : response.content) === null || _a === void 0 ? void 0 : _a.data)
            ? this._getData((_b = response.content) === null || _b === void 0 ? void 0 : _b.data, response, constructor)
            : null;
    }
    _getData(data, response, constructor) {
        return Object.entries(data).reduce((newObj, [key, val]) => {
            newObj[key] = new Result(response.copyContext(val), constructor);
            return newObj;
        }, {});
    }
}

package eu.ebrains.kg.sdk.communication;

import java.util.Map;

class KGRequest {
    private final String path;
    private final Object payload;
    private final Map<String, Object> queryParameters;
    private final String method;


    public KGRequest(String path, Object payload, Map<String, Object> queryParameters, String method) {
        this.path = path;
        this.payload = payload;
        this.queryParameters = queryParameters;
        this.method = method;
    }

    String getPath() {
        return path;
    }

    Object getPayload() {
        return payload;
    }

    Map<String, Object> getQueryParameters() {
        return queryParameters;
    }

    String getMethod() {
        return method;
    }
}

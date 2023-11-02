package eu.ebrains.kg.sdk.communication;

import java.net.http.HttpResponse;

public class KGResponseWithRequest {

    private final HttpResponse<String> response;
    private final KGRequest request;

    public KGResponseWithRequest(HttpResponse<String> response, KGRequest request) {
        this.response = response;
        this.request = request;
    }

    public HttpResponse<String> getResponse() {
        return response;
    }

    public KGRequest getRequest() {
        return request;
    }
}

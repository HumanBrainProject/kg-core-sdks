package eu.ebrains.kg.sdk.communication;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import eu.ebrains.kg.sdk.request.Stage;
import eu.ebrains.kg.sdk.utils.KGConfig;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class Communication {

    private final KGConfig kgConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final HttpClient httpClient = HttpClient.newHttpClient();

    protected Communication(KGConfig kgConfig) {
        this.kgConfig = kgConfig;
    }

    protected Stage getStage(){
        return this.kgConfig.getStage();
    }
    private void setHeaders(HttpRequest.Builder requestBuilder, boolean forceTokenFetch) {
        if (kgConfig.getTokenHandler().isPresent()) {
            final Optional<String> token = kgConfig.getTokenHandler().get().getToken(forceTokenFetch);
            token.ifPresent(s -> {
                requestBuilder.setHeader("Authorization", String.format("Bearer %s", s));
            });


            if (kgConfig.getClientTokenHandler().isPresent()) {
                final Optional<String> clientToken = kgConfig.getClientTokenHandler().get().getToken(forceTokenFetch);
                clientToken.ifPresent(s -> {
                    requestBuilder.setHeader("Client-Authorization", String.format("Bearer %s", s));
                });
            }
        }

    }

    private Optional<HttpRequest.BodyPublisher> getBodyPublisher(KGRequest requestDefinition) {
        try {
            String requestBody = requestDefinition.getPayload() != null ? objectMapper.writeValueAsString(requestDefinition.getPayload()) : null;
            if (requestBody == null) {
                return Optional.empty();
            } else {
                return Optional.of(HttpRequest.BodyPublishers.ofString(requestBody));
            }
        } catch (JsonProcessingException e) {
            return Optional.empty();
        }
    }


    private HttpRequest.Builder setupRequest(KGRequest requestDefinition, boolean forceTokenFetch) {
        final HttpRequest.Builder requestBuilder = HttpRequest.newBuilder();
        setHeaders(requestBuilder, forceTokenFetch);
        requestBuilder.uri(concatURI(requestDefinition.getPath(), requestDefinition.getQueryParameters()));

        Optional<HttpRequest.BodyPublisher> bodyPublisher = getBodyPublisher(requestDefinition);
        if (bodyPublisher.isPresent()) {
            requestBuilder.method(requestDefinition.getMethod(), bodyPublisher.get());
            requestBuilder.setHeader("Content-Type", "application/json");
        } else {
            requestBuilder.method(requestDefinition.getMethod(), HttpRequest.BodyPublishers.noBody());
        }
        return requestBuilder;
    }

    private Optional<HttpResponse<String>> executeRequest(KGRequest requestDefinition, boolean forceTokenFetch) {
        final HttpRequest.Builder requestBuilder = setupRequest(requestDefinition, forceTokenFetch);
        final HttpRequest request = requestBuilder.build();
        try {
            return Optional.of(httpClient.send(request, HttpResponse.BodyHandlers.ofString()));
        } catch (IOException | InterruptedException e) {
            return Optional.empty();
        }
    }

    private Optional<KGResponseWithRequest> doRequest(KGRequest requestDefinition) {
        Optional<HttpResponse<String>> response = executeRequest(requestDefinition, false);
        if (response.isEmpty() || response.get().statusCode() == HttpURLConnection.HTTP_UNAUTHORIZED) {
            response = executeRequest(requestDefinition, true);
        }
        return response.map(stringHttpResponse -> new KGResponseWithRequest(stringHttpResponse, requestDefinition));
    }


    private URI concatURI(String path, Map<String, Object> parameters) {
        StringBuilder queryString = new StringBuilder();
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            if (entry.getKey() != null && entry.getValue() != null) {
                if (queryString.length() > 0) {
                    queryString.append('&');
                }
                queryString.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                        .append('=')
                        .append(URLEncoder.encode(entry.getValue().toString(), StandardCharsets.UTF_8));
            }

        }
        final String params = queryString.toString();
        final String uri = String.format("%s%s%s", this.kgConfig.getEndpoint(), path, params.isEmpty() ? "" : String.format("?%s", params));
        try {
            return new URI(uri);
        } catch (URISyntaxException e) {
            throw new RuntimeException(String.format("Invalid URL: %s!", uri));

        }
    }

    protected Optional<KGResponseWithRequest> get(String path, Map<String, Object> params) {
        return doRequest(new KGRequest(path, null, params, "GET"));
    }

    protected Optional<KGResponseWithRequest> put(String path, Object payload, Map<String, Object> params) {
        return doRequest(new KGRequest(path, payload, params, "PUT"));
    }

    protected Optional<KGResponseWithRequest> post(String path, Object payload, Map<String, Object> params)  {
        return doRequest(new KGRequest(path, payload, params, "POST"));
    }

    protected Optional<KGResponseWithRequest> patch(String path, Object payload, Map<String, Object> params) {
        return doRequest(new KGRequest(path, payload, params, "PATCH"));
    }

    protected Optional<KGResponseWithRequest> delete(String path, Map<String, Object> params) {
        return doRequest(new KGRequest(path, null, params, "DELETE"));
    }

}

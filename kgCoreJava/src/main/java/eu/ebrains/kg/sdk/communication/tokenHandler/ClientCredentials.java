package eu.ebrains.kg.sdk.communication.tokenHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import eu.ebrains.kg.sdk.communication.tokenHandler.TokenHandler;
import eu.ebrains.kg.sdk.utils.OIDCConfig;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

public class ClientCredentials extends TokenHandler {

    private final String clientId;
    private final String clientSecret;

    private final OIDCConfig oidcConfig;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ClientCredentials(String clientId, String clientSecret, OIDCConfig oidcConfig) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.oidcConfig = oidcConfig;
    }

    @Override
    protected String fetchToken() {
        if (this.oidcConfig != null) {
            final String payload = String.format("grant_type=client_credentials&client_id=%s&client_secret=%s", clientId, clientSecret);
            try {
                final HttpRequest request = HttpRequest.newBuilder().uri(new URI(this.oidcConfig.getTokenEndpoint())).headers(CONTENT_TYPE, URL_ENCODED).POST(HttpRequest.BodyPublishers.ofString(payload)).build();
                final HttpResponse<String> response = this.httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response != null && response.statusCode() == 200 && response.body() != null) {
                    final Map<?, ?> mappedResponse = this.objectMapper.readValue(response.body(), HashMap.class);
                    final Object access_token = mappedResponse.get("access_token");
                    if (access_token instanceof String) {
                        return (String) access_token;
                    }
                }
            } catch (IOException | InterruptedException | URISyntaxException e) {
                throw new RuntimeException(e);
            }
        }
        return null;
    }
}

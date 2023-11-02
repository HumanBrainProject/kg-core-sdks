package eu.ebrains.kg.sdk.communication.tokenHandler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import eu.ebrains.kg.sdk.utils.OIDCConfig;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

public class DeviceAuthenticationFlow extends TokenHandler{
    private int pollIntervalInSecs = 1;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();


    private final String clientId;
    private final OIDCConfig oidcConfig;
    private String refreshToken;

    public DeviceAuthenticationFlow(String clientId, OIDCConfig oidcConfig) {
        this.clientId = clientId;
        this.oidcConfig = oidcConfig;
    }

    private Map<?, ?> pollForToken(String deviceCode){
        try {
            final String payload = String.format("grant_type=urn:ietf:params:oauth:grant-type:device_code&client_id=%s&device_code=%s", this.clientId, deviceCode);

            final HttpRequest request = HttpRequest.newBuilder().uri(new URI(this.oidcConfig.getTokenEndpoint())).headers(CONTENT_TYPE, URL_ENCODED).POST(HttpRequest.BodyPublishers.ofString(payload)).build();
            final HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 400) {
                final Map<?, ?> mappedResponse = this.objectMapper.readValue(response.body(), HashMap.class);
                final Object error = mappedResponse.get("error");
                if (error instanceof String) {
                    switch ((String) error) {
                        case "expired_token":
                            return null;
                        case "slow_down":
                            this.pollIntervalInSecs++;
                            break;
                        default:
                            break;
                    }
                }
                Thread.sleep(pollIntervalInSecs*1000);
                return pollForToken(deviceCode);
            } else if (response.statusCode() == 200) {
                return objectMapper.readValue(response.body(), HashMap.class);
            } else {
                return null;
            }
        } catch (URISyntaxException | IOException | InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    private Map<?,?> getTokenByRefreshToken() {
        try {
            final String payload = String.format("grant_type=refresh_token&client_id=%s&refresh_token=%s", clientId, refreshToken);
            final HttpRequest request = HttpRequest.newBuilder().uri(new URI(this.oidcConfig.getTokenEndpoint())).headers(CONTENT_TYPE, URL_ENCODED).POST(HttpRequest.BodyPublishers.ofString(payload)).build();
            final HttpResponse<String> response = this.httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                return this.objectMapper.readValue(response.body(), HashMap.class);
            } else {
                if (response.statusCode() == 401) {
                    // Reset refresh token
                    this.refreshToken = null;
                }
                return null;
            }
        } catch (URISyntaxException | IOException | InterruptedException e) {
            throw new RuntimeException(e);
        }

    }

    private Map<?,?> deviceFlow(){
        try {
            final String payload = String.format("client_id=%s", clientId);
            final HttpRequest request = HttpRequest.newBuilder().uri(new URI(this.oidcConfig.getDeviceAuthEndpoint())).headers(CONTENT_TYPE, URL_ENCODED).POST(HttpRequest.BodyPublishers.ofString(payload)).build();
            final HttpResponse<String> response = this.httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                final Map<?, ?> mappedResponse = this.objectMapper.readValue(response.body(), HashMap.class);
                final Object verificationUriComplete = mappedResponse.get("verification_uri_complete");
                final Object deviceCode = mappedResponse.get("device_code");
                if (verificationUriComplete instanceof String && deviceCode instanceof String) {
                    System.out.println("************************************************************************");
                    System.out.printf("To continue, you need to authenticate. To do so, please visit %s%n", verificationUriComplete);
                    System.out.println("************************************************************************");
                    return pollForToken((String) deviceCode);
                }
            }
            return null;
        } catch (IOException | InterruptedException | URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }

    private Map<?,?> findTokens(){
        Map<?,?> result = null;
        if(this.refreshToken != null){
            result = getTokenByRefreshToken();
        }
        if(result == null){
            if(this.clientId == null || this.oidcConfig == null){
                throw new RuntimeException("Configuration for device authentication flow is incomplete");
            }
            else{
                result = deviceFlow();
                if(result != null){
                    System.out.println("You are successfully authenticated! Thank you very much!");
                    System.out.println("************************************************************************");
                }
            }
        }
        if(result == null){
            System.out.println("Unfortunately, the authentication didn't succeed in time - please try again");
            System.out.println("************************************************************************");
            result = findTokens();
        }
        return result;
    }

    @Override
    protected String fetchToken() {
        final Map<?, ?> tokens = findTokens();
        final Object refreshToken = tokens.get("refresh_token");
        if(refreshToken instanceof String) {
            this.refreshToken = (String)refreshToken;
        }
        final Object accessToken = tokens.get("access_token");
        if(accessToken instanceof String){
            return (String) accessToken;
        }
        return null;
    }
}

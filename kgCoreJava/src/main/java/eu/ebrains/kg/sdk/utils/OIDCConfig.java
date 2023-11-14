package eu.ebrains.kg.sdk.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import eu.ebrains.kg.sdk.KG;
import eu.ebrains.kg.sdk.response.JsonLdDocument;
import eu.ebrains.kg.sdk.response.Result;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class OIDCConfig {

    private final String wellKnown;
    private final String deviceAuthEndpoint;
    private final String tokenEndpoint;

    private OIDCConfig(String wellKnown, String deviceAuthEndpoint, String tokenEndpoint) {
        this.wellKnown = wellKnown;
        this.deviceAuthEndpoint = deviceAuthEndpoint;
        this.tokenEndpoint = tokenEndpoint;
    }

    public String getDeviceAuthEndpoint() {
        return deviceAuthEndpoint;
    }

    public String getTokenEndpoint() {
        return tokenEndpoint;
    }

    public static Optional<OIDCConfig> fetchByOpenIdConfig(String wellKnown){
        try {
            final HttpRequest build = HttpRequest.newBuilder().GET().uri(new URI(wellKnown)).build();
            final HttpResponse<String> result = HttpClient.newHttpClient().send(build, HttpResponse.BodyHandlers.ofString(Charset.defaultCharset()));
            if (result != null && result.body()!=null) {
                final Map<?,?> map = new ObjectMapper().readValue(result.body(), HashMap.class);
                Object tokenEndpoint = map.get("token_endpoint");
                Object deviceAuthEndpoint = map.get("device_authorization_endpoint");
                if(tokenEndpoint instanceof String && deviceAuthEndpoint instanceof String) {
                    return Optional.of(new OIDCConfig(wellKnown, (String)deviceAuthEndpoint, (String)tokenEndpoint));
                }
            }
        }
        catch (URISyntaxException e){
            throw new RuntimeException(String.format("Was not able to fetch OIDC configuration at URL %s", wellKnown), e);
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException(e);
        }
        return Optional.empty();
    }

    public static Optional<OIDCConfig> fetchByKG(String kgHostName){
        final KG.Client unauthenticatedClient = KG.createClient(kgHostName,null, null, null, null, false);
        final Result<JsonLdDocument> response = unauthenticatedClient.setup.getOpenIdConfigUrl().invoke();
        if(response!=null && response.getData()!=null && response.getData().get("endpoint") instanceof String wellKnown){
            return fetchByOpenIdConfig(wellKnown);
        }
        return Optional.empty();
    }

}

package eu.ebrains.kg.sdk.utils;

import eu.ebrains.kg.sdk.KG;
import eu.ebrains.kg.sdk.communication.tokenHandler.*;
import eu.ebrains.kg.sdk.request.Stage;

import java.util.Optional;

public class KGClientBuilder {
    private String hostName = "core.kg.ebrains.eu";
    private String idNamespace = "https://kg.ebrains.eu/api/instances/";

    private boolean enableProfiling;
    private TokenHandler tokenHandler;
    private TokenHandler clientTokenHandler;

    private OIDCConfig oidcConfig;

    private Stage stage = Stage.RELEASED;

    private Optional<TokenHandler> resolveTokenHandler(){
        if(this.tokenHandler == null){
            this.withDeviceFlow();
        }
        return Optional.ofNullable(this.tokenHandler);
    }

    private Optional<OIDCConfig> getOidcConfig(){
        if(oidcConfig == null){
            final Optional<OIDCConfig> oidc = OIDCConfig.fetchByKG(this.hostName);
            oidc.ifPresent(config -> this.oidcConfig = config);
        }
        return Optional.ofNullable(this.oidcConfig);
    }
    public KGClientBuilder withDeviceFlow() {
        return withDeviceFlow("kg-core-python", null);
    }

    public KGClientBuilder withDeviceFlow(String clientId, String openIdConfigurationUrl){
        final Optional<OIDCConfig> oidc = openIdConfigurationUrl == null ? getOidcConfig() : OIDCConfig.fetchByOpenIdConfig(openIdConfigurationUrl);
        this.tokenHandler = new DeviceAuthenticationFlow(clientId, oidc.orElse(null));
        return this;
    }

    public KGClientBuilder withToken(String token){
        this.tokenHandler = new SimpleToken(token);
        return this;
    }

    public KGClientBuilder withCredentials(String clientId, String clientSecret){
        this.tokenHandler = new ClientCredentials(clientId, clientSecret, getOidcConfig().orElse(null));
        return this;
    }

    public KGClientBuilder withCustomTokenProvider(CallableTokenHandler tokenProvider) {
        this.tokenHandler = tokenProvider;
        return this;
    }

    public KGClientBuilder addClientAuthentication(String clientId, String clientSecret){
        this.clientTokenHandler = new ClientCredentials(clientId, clientSecret, getOidcConfig().orElse(null));
        return this;
    }

    public KG.Client build(){
        return KG.createClient(this.hostName, this.stage, this.idNamespace, this.resolveTokenHandler().orElse(null), clientTokenHandler, enableProfiling);
    }

    public KG.Admin buildAdmin() {
        return KG.createAdmin(this.hostName, this.stage, this.idNamespace, this.resolveTokenHandler().orElse(null), clientTokenHandler, enableProfiling);
    }

    /**
     *
     * @param hostName - the hostname without protocol (e.g. "core.kg.ebrains.eu" and NOT "https://core.kg.ebrains.eu")
     * @return
     */
    public KGClientBuilder host(String hostName) {
        this.hostName = hostName;
        return this;
    }

    public KGClientBuilder idNamespace(String idNamespace){
        this.idNamespace = idNamespace;
        return this;
    }

    public KGClientBuilder stage(Stage stage){
        this.stage = stage;
        return this;
    }
}

package eu.ebrains.kg.sdk.utils;

import eu.ebrains.kg.sdk.communication.tokenHandler.TokenHandler;
import eu.ebrains.kg.sdk.request.Stage;

import java.util.Optional;

public class KGConfig {

    private final String endpoint;
    private final TokenHandler tokenHandler;
    private final TokenHandler clientTokenHandler;
    private final String idNamespace;
    private final boolean enableProfiling;

    private final Stage stage;

    public KGConfig(String endpoint, TokenHandler tokenHandler, TokenHandler clientTokenHandler, Stage stage, String idNamespace, boolean enableProfiling) {
        this.endpoint = endpoint;
        this.tokenHandler = tokenHandler;
        this.clientTokenHandler = clientTokenHandler;
        this.stage = stage;
        this.idNamespace = idNamespace;
        this.enableProfiling = enableProfiling;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public Optional<TokenHandler> getTokenHandler() {
        return Optional.ofNullable(tokenHandler);
    }

    public Optional<TokenHandler> getClientTokenHandler() {
        return Optional.ofNullable(clientTokenHandler);
    }

    public String getIdNamespace() {
        return idNamespace;
    }

    public boolean isEnableProfiling() {
        return enableProfiling;
    }

    public Stage getStage() {
        return stage;
    }

    private static String calculate_base_url(String host) {
        return String.format("http%s://%s/v3/", host.startsWith("localhost") ? "" : "s", host);
    }

    public static KGConfig buildConfig(String host, Stage stage, String idNamespace, TokenHandler tokenHandler, TokenHandler clientTokenHandler, boolean enableProfiling){
        if(host == null || host.isBlank()) {
            throw new RuntimeException("No hostname specified");
        }
       return new KGConfig(calculate_base_url(host), tokenHandler, clientTokenHandler, stage, idNamespace, enableProfiling);
    }
}

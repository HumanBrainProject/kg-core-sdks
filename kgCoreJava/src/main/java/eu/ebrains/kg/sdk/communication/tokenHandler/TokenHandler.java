package eu.ebrains.kg.sdk.communication.tokenHandler;

import java.util.Optional;

public abstract class TokenHandler {
    private String token;

    protected final static String URL_ENCODED = "application/x-www-form-urlencoded";
    protected final static String CONTENT_TYPE = "Content-Type";

    public synchronized Optional<String> getToken(boolean forceFetch){
        if(token == null || forceFetch){
            this.token = fetchToken();
        }
        return Optional.ofNullable(this.token);
    }

    protected abstract String fetchToken();

}

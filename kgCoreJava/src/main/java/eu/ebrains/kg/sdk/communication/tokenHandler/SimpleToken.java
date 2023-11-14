package eu.ebrains.kg.sdk.communication.tokenHandler;

public class SimpleToken extends TokenHandler{
    private final String token;

    public SimpleToken(String token) {
        this.token = token;
    }

    @Override
    protected String fetchToken() {
        return this.token;
    }
}

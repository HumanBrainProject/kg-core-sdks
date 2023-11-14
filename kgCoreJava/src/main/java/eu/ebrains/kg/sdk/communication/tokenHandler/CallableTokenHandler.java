package eu.ebrains.kg.sdk.communication.tokenHandler;

import java.util.concurrent.Callable;

public class CallableTokenHandler extends TokenHandler {

    private final Callable<String> callable;

    public CallableTokenHandler(Callable<String> callable) {
        this.callable = callable;
    }

    public String fetchToken() {
        try {
            return this.callable.call();
        } catch (Exception e) {
            return null;
        }
    }
}

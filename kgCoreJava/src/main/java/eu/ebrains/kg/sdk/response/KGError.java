package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public class KGError {
    private final int code;
    private final String message;
    @JsonProperty(value = "instanceId")
    private final UUID uuid;

    public KGError(int code, String message, UUID uuid) {
        this.code = code;
        this.message = message;
        this.uuid = uuid;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public UUID getUuid() {
        return uuid;
    }
}

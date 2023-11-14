package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record KGError(int code, String message, UUID uuid) {
    public KGError(@JsonProperty(value = "code") int code, @JsonProperty(value = "message") String message, @JsonProperty(value = "instanceId") UUID uuid) {
        this.code = code;
        this.message = message;
        this.uuid = uuid;
    }
}

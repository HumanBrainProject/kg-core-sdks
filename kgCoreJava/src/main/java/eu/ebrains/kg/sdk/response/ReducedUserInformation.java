package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public class ReducedUserInformation {
    @JsonProperty("http://schema.org/alternateName")
    private final String alternateName;
    @JsonProperty("http://schema.org/name")
    private final String name;
    @JsonProperty("@id")
    private final UUID uuid;

    public ReducedUserInformation(String alternateName, String name, UUID uuid) {
        this.alternateName = alternateName;
        this.name = name;
        this.uuid = uuid;
    }

    public String getAlternateName() {
        return alternateName;
    }

    public String getName() {
        return name;
    }

    public UUID getUuid() {
        return uuid;
    }
}

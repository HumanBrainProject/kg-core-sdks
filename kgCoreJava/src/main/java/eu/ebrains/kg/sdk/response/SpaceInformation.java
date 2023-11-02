package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class SpaceInformation {
    @JsonProperty("http://schema.org/identifier")
    private final String identifier;
    @JsonProperty("http://schema.org/name")
    private final String name;
    @JsonProperty("https://core.kg.ebrains.eu/vocab/meta/permissions")
    private final List<String> permissions;

    public SpaceInformation(String identifier, String name, List<String> permissions) {
        this.identifier = identifier;
        this.name = name;
        this.permissions = permissions;
    }

    public String getIdentifier() {
        return identifier;
    }

    public String getName() {
        return name;
    }

    public List<String> getPermissions() {
        return permissions;
    }
}

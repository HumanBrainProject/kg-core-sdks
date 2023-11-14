package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SpaceInformation(String identifier, String name, List<String> permissions) {

    public SpaceInformation(@JsonProperty("http://schema.org/identifier") String identifier,
                            @JsonProperty("http://schema.org/name") String name,
                            @JsonProperty("https://core.kg.ebrains.eu/vocab/meta/permissions") List<String> permissions) {
        this.identifier = identifier;
        this.name = name;
        this.permissions = permissions;
    }
}

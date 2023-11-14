package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Scope(UUID uuid, String label, String space, List<String> types, List<Scope> children, List<String> permissions) {

    public Scope(@JsonProperty("id") UUID uuid, @JsonProperty("label") String label, @JsonProperty("space") String space,
                 @JsonProperty("types") List<String> types, @JsonProperty("children") List<Scope> children,
                 @JsonProperty("permissions") List<String> permissions) {
        this.uuid = uuid;
        this.label = label;
        this.space = space;
        this.types = types;
        this.children = children;
        this.permissions = permissions;
    }
}

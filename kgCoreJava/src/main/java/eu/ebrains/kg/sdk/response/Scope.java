package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.UUID;

public class Scope {

    @JsonProperty("id")
    private final UUID uuid;
    private final String label;
    private final String space;
    private final List<String> types;
    private final List<Scope> children;
    private final List<String> permissions;

    public Scope(UUID uuid, String label, String space, List<String> types, List<Scope> children, List<String> permissions) {
        this.uuid = uuid;
        this.label = label;
        this.space = space;
        this.types = types;
        this.children = children;
        this.permissions = permissions;
    }

    public UUID getUuid() {
        return uuid;
    }

    public String getLabel() {
        return label;
    }

    public String getSpace() {
        return space;
    }

    public List<String> getTypes() {
        return types;
    }

    public List<Scope> getChildren() {
        return children;
    }

    public List<String> getPermissions() {
        return permissions;
    }
}

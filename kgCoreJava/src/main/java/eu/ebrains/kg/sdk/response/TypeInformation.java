package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TypeInformation {
    @JsonProperty("http://schema.org/identifier")
    private final String identifier;
    @JsonProperty("http://schema.org/description")
    private final String description;
    @JsonProperty("http://schema.org/name")
    private final String name;
    @JsonProperty("https://core.kg.ebrains.eu/vocab/meta/occurrences")
    private final Integer occurrences;

    public TypeInformation(String identifier, String description, String name, Integer occurrences) {
        this.identifier = identifier;
        this.description = description;
        this.name = name;
        this.occurrences = occurrences;
    }

    public String getIdentifier() {
        return identifier;
    }

    public String getDescription() {
        return description;
    }

    public String getName() {
        return name;
    }

    public Integer getOccurrences() {
        return occurrences;
    }
}

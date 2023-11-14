package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TypeInformation(String identifier, String description, String name, Integer occurrences, List<Space> spaces, String color, String labelProperty) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Space(Integer occurrences, String space) {
        public Space(@JsonProperty("https://core.kg.ebrains.eu/vocab/meta/occurrences") Integer occurrences, @JsonProperty("https://core.kg.ebrains.eu/vocab/meta/space") String space) {
            this.occurrences = occurrences;
            this.space = space;
        }
    }

    public TypeInformation(@JsonProperty("http://schema.org/identifier") String identifier,
                           @JsonProperty("http://schema.org/description") String description,
                           @JsonProperty("http://schema.org/name") String name,
                           @JsonProperty("https://core.kg.ebrains.eu/vocab/meta/occurrences") Integer occurrences,
                           @JsonProperty("https://core.kg.ebrains.eu/vocab/meta/spaces") List<Space> spaces,
                           @JsonProperty("https://core.kg.ebrains.eu/vocab/meta/color") String color,
                           @JsonProperty("https://core.kg.ebrains.eu/vocab/meta/labelProperty") String labelProperty
    ) {
        this.identifier = identifier;
        this.description = description;
        this.name = name;
        this.occurrences = occurrences;
        this.spaces = spaces;
        this.color = color;
        this.labelProperty = labelProperty;
    }
}

package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record User(String alternateName, String name, String email, String givenName, String familyName, List<String> identifiers) {

    public User(@JsonProperty("http://schema.org/alternateName") String alternateName,
                @JsonProperty("http://schema.org/name") String name,
                @JsonProperty("http://schema.org/email") String email,
                @JsonProperty("http://schema.org/givenName") String givenName,
                @JsonProperty("http://schema.org/familyName") String familyName,
                @JsonProperty("http://schema.org/identifier") List<String> identifiers) {
        this.alternateName = alternateName;
        this.name = name;
        this.email = email;
        this.givenName = givenName;
        this.familyName = familyName;
        this.identifiers = identifiers;
    }
}

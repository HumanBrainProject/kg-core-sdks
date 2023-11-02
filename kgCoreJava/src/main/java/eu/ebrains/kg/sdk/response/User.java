package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class User {
    @JsonProperty("http://schema.org/alternateName")
    private final String alternateName;
    @JsonProperty("http://schema.org/name")
    private final String name;
    @JsonProperty("http://schema.org/email")
    private final String email;
    @JsonProperty("http://schema.org/givenName")
    private final String givenName;
    @JsonProperty("http://schema.org/familyName")
    private final String familyName;
    @JsonProperty("http://schema.org/identifier")
    private final List<String> identifiers;

    public User(String alternateName, String name, String email, String givenName, String familyName, List<String> identifiers) {
        this.alternateName = alternateName;
        this.name = name;
        this.email = email;
        this.givenName = givenName;
        this.familyName = familyName;
        this.identifiers = identifiers;
    }

    public String getAlternateName() {
        return alternateName;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getGivenName() {
        return givenName;
    }

    public String getFamilyName() {
        return familyName;
    }

    public List<String> getIdentifiers() {
        return identifiers;
    }
}

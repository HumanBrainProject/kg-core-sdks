package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserWithRoles(User user, List<String> clientRoles, List<String> userRoles, List<String> invitations, String clientId, List<Permission> permissions) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Permission(String functionality, String space, String id) {
        public Permission(@JsonProperty("functionality") String functionality,
                          @JsonProperty("space") String space,
                          @JsonProperty("id") String id) {
            this.functionality = functionality;
            this.space = space;
            this.id = id;
        }
    }

    public UserWithRoles(@JsonProperty("user") User user,
                         @JsonProperty("clientRoles") List<String> clientRoles,
                         @JsonProperty("userRoles") List<String> userRoles,
                         @JsonProperty("invitations") List<String> invitations,
                         @JsonProperty("clientId") String clientId,
                         @JsonProperty("permissions") List<Permission> permissions) {
        this.user = user;
        this.clientRoles = clientRoles;
        this.userRoles = userRoles;
        this.invitations = invitations;
        this.clientId = clientId;
        this.permissions = permissions;
    }
}

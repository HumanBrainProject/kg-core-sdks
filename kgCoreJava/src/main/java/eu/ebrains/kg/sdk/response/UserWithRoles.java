package eu.ebrains.kg.sdk.response;

import java.util.List;

public class UserWithRoles {
    private final User user;
    private final List<String> clientRoles;
    private final List<String> userRoles;
    private final List<String> invitations;
    private final String clientId;


    public UserWithRoles(User user, List<String> clientRoles, List<String> userRoles, List<String> invitations, String clientId) {
        this.user = user;
        this.clientRoles = clientRoles;
        this.userRoles = userRoles;
        this.invitations = invitations;
        this.clientId = clientId;
    }

    public User getUser() {
        return user;
    }

    public List<String> getClientRoles() {
        return clientRoles;
    }

    public List<String> getUserRoles() {
        return userRoles;
    }

    public List<String> getInvitations() {
        return invitations;
    }

    public String getClientId() {
        return clientId;
    }
}

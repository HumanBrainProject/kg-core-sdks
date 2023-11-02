package eu.ebrains.kg.sdk.response;

public class TermsOfUse {
    private final boolean accepted;
    private final String version;
    private final String data;

    public TermsOfUse(boolean accepted, String version, String data) {
        this.accepted = accepted;
        this.version = version;
        this.data = data;
    }

    public boolean isAccepted() {
        return accepted;
    }

    public String getVersion() {
        return version;
    }

    public String getData() {
        return data;
    }
}

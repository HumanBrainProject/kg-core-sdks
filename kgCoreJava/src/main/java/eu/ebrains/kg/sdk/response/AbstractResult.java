package eu.ebrains.kg.sdk.response;

abstract class AbstractResult {
    private final String message;
    private final Integer startTime;
    private final Integer durationInMs;
    private final Integer transactionId;
    private final KGError error;

    public AbstractResult(String message, Integer startTime, Integer durationInMs, Integer transactionId, KGError error) {
        this.message = message;
        this.startTime = startTime;
        this.durationInMs = durationInMs;
        this.transactionId = transactionId;
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public Integer getStartTime() {
        return startTime;
    }

    public Integer getDurationInMs() {
        return durationInMs;
    }

    public Integer getTransactionId() {
        return transactionId;
    }

    public KGError getError() {
        return error;
    }
}

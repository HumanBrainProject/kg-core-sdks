package eu.ebrains.kg.sdk.response;

public class AbstractResultPage extends AbstractResult{
    private final Integer total;
    private final Integer size;
    private final Integer from;

    public AbstractResultPage(String message, Integer startTime, Integer durationInMs, Integer transactionId, KGError error, Integer total, Integer size, Integer from) {
        super(message, startTime, durationInMs, transactionId, error);
        this.total = total;
        this.size = size;
        this.from = from;
    }

    public Integer getTotal() {
        return total;
    }

    public Integer getSize() {
        return size;
    }

    public Integer getFrom() {
        return from;
    }
}

package eu.ebrains.kg.sdk.response;

import eu.ebrains.kg.sdk.communication.KGResponseWithRequest;

import java.util.Map;
import java.util.Optional;

public class ResultsById<T> extends AbstractResult{
    private final Map<String, Result<T>> data;

    public ResultsById(String message, Integer startTime, Integer durationInMs, Integer transactionId, KGError error, Map<String, Result<T>> data) {
        super(message, startTime, durationInMs, transactionId, error);
        this.data = data;
    }

    public static <T> ResultsById<T> translate(KGResponseWithRequest result, Class<T> clazz){
        //TODO
        return null;
    }

    public Map<String, Result<T>> getData() {
        return data;
    }
}

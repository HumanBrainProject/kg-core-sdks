package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import eu.ebrains.kg.sdk.communication.KGResponseWithRequest;

import java.util.*;

public class ResultsById<T> extends AbstractResult{
    private final Map<String, Result<T>> data;


    private final static ObjectMapper objectMapper = new ObjectMapper();

    public ResultsById(String message, Integer startTime, Integer durationInMs, Integer transactionId, KGError error, Map<String, Result<T>> data) {
        super(message, startTime, durationInMs, transactionId, error);
        this.data = data;
    }

    public static <T> ResultsById<T> translate(String idNamespace, KGResponseWithRequest result, Class<T> clazz){
        try{
            if(result != null && result.getResponse() != null) {
                if (result.getResponse().body() != null) {
                    final String body = result.getResponse().body();
                    Map<?, ?> response = objectMapper.readValue(body, HashMap.class);
                    Map<String, Result<T>> r = new HashMap<>();
                    if (response.get("data") instanceof Map) {
                        ((Map<?,?>)response.get("data")).forEach((k, v) -> {
                            if (v instanceof Map) {
                                r.put((String) k, Result.doTranslate(idNamespace, (Map<?, ?>) v, clazz));
                            }
                        });
                    }
                    KGError error = null;
                    if (response.get("error") != null) {
                        error = objectMapper.readValue(objectMapper.writeValueAsString(response.get("error")), KGError.class);
                    }
                    final Object message = response.get("message");
                    final Object startTime = response.get("startTime");
                    final Object durationInMs = response.get("durationInMs");
                    final Object transactionId = response.get("transactionId");
                    return new ResultsById<>(
                            message instanceof String ? (String) message : null,
                            startTime instanceof Integer ? (Integer) startTime : null,
                            durationInMs instanceof Integer ? (Integer) durationInMs : null,
                            transactionId instanceof Integer ? (Integer) transactionId : null,
                            error,
                            r);
                }
                return new ResultsById<>(null, null, null, null, new KGError(result.getResponse().statusCode(), null, null), null);
            }
            return new ResultsById<>(null, null, null, null, new KGError(500, "Empty result", null), null);
        } catch (JsonProcessingException e) {
            return new ResultsById<>(null, null, null, null, new KGError(500, e.getMessage(), null), null);
        }
    }

    public Map<String, Result<T>> getData() {
        return data;
    }
}

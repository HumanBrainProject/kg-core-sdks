package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import eu.ebrains.kg.sdk.communication.KGResponseWithRequest;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

public class Result<T> extends AbstractResult {
    private final T data;

    private final static ObjectMapper objectMapper = new ObjectMapper();

    public static <T> Result<T> translate(KGResponseWithRequest result, Class<T> clazz) {
        try {
            if (result != null && result.getResponse() != null) {
                if (result.getResponse().body() != null) {
                    final String body = result.getResponse().body();
                    Map<?, ?> response = objectMapper.readValue(body, HashMap.class);
                    T data = null;
                    if (response.get("data") != null) {
                        data = objectMapper.readValue(objectMapper.writeValueAsString(response.get("data")), clazz);
                    }
                    KGError error = null;
                    if (response.get("error") != null) {
                        error = objectMapper.readValue(objectMapper.writeValueAsString(response.get("error")), KGError.class);
                    }
                    final Object message = response.get("message");
                    final Object startTime = response.get("startTime");
                    final Object durationInMs = response.get("durationInMs");
                    final Object transactionId = response.get("transactionId");
                    return new Result<>(
                            message instanceof String ? (String) message : null,
                            startTime instanceof Integer ? (Integer) startTime : null,
                            durationInMs instanceof Integer ? (Integer) durationInMs : null,
                            transactionId instanceof Integer ? (Integer) transactionId : null,
                            error, data);

                }
                return new Result<>(null, null, null, null, new KGError(result.getResponse().statusCode(), null, null), null);
            }
            return new Result<>(null, null, null, null, new KGError(500, "Empty result", null), null);
        } catch (JsonProcessingException e) {
            return new Result<>(null, null, null, null, new KGError(500, e.getMessage(), null), null);
        }
    }

    public Result(String message, Integer startTime, Integer durationInMs, Integer transactionId, KGError error, T data) {
        super(message, startTime, durationInMs, transactionId, error);
        this.data = data;
    }

    public T getData() {
        return data;
    }
}

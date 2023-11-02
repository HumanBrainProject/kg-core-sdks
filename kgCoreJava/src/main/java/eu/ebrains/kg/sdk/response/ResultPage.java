package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import eu.ebrains.kg.sdk.communication.KGResponseWithRequest;

import java.util.*;
import java.util.function.Consumer;

public class ResultPage<T> extends AbstractResultPage {

    private final List<T> data;

    private final static ObjectMapper objectMapper = new ObjectMapper();

    public static <T> ResultPage<T> translate(KGResponseWithRequest result, Class<T> clazz){
        try{
            if(result != null && result.getResponse() != null) {
                if (result.getResponse().body() != null) {
                    final String body = result.getResponse().body();
                    Map<?, ?> response = objectMapper.readValue(body, HashMap.class);
                    List<T> resultList = null;
                    if (response.get("data") instanceof List) {
                        resultList = new ArrayList<>();
                        for (Object item : ((List<?>) response.get("data"))) {
                            resultList.add(objectMapper.readValue(objectMapper.writeValueAsString(item), clazz));
                        }
                    }
                    KGError error = null;
                    if (response.get("error") != null) {
                        error = objectMapper.readValue(objectMapper.writeValueAsString(response.get("error")), KGError.class);
                    }
                    final Object message = response.get("message");
                    final Object startTime = response.get("startTime");
                    final Object durationInMs = response.get("durationInMs");
                    final Object transactionId = response.get("transactionId");
                    final Object total = response.get("total");
                    final Object size = response.get("size");
                    final Object from = response.get("from");
                    return new ResultPage<>(
                            message instanceof String ? (String) message : null,
                            startTime instanceof Integer ? (Integer) startTime : null,
                            durationInMs instanceof Integer ? (Integer) durationInMs : null,
                            transactionId instanceof Integer ? (Integer) transactionId : null,
                            error,
                            total instanceof Integer ? (Integer) total : null,
                            size instanceof Integer ? (Integer) size : null,
                            from instanceof Integer ? (Integer) from : null,
                            resultList);
                }
                return new ResultPage<>(null, null, null, null, new KGError(result.getResponse().statusCode(), null, null), null, null, null, null);
            }
            return new ResultPage<>(null, null, null, null, new KGError(500, "Empty result", null), null, null, null, null);
        } catch (JsonProcessingException e) {
            return new ResultPage<>(null, null, null, null, new KGError(500, e.getMessage(), null), null, null, null, null);
        }
    }

    public ResultPage(String message, Integer startTime, Integer durationInMs, Integer transactionId, KGError error, Integer total, Integer size, Integer from, List<T> data) {
        super(message, startTime, durationInMs, transactionId, error, total, size, from);
        this.data = data;
    }

    public List<T> getData() {
        return data;
    }

    public Optional<Boolean> hasNextPage(){
        if(getTotal()!=null){
            if(getFrom() != null && getSize()!=null){
                return Optional.of(getFrom()+getSize() < getTotal());
            }
            return Optional.of(false);
        }
        return Optional.empty();
    }

    public boolean isSuccessful(){
        return this.getError() == null && this.getData() != null;
    }


}

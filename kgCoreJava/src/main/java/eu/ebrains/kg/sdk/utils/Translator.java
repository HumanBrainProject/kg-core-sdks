package eu.ebrains.kg.sdk.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import eu.ebrains.kg.sdk.communication.KGResponseWithRequest;
import eu.ebrains.kg.sdk.response.KGError;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public class Translator {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static UUID fromInstanceId(String instanceId, String idNamespace){
        if(instanceId!=null && instanceId.startsWith(idNamespace)){
            try{
                return UUID.fromString(instanceId.substring(idNamespace.length()));
            }
            catch (IllegalArgumentException ignored){
            }
        }
        return null;
    }

    public static Optional<KGError> translateError(KGResponseWithRequest response){
        if(response!=null && response.getResponse() != null){
             if(response.getResponse().body() != null){
                 String body = response.getResponse().body();
                 Map<String, Object> parsed = objectMapper.convertValue(body, HashMap.class);
                 final Object error = parsed.get("error");
                 if(error instanceof Map){
                     Map<String, Object> errorMap = ((Map<String, Object>) error);
                     Object uuid = errorMap.get("uuid");
                     UUID parsedUUID  = null;
                     if(uuid!=null){
                         parsedUUID = UUID.fromString(uuid.toString());
                     }
                     return Optional.of(new KGError((Integer)errorMap.get("code"), (String)errorMap.get("message"), parsedUUID));
                 }
             }
             else {
                 return Optional.of(new KGError(response.getResponse().statusCode(),null, null));
             }
        }
        return Optional.empty();
    }
}

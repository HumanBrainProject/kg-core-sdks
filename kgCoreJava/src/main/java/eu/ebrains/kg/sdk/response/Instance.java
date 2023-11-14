package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.UUID;

public class Instance extends JsonLdDocument{

    @JsonIgnore
    private transient UUID uuid;

    @JsonIgnore
    public UUID getUUID(){
        return uuid;
    }


    @JsonIgnore
    void evaluateUUID(String idNamespace){
        final String instanceId = getInstanceId();
        if(instanceId!=null && instanceId.startsWith(idNamespace)){
            try{
                this.uuid = UUID.fromString(instanceId.substring(idNamespace.length()));
            }
            catch (IllegalArgumentException ignored){
            }
        }
    }

}

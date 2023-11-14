package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import eu.ebrains.kg.sdk.utils.Translator;

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
        this.uuid = Translator.fromInstanceId(getInstanceId(), idNamespace);
    }

}

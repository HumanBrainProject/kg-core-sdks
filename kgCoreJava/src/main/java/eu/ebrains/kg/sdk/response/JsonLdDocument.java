package eu.ebrains.kg.sdk.response;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.LinkedHashMap;
import java.util.Map;

public class JsonLdDocument extends LinkedHashMap<String, Object> {
    public JsonLdDocument() {
    }

    public JsonLdDocument(Map<? extends String, ?> m) {
        super(m);
    }

    @JsonIgnore
    public String getInstanceId(){
        final Object atId = get("@id");
        if(atId instanceof String){
            return (String)atId;
        }
        return null;
    }
}

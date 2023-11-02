package eu.ebrains.kg.sdk.response;

public class Instance extends JsonLdDocument{


    public String getInstanceId(){
        final Object atId = get("@id");
        if(atId instanceof String){
            return (String)atId;
        }
        return null;
    }
//
//    public Optional<UUID> getUUID(){
////        final Optional<String> instanceId = getInstanceId();
////        if(instanceId.isPresent()){
////            return toUUID(instanceId.get());
////        }
////        return Optional.empty();
//    }

}

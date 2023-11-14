package eu.ebrains.kg.sdk;

import eu.ebrains.kg.sdk.request.Stage;
import eu.ebrains.kg.sdk.utils.KGClientBuilder;

public class TestUtils {

    public static KGClientBuilder kgInt(){
        final String testClientId = System.getenv("TEST_CLIENT_ID");
        final String testClientSecret = System.getenv("TEST_CLIENT_SECRET");
        return KG.kg().host("core.kg-int.ebrains.eu").stage(Stage.IN_PROGRESS).withCredentials(testClientId, testClientSecret);
    }

    public static KGClientBuilder kgIntDevFlow(){
        return KG.kg().host("core.kg-int.ebrains.eu").stage(Stage.IN_PROGRESS);
    }
}

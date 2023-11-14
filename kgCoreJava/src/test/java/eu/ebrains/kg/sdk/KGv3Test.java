package eu.ebrains.kg.sdk;

import eu.ebrains.kg.sdk.request.Stage;
import eu.ebrains.kg.sdk.response.Instance;
import eu.ebrains.kg.sdk.response.ResultPage;
import org.junit.jupiter.api.Test;

class KGv3Test {

    @Test
    public void initializeKG() {
        KG.Client client = TestUtils.kgInt().stage(Stage.IN_PROGRESS).build();
        final ResultPage<Instance> result = client.instances.list("https://openminds.ebrains.eu/core/DatasetVersion").invoke();
        if(result.isSuccessful()) {
            for (Instance datum : result.getData()) {
                System.out.println(datum.getInstanceId());
            }
        }
    }

}
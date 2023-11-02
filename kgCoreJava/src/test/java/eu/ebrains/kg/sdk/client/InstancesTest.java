package eu.ebrains.kg.sdk.client;

import eu.ebrains.kg.sdk.KG;
import eu.ebrains.kg.sdk.TestUtils;
import eu.ebrains.kg.sdk.response.Instance;
import eu.ebrains.kg.sdk.response.Result;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

class InstancesTest {

    private KG.Instances instances;

    private Map<String, Object> testInstance;

    @BeforeEach
    public void setup(){
        this.instances = TestUtils.kgInt().build().instances;
        this.testInstance = new HashMap<>(Map.of("@type", "https://core.kg.ebrains.eu/test/TestType", "http://schema.org/name", "FooBar"));
    }

    @Test
    public void createInstance(){
        final Result<Instance> result = instances.createNew("myspace").invoke(this.testInstance);
        System.out.println(result);
    }

    @Test
    public void listInstances(){
        instances.list("https://openminds.ebrains.eu/core/DatasetVersion")
                .iterate(t -> System.out.println(t.getInstanceId()), kgError -> System.out.println(kgError.getMessage()));
    }

}
package eu.ebrains.kg.sdk.client;

import eu.ebrains.kg.sdk.KG;
import eu.ebrains.kg.sdk.TestUtils;
import eu.ebrains.kg.sdk.response.Instance;
import eu.ebrains.kg.sdk.response.JsonLdDocument;
import eu.ebrains.kg.sdk.response.Result;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

class InstancesTest {

    private KG.Instances instances;

    private JsonLdDocument testInstance;

    @BeforeEach
    public void setup(){
        this.instances = TestUtils.kgInt().build().instances;
        this.testInstance = new JsonLdDocument(Map.of("@type", "https://core.kg.ebrains.eu/test/TestType", "http://schema.org/name", "FooBar"));
    }

    @Test
    public void createInstance(){
        final Result<Instance> result = instances.createNew("myspace").invoke(this.testInstance);
        System.out.println(result);
    }


    @Test
    public void streamInstances(){
        instances.list("https://openminds.ebrains.eu/core/DatasetVersion").stream(Instance.class).forEach(i -> {
                    System.out.println(i.getUUID());
                });
    }


    @Test
    public void streamInstancePages(){
        instances.list("https://openminds.ebrains.eu/core/DatasetVersion").streamPage(Instance.class).forEach(i -> {
            System.out.println("New page");
            i.getData().forEach(instance -> {
                System.out.println(instance.getUUID());
            });
        });
    }
    @Test
    public void streamInstancesToList(){
        final List<Instance> collect = instances.list("https://openminds.ebrains.eu/core/DatasetVersion").stream(Instance.class).collect(Collectors.toList());
        System.out.println(collect);
    }



}
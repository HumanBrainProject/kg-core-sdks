package eu.ebrains.kg.sdk.utils;

import eu.ebrains.kg.sdk.response.ResultPage;
import java.util.stream.Stream;

public abstract class ResultPageProvider<C> extends AbstractResultPageProvider<C>{
    public abstract <T> ResultPage<T> invoke(Class<T> targetClass);

    public <T> Stream<T> stream(Class<T> targetClass){
        return stream(new InstanceIterator<>(targetClass));
    }

    private class InstanceIterator<T> extends AbstractResultPageProvider<C>.AbstractInstanceIterator<T> {
        private final Class<T> targetClass;

        private InstanceIterator(Class<T> targetClass) {
            this.targetClass = targetClass;
        }

        @Override
        protected ResultPage<T> invoke() {
            return ResultPageProvider.this.invoke(targetClass);
        }
    }
}

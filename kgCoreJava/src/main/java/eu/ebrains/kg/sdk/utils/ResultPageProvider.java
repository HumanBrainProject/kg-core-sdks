package eu.ebrains.kg.sdk.utils;

import eu.ebrains.kg.sdk.response.ResultPage;
import java.util.stream.Stream;

public abstract class ResultPageProvider<C> extends AbstractResultPageProvider<C>{
    public abstract <T> ResultPage<T> invoke(Class<T> targetClass);

    public <T> Stream<T> stream(Class<T> targetClass){
        return stream(new PageIterator<>(targetClass));
    }

    public <T> Stream<ResultPage<T>> streamPage(Class<T> targetClass){
        return streamPages(new PageIterator<>(targetClass));
    }


    private class PageIterator<T> extends AbstractResultPageProvider<C>.AbstractPageIterator<T> {
        private final Class<T> targetClass;

        private PageIterator(Class<T> targetClass) {
            this.targetClass = targetClass;
        }

        @Override
        protected ResultPage<T> invoke() {
            return ResultPageProvider.this.invoke(targetClass);
        }
    }

}

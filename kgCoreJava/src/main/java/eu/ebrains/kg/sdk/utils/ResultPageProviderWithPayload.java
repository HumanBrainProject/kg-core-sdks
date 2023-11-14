package eu.ebrains.kg.sdk.utils;

import eu.ebrains.kg.sdk.response.ResultPage;

import java.util.stream.Stream;

public abstract class ResultPageProviderWithPayload<C, D> extends AbstractResultPageProvider<C>{

    public abstract <T> ResultPage<T> invoke(D payload, Class<T> targetClass);

    public <T> Stream<T> stream(D payload, Class<T> targetClass){
        return stream(new ResultPageProviderWithPayload<C, D>.PageIterator<>(payload, targetClass));
    }

    public <T> Stream<ResultPage<T>> streamPage(D payload, Class<T> targetClass){
        return streamPages(new ResultPageProviderWithPayload<C,D>.PageIterator<>(payload, targetClass));
    }

    private class PageIterator<T> extends AbstractPageIterator<T> {
        private final Class<T> targetClass;
        private final D payload;

        private PageIterator(D payload, Class<T> targetClass) {
            this.targetClass = targetClass;
            this.payload = payload;
        }

        protected ResultPage<T> invoke(){
            return ResultPageProviderWithPayload.this.invoke(payload, targetClass);
        }
    }

}

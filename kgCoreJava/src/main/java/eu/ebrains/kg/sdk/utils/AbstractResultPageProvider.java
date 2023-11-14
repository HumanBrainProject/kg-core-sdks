package eu.ebrains.kg.sdk.utils;

import eu.ebrains.kg.sdk.response.Instance;
import eu.ebrains.kg.sdk.response.ResultPage;

import java.util.Collection;
import java.util.Iterator;
import java.util.Spliterator;
import java.util.Spliterators;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

public abstract class AbstractResultPageProvider<C>{


    public abstract C from(int from);

    public abstract C returnTotalResults(boolean returnTotalResults);

    protected <T> Stream<T> stream(AbstractPageIterator<T> iterator){
        return streamPages(iterator).map(ResultPage::getData).flatMap(Collection::stream);
    }

    protected <T> Stream<ResultPage<T>> streamPages(AbstractPageIterator<T> iterator){
        returnTotalResults(false);
        return StreamSupport.stream(Spliterators.spliteratorUnknownSize(iterator, Spliterator.ORDERED), false);
    }

    protected abstract class AbstractPageIterator<T> implements Iterator<ResultPage<T>> {
        private ResultPage<T> currentPage = null;
        private ResultPage<T> nextPage = null;

        protected abstract ResultPage<T> invoke();

        private ResultPage<T> fetchPage(int from) {
            from(from);
            return invoke();
        }

        @Override
        public boolean hasNext() {
            if(nextPage == null) {
                nextPage = fetchPage(currentPage == null ? 0 : currentPage.getFrom() + currentPage.getSize());
            }
            return nextPage != null && nextPage.getData()!=null && !nextPage.getData().isEmpty();
        }

        @Override
        public ResultPage<T> next() {
            if(nextPage!=null){
                currentPage = nextPage;
                nextPage = null;
            }
            return currentPage;
        }
    }
}

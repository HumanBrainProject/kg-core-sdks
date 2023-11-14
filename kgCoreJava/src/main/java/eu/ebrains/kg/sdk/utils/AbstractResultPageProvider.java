package eu.ebrains.kg.sdk.utils;

import eu.ebrains.kg.sdk.response.Instance;
import eu.ebrains.kg.sdk.response.ResultPage;

import java.util.Iterator;
import java.util.Spliterator;
import java.util.Spliterators;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

public abstract class AbstractResultPageProvider<C>{


    public abstract C from(int from);

    public abstract C returnTotalResults(boolean returnTotalResults);


    protected <T> Stream<T> stream(AbstractInstanceIterator<T> iterator){
        returnTotalResults(false);
        return StreamSupport.stream(Spliterators.spliteratorUnknownSize(iterator, Spliterator.ORDERED), false);
    }


    protected abstract class AbstractInstanceIterator<T> implements Iterator<T> {
        private ResultPage<T> currentResult = null;
        private int currentFrom = 0;
        private int currentIndex = 0;

        protected abstract ResultPage<T> invoke();

        private void fetchPage(int from) {
            from(from);
            currentResult = invoke();
            currentFrom = from;
        }

        @Override
        public boolean hasNext() {
            int localIndex = currentIndex-currentFrom;
            if(currentResult == null || (currentResult.getData() != null && localIndex >= currentResult.getData().size())){
                //We either didn't load anything so far or we've reached the end of the page - in both cases, we need to fetch the next page
                fetchPage( currentResult!=null && currentResult.getSize()!=null ? currentFrom + currentResult.getSize() : currentFrom);
                localIndex = 0;
            }
            return currentResult!=null && currentResult.getData()!=null && localIndex<currentResult.getData().size();
        }

        @Override
        public T next() {
            int localIndex = currentIndex-currentFrom;
            if(currentResult != null && currentResult.getData() != null && localIndex<currentResult.getData().size()){
                currentIndex++;
                return currentResult.getData().get(localIndex);
            }
            return null;
        }
    }
}

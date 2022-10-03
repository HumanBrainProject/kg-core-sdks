import { useState, useEffect, useContext, useRef } from "react";
import { Instance, ResultPage } from "ebrains-kg-core/response";

import kgClientContext from "./kgClientContext";

const useQueryInstancesByType = (type:string) => {


  const initializedRef = useRef(false);

  const [data, setData] = useState<Array<Instance>|undefined>(undefined);
  const [error, setError] = useState<any>(undefined);
  const [isUninitialized, setIsUninitialized] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [hasBeenFetchedOnce, setHasBeenFetchedOnce] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const kgClient = useContext(kgClientContext);

  const fetchData = async () => {
    if (kgClient) {
      if (!hasBeenFetchedOnce) {
        setHasBeenFetchedOnce(true);
        setIsLoading(true);
      }
      setIsFetching(true);
      try {
        const r:ResultPage<Instance> = await kgClient.instances.list(type);
        const instances: Array<Instance> = r.data;
        setIsSuccess(true);
        setData(instances);
        setIsLoading(false);
        setIsFetching(false);
      } catch (e) {
        setIsError(true);
        setError(e);
        setIsLoading(false);
        setIsFetching(false);
      } 
    } else {
      setError("useQueryInstances request a kgClientContext to be defined.");
    }
  };

  const refetch = () => {
    setError(undefined);
    fetchData();
  };

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setIsUninitialized(false);
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, error, isUninitialized, isLoading, isFetching, isSuccess, isError, refetch };
};

export default useQueryInstancesByType;
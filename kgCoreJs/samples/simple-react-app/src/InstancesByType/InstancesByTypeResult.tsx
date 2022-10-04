import React from "react";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";

import useQueryInstancesByType from "../useQueryInstancesByType";
import DataViewer from "../DataViewer";

const InstancesResult = ({ type}: { type: string}) => {
  
  const { data, error, isFetching, isError } = useQueryInstancesByType(type);

  if (isFetching) {
    return (
      <div>
        <Spinner animation="border" size="sm" />
        <span> Fetching instances for type {type}...</span>
     </div>
    );
  }

  if (isError) {
    const message = `An error occurred while trying to retrieve instances of type ${type} (${error.code} : ${error.message})`;
    return (
      <div>
        <Alert variant="danger">{message}</Alert>
      </div>
    );
  }

  return (
    <DataViewer data={data} />
  );
};

export default InstancesResult;
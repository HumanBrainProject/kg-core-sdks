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
        <Spinner animation="border" role="status">
        <span className="visually-hidden">Fetching instances for {type}..</span>
      </Spinner>
     </div>
    );
  }

  if (isError) {
    const message = error.toLocaleString?error.toLocaleString():JSON.stringify(error);
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
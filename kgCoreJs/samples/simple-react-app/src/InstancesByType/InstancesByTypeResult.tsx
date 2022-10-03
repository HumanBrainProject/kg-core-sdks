import React from "react";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";

import useQueryInstancesByType from "../useQueryInstancesByType";

const InstancesResult = ({ type}: { type: string}) => {
  
  const { data, error, isFetching, isError } = useQueryInstancesByType(type);

  if (isFetching) {
    return (
      <Spinner animation="border" role="status">
       <span className="visually-hidden">Fetching instances for {type}..</span>
     </Spinner>
    );
  }

  if (isError) {
    const message = error.toLocaleString?error.toLocaleString():JSON.stringify(error);
    return (
      <Alert variant="danger">{message}</Alert>
    );
  }

  return (
    <>
      <br />
      <pre style={{whiteSpace: "pre-wrap"}}>{JSON.stringify(data)}</pre>
    </>
  );
};

export default InstancesResult;
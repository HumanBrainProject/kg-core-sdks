import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import InstancesByTypeResult from "./InstancesByTypeResult";

import "./InstancesByType.css";

const defaultType = "https://openminds.ebrains.eu/core/DatasetVersion";

const InstancesByType = () => {
  
  const [type, setType] = useState(defaultType);
  const [targetType, setTargetType] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  
  const handleChangeType = (e:React.ChangeEvent<HTMLInputElement>) => setType(e.target.value);

  const handleFetchData = () => {
    setIsInitialized(true);
    setTargetType(type.trim());
  };

  const trimmedType = type.trim();
  const fetched = trimmedType === targetType || trimmedType === "";

  return (
    <div className="instancesByType">
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Type</Form.Label>
          <Form.Control type="text" placeholder={defaultType} value={type} onChange={handleChangeType} />
        </Form.Group>
        {!fetched && (
          <Button variant="primary" onClick={handleFetchData}>Fetch data</Button>
        )}
      </Form>
      {targetType === trimmedType?
        <InstancesByTypeResult type={targetType} />
        :
        isInitialized && type === ""?
          <div>Please provide a type</div>
        :
        null
      }
    </div>
  );
};

export default InstancesByType;
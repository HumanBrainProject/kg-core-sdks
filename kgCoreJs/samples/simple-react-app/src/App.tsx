import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import {kg, Client} from "@ebrains/kg-core/kg";

import kgClientContext from "./kgClientContext";
import InstancesByType from "./InstancesByType/InstancesByType";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

let _token:string = "";

const fetchToken = ():string|null => {
  return _token;
}

const client: Client = kg("localhost:8080").withCustomTokenProvider(fetchToken).build();


const App = () => {
  const [token, setToken] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const handleChangeToken = (e:React.ChangeEvent<HTMLInputElement>) => {
    _token = e.target.value;
    setToken(_token);
  };

  const handleChangeEndpoint = (e:React.ChangeEvent<HTMLSelectElement>) => {
    const path = e.target.value;
    navigate(path);
  };
  
  return (
    <Container>
    <br />
    <br />
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Token</Form.Label>
          <Form.Control type="text" placeholder="Enter token" onChange={handleChangeToken} />
          <Form.Text className="text-muted">
            Please provide a valid user keyclock token.
          </Form.Text>
        </Form.Group>
        {token && (
          <Form.Group className="mb-3">
            <Form.Label>Endpoint</Form.Label>
            <Form.Select onChange={handleChangeEndpoint}>
              {location.pathname === "/" && (
                <option value="/" defaultValue="/">Please select an endpoint</option>
              )}
              <option value="/instancesByType">List instances by type</option>
            </Form.Select>
          </Form.Group>
        )}
      </Form>
      <kgClientContext.Provider value={client}>
          {token && (
            <Routes>
              <Route path="/" element={null} />
              <Route path="/instancesByType" element={<InstancesByType />} />
              <Route path="*" element={<Navigate to="/" replace={true} />} />
            </Routes>
          )}
      </kgClientContext.Provider>
    </Container>
  );
};

export default App;
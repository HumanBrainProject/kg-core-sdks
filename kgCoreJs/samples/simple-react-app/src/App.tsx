import React, { useState } from 'react';
import './App.css';
import {kg, Client} from "ebrains-kg-core/kg";
import { Instance, ResultPage } from "ebrains-kg-core/response";

let _token:string = "";

const fetchToken = ():string|null => {
  return _token;
}

const client: Client = kg("localhost:8080").withCustomTokenProvider(fetchToken).build();


function App() {
  const [type, setType] = useState<string>("https://openminds.ebrains.eu/core/DatasetVersion");
  const [data, setData] = useState<string>();
  const [token, setToken] = useState<string>();

  const handleChangeToken = (e:React.ChangeEvent<HTMLInputElement>) => {
    _token = e.target.value;
    setToken(_token);
  };

  const handleChangeType = (e:React.ChangeEvent<HTMLInputElement>) => setType(e.target.value);

  const handleOnFetchData = async () => {
    const r:ResultPage<Instance> = await client.instances.list(type);
    const instances: Array<Instance> = r.data;
    setData(JSON.stringify(instances));
  }

  return (
    <div>
      <form>
        <label>token:</label><br/>
        <input type="text" value={token} onChange={handleChangeToken}/><br/>
        <label>type:</label><br/>
        <input type="text" value={type} onChange={handleChangeType}/><br/><br/>
        <input type="button" value="Fetch data" onClick={handleOnFetchData}/>
      </form>
      <pre style={{whiteSpace: "pre-wrap"}}>{data}</pre>
    </div>
  );
}

export default App;

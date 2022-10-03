import express from "express";
import { kg } from "@ebrains/kg-core/kg";
const app = express()
const port = 3000


const fetchToken = () => {
  return  process.env.TOKEN;
}

const client = kg("localhost:8080").withCustomTokenProvider(fetchToken).build();

app.get('/', async (req, res) => {
  const type = req.query.type;
  const r = await client.instances.list(type);
  const instances = r.data;
  res.send(instances);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
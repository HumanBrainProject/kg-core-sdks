import React, { createContext } from "react";
import { Client } from "@ebrains/kg-core/kg";

const kgClientContext: React.Context<null | Client> = createContext<null | Client>(null);

export default kgClientContext;
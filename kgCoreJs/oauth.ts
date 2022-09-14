/*  Copyright 2022 EBRAINS AISBL
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*  http://www.apache.org/licenses/LICENSE-2.0.
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*
*  This open source software code was developed in part or in whole in the
*  Human Brain Project, funded from the European Union's Horizon 2020
*  Framework Programme for Research and Innovation under
*  Specific Grant Agreements No. 720270, No. 785907, and No. 945539
*  (Human Brain Project SGA1, SGA2 and SGA3).
*/

import { TokenHandler } from "./communication";


export class SimpleToken extends TokenHandler {
    simpleToken:string;
    constructor(token:string) {
        super();
        this.simpleToken = token;
    }

    fetchToken():string {
        return this.simpleToken;
    }
}

export class ClientCredentials extends TokenHandler {
    clientId:string;
    clientSecret:string;
    constructor(clientId:string, clientSecret:string) {
        super();
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    async fetchToken():Promise<string|null> {
        if(this.authEndpoint && this.clientId && this.clientSecret) {
            const settings = {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "pplication/json",
                },
                body: JSON.stringify({   
                    "grant_type": "client_credentials",
                    "client_id": this.clientId,
                    "client_secret": this.clientSecret
                })
            };
            
            try {
                const fetchResponse = await fetch(this.authEndpoint, settings);
                if(fetchResponse.status === 200) {
                    const tokenResponse = await fetchResponse.json();
                    if(tokenResponse &&  "access_token" in tokenResponse) {
                        return tokenResponse["access_token"];
                    }
                }
                return null;
            } catch (e) {
                return null;
            }    
        }
        return null;
    }
}

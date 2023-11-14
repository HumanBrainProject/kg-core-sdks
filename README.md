# EBRAINS KG Core SDKs
This repository contains various SDKs for different programming languages to interact conveniently with the EBRAINS KG Core (https://github.com/HumanBrainProject/kg-core) - for more information, please visit the [documentation](https://docs.kg.ebrains.eu).

Currently, the following programming languages are supported:
- Python
- Java
- JavaScript / TypeScript

We try our best to give a similar appearance of the libraries across the programming languages whilst still trying to use best practices of the respective technology. 

## EBRAINS KG Core Java SDK

### Install

We've made your life easy by providing the libraries via the common package registries:

- Python:  https://pypi.org/project/ebrains-kg-core
- JavaScript / TypeScript: https://www.npmjs.com/package/@ebrains/kg-core
- Java: https://central.sonatype.com/artifact/eu.ebrains.kg/kg-core-sdk


### Initialize

The following code snippets initiate a kg client with the default settings. This means that the client will connect to the official
EBRAINS KG (https://core.kg.ebrains.eu) and use a "OAuth 2.0 Device Authorization Grant" to authenticate.

<sub>Python</sub>
```python
from kg_core.kg import kg

kg_client = kg().build()
```

<sub>Java</sub>
```java

import eu.ebrains.kg.sdk.KG;

KG.Client client = KG.kg().build();

```

<sub>TypeScript</sub>
```javascript

import {kg, Client} from "@ebrains/kg-core/kg";

const kgClient: Client = kg().build();

```

You can of course customize this:

#### Change the endpoint
If you want to talk to another endpoint than the official one (e.g. for development purposes), you can do so by explicitly specifying it:

<sub>Python & TypeScript</sub>
```python
kg("core.kg-ppd.ebrains.eu").build()
```

<sub>Java</sub>
```java
KG.kg("core.kg-ppd.ebrains.eu").build();
```

This will point the client to the pre-production environment of the EBRAINS KG

#### Change the authentication mechanism
You need to authenticate against the EBRAINS KG. To do so, we have different options for different use-cases:

##### Interactive exection: OAuth 2.0 Device Authorization Grant (only available for Python and Java)
This is the default if nothing else is specified. The script will print a URL in the console you need to visit (with any device). Once authenticated, the script will be able to fetch your token and can do authenticated calls.

This is useful for sessions in which the user is in front of the computer at execution time e.g. for the manual execution of a script.

You can customize this authentication mechanism by 

<sub>Python</sub>
```python
kg().with_device_flow(client_id="your-client-id", open_id_configuration_url="the_url_to_your_openid_configuration").build()
```

<sub>Java</sub>
```java
KG.kg().withDeviceFlow("yourClientId", "theUrlToYourOpenIdConfiguration").build();
```
Usually, there is no need to change those parameters. Therefore, both parameters are optional. If you don't specify the **client_id**, the default client_id for the EBRAINS KG SDKs will be used. If you don't specify the **open_id_configuration_url**, the script tries to determine it by using the one of the connected EBRAINS KG instance. 

##### Inside an authenticated session: Token (only available for Python and Java)
Sometimes, you already have a valid access token which you might want to reuse - e.g. because you're using the library in a broader context. If this is the case, you can simply pass the existing token like

<sub>Python</sub>
```python
kg().with_token(token="your-access-token").build()
```

<sub>Java</sub>
```java
KG.kg().withToken("yourAccessToken").build()
```
Please note, that in Python, "your-access-token" defaults to the environment variable "KG_TOKEN" -> instead of specifying the token explicitly, you can also just make sure to have the environment variable "KG_TOKEN" defined correctly.


##### Unsupervised script execution: With credentials (only available for Python and Java)
If you want to have unsupervised script execution (e.g. because you're building a cron-job interacting with the KG), you should register an OIDC client with a service account at EBRAINS. 
Once done, you will receive a "client_id" and a "client_secret" which you can pass to the KG client:

<sub>Python</sub>
```python
kg().with_credentials(client_id="your-client-id", client_secret="your-client-secret").build()
```

<sub>Java</sub>
```java
KG.kg().withCredentials("yourClientId", "yourClientSecret").build()
```
Just as with an existing token, the arguments "client_id" and "client_secret" default to the environment variables "KG_CLIENT_ID" and "KG_CLIENT_SECRET", so you can use either way to define the values.


##### Custom token provider
Maybe, you don't have the token itself but you have some logic which can fetch it. This is what the custom token provider is for: You can implement your own function on how to fetch the token:

<sub>Python</sub>
```python
kg().with_custom_token_provider(lambda: some_way_to_fetch_the_token()).build()
```

<sub>TypeScript</sub>
```javascript
const fetchToken = ():string|null => {someWayToFetchTheToken}
kg().withCustomTokenProvider(fetchToken).build();
```

<sub>Java</sub>
```java
KG.kg().withCustomTokenProvider(new CallableTokenHandler(() -> someWayToFetchTheToken))
```

##### Special case: Client Authentication (only available for Python and Java)
The EBRAINS Knowledge Graph knows the concept of dual authentication, which means that not only the user but also the technical client can authenticate.
This is e.g. useful to restrict the capabilities of the user from the client context (e.g. if the user has write rights but the client only executes "read-only" operations, it can be prevented that the user manipulates data) and to profit from contextualized responses from the EBRAINS KG.

This is only useful if not using the "With credentials" authentication since this mechanism is already authenticating with the client id and client secret.

To authenticate for both, the user and the client, you can therefore do something like 

<sub>Python</sub>
```python
kg().with_device_flow().add_client_authentication(
    client_id="your-client-id", 
    client_secret="your-client-secret"
).build()
```

<sub>Java</sub>
```java
KG.kg().withDeviceFlow().addClientAuthentication("clientId", "clientSecret").build()
```
This would cause the user to authenticate with the device flow and would additionally authenticate the client with the passed **client-id** and **client-secret**. Just as with the "With credentials" authentication mechanism, in Python, client_id and client_secret default to their corresponding environment variables.


### Initialize

#### Talk to the KG
To communicate with the KG, the available API endpoints are grouped into various topics. You can easily access them:

<sub>Python</sub>
```python
result: ResultPage[Instance] = kg_client.instances.list("https://openminds.ebrains.eu/core/Person")
```

<sub>Java</sub>
```java
ResultPage<Instance> result = client.instances.list("https://openminds.ebrains.eu/core/Person").invoke();
```
This example uses the **listing** endpoint of the **instances** of the openMINDS Person objects and returns a typed result. In this case a **ResultPage[Instance]**/**ResultPage<Instance>**.
The return type obviously differs depending on the invoked method.

Feel free to have a look at the various available methods - your IDE will help you determine what is available ;) 

#### Understanding the Result/ResultsById/ResultPage types
Depending on what methods you're using, you will certainly meet the above mentioned response types. These are wrappers around the actual instances which respond to you information like errors, additional messages, potentially pagination information, etc.

Because of this extra layer, it also means that the actual data which you might be looking for, has to be accessed via the "data" property of the result.

### Iterating ResultPages
One of the main tasks you will meet when working with the KG is to iterate lists of results. To make your life easier, there are some convenience methods that allow you to iterate the results page by page to prevent extensive memory consumption. Since there are different means for the different programming languages available, we present you the different approaches:

#### Python

##### The for loop
The easiest way to iterate a ResultPage is to use the for loop:

<sub>Python</sub>
```python
for i in result.items():
    print(i)
```
This will make sure you loop across the instances. The listing methods contain a default pagination. Please note that loading of the next page will happen transparently "behind the scenes". This means that you will always only have one result page in memory and once you reach the end, the iterator will make sure, the next page is loaded for you.

##### The while loop with "has_next_page()" / "next_page()"
If you want more fine-grained control over the looping, you can also use the **has_next_page()** as well as the **next_page()** methods:

<sub>Python</sub>
```python
while result.has_next_page():
    if result.data:
        for i in result.data:
            print(i)
    result = result.next_page()
```
Please note that `result.next_page()` returns None if there are no more pages, so theoretically, instead of `while result.has_next_page()` we could also just have written `while result:`. Nevertheless, we think it's easier to read in the above example and of course there are other use-cases where you might only want to check if a result has a next page without actually loading it.


#### Java
As a very convenient API, we recommend to loop instances with the "streaming" API:

<sub>Java</sub>
```java
Stream<Instance> stream = client.instances.list("https://openminds.ebrains.eu/core/Person").stream();
```
The stream will automatically load the next page once you have reached the end of the currently loaded. Please note, that you also have the possibility to pass a Class to the stream method to change the target type (e.g. if you're aiming at having a more detailed object model than "Instance").

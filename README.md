# EBRAINS KG Core Python SDK
This is a python client library for the EBRAINS KG core (https://github.com/HumanBrainProject/kg-core).

## Getting started
Let's have a look on how to use the library so you can get started easily

### Install
The EBRAINS KG Core Python SDK is available on PyPi. Its installation is therefore as simple as
```
pip install ebrains-kg-core
```

### Initialize
To initiate your client, you can do
```python
from kg_core.kg import kg

kg_client = kg().build()
```
This initiates a kg client with the default settings. This means that the client will connect to the official
EBRAINS KG (https://core.kg.ebrains.eu) and use a "OAuth 2.0 Device Authorization Grant" to authenticate. You can of course customize this:

### Talk to the KG
To communicate with the KG, the available API endpoints are grouped into various topics. You can easily access them:
```python
result: ResultPage[Instance] = kg_client.instances.list("https://openminds.ebrains.eu/core/Person")
```
This example uses the **listing** endpoint of the **instances** of the openMINDS Person objects and returns a typed result. In this case a **ResultPage[Instance]**.
The return type obviously differs depending on the invoked method.

Feel free to have a look at the various available methods - your IDE will help you determine what is available ;) 

### Understanding the Result/ResultsById/ResultPage types
Depending on what methods you're using, you will certainly meet the above mentioned response types. These are wrappers around the actual instances which respond to you information like errors, additional messages, potentially pagination information, etc.

Because of this extra layer, it also means that the actual data which you might be looking for, has to be accessed via the "data" property of the result.

### Iterating ResultPages
One of the main tasks you will meet when working with the KG is to iterate lists of results. To make your life easier, there are some convenience methods that allow you to iterate the results page by page to prevent extensive memory consumption:

#### The for loop
The easiest way to iterate a ResultPage is to use the for loop:
```python
for i in result.items():
    print(i)
```
This will make sure you loop across the instances. The listing methods contain a default pagination. Please note that loading of the next page will happen transparently "behind the scenes". This means that you will always only have one result page in memory and once you reach the end, the iterator will make sure, the next page is loaded for you.

#### The while loop with "has_next_page()" / "next_page()"
If you want more fine-grained control over the looping, you can also use the **has_next_page()** as well as the **next_page()** methods:
```python
while result.has_next_page():
    if result.data:
        for i in result.data:
            print(i)
    result = result.next_page()
```
Please note that `result.next_page()` returns None if there are no more pages, so theoretically, instead of `while result.has_next_page()` we could also just have written `while result:`. Nevertheless, we think it's easier to read in the above example and of course there are other use-cases where you might only want to check if a result has a next page without actually loading it.




## Customize
The library is designed to make your life as easy as possible - it therefore tries to provide the best possible default values. However, if you feel the need to customize it, here's how to do so:


### Change the endpoint
If you want to talk to another endpoint than the official one (e.g. for development purposes), you can do so by explicitly specifying it:
```python
from kg_core.kg import kg

kg_client = kg("core.kg-ppd.ebrains.eu").build()
```
This will point the client to the pre-production environment of the EBRAINS KG

### Change the authentication mechanism
You need to authenticate against the EBRAINS KG. To do so, we have different options for different use-cases:

#### Interactive exection: OAuth 2.0 Device Authorization Grant
This is the default if nothing else is specified. The script will print a URL in the console you need to visit (with any device). Once authenticated, the script will be able to fetch your token and can do authenticated calls.

This is useful for sessions in which the user is in front of the computer at execution time e.g. for the manual execution of a script.

You can customize this authentication mechanism by 
```python
from kg_core.kg import kg

kg().with_device_flow(
    client_id="your-client-id", 
    open_id_configuration_url="the_url_to_your_openid_configuration"
).build()
```
Usually, there is no need to change those parameters. Therefore, both parameters are optional. If you don't specify the **client_id**, the default client_id for the EBRAINS KG Python SDK will be used. If you don't specify the **open_id_configuration_url**, the script tries to determine it by using the one of the connected EBRAINS KG instance. 

#### Inside an authenticated session: Token
Sometimes, you already have a valid access token which you might want to reuse - e.g. because you're using the library in a broader context. If this is the case, you can simply pass the existing token like
```python
from kg_core.kg import kg

kg().with_token(token="your-access-token").build()
```
Please note, that "your-access-token" defaults to the environment variable "KG_TOKEN" -> instead of specifying the token explicitly, you can also just make sure to have the environment variable "KG_TOKEN" defined correctly.


#### Unsupervised script execution: With credentials
If you want to have unsupervised script execution (e.g. because you're building a cron-job interacting with the KG), you should register an OIDC client with a service account at EBRAINS. 
Once done, you will receive a "client_id" and a "client_secret" which you can pass to the KG client:

```python
from kg_core.kg import kg

kg().with_credentials(
    client_id="your-client-id", 
    client_secret="your-client-secret"
).build()
```
Just as with an existing token, the arguments "client_id" and "client_secret" default to the environment variables "KG_CLIENT_ID" and "KG_CLIENT_SECRET", so you can use either way to define the values.

#### Special case: Client Authentication
The EBRAINS Knowledge Graph knows the concept of dual authentication, which means that not only the user but also the technical client can authenticate.
This is e.g. useful to restrict the capabilities of the user from the client context (e.g. if the user has write rights but the client only executes "read-only" operations, it can be prevented that the user manipulates data) and to profit from contextualized responses from the EBRAINS KG.

This is only useful if not using the "With credentials" authentication since this mechanism is already authenticating with the client id and client secret.

To authenticate for both, the user and the client, you can therefore do something like 
```python
from kg_core.kg import kg

kg().with_device_flow().add_client_authentication(
    client_id="your-client-id", 
    client_secret="your-client-secret"
)
```
This would cause the user to authenticate with the device flow and would additionally authenticate the client with the passed **client-id** and **client-secret**. Just as with the "With credentials" authentication mechanism, client_id and client_secret default to their corresponding environment variables.




## Generation
The API wrappers are generated according to the openAPI specification of the endpoint. 
To ensure backwards compatibility and consistency, the result of the generation is not 
executed automatically but requires a manual check.

To run the generation, the "generator.py" has to be executed. This will overwrite the "kg.py" in the kg_core package with the latest definitions. Once validated, it can be commited to the repository.

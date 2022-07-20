#  Copyright 2022 EBRAINS AISBL
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0.
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#
#  This open source software code was developed in part or in whole in the
#  Human Brain Project, funded from the European Union's Horizon 2020
#  Framework Programme for Research and Innovation under
#  Specific Grant Agreements No. 720270, No. 785907, and No. 945539
#  (Human Brain Project SGA1, SGA2 and SGA3).
#

from __future__ import annotations
import http.client
import uuid
from abc import ABC
from enum import Enum, EnumMeta
from typing import Any, Callable, Iterable, Optional, Dict, TypeVar, Generic, List
from uuid import UUID

from pydantic import BaseModel
from pydantic.main import ModelMetaclass

from kg_core.__communication import KGRequestWithResponseContext


class ReleaseStatus(str, Enum):
    RELEASED = "RELEASED"
    UNRELEASED = "UNRELEASED"
    HAS_CHANGED = "HAS_CHANGED"


class JsonLdDocument(Dict[str, Any]):
    def __init__(self, seq: Iterable[List[str]] = (), id_namespace: Optional[str] = None, **kwargs: Any):
        super(JsonLdDocument, self).__init__(seq, **kwargs)
        self._id_namespace = id_namespace

    def to_uuid(self, value) -> Optional[UUID]:
        if value and value.startswith(self._id_namespace):
            return uuid.UUID(value[len(self._id_namespace):])
        else:
            return None


class ListOfJsonLdDocuments(List[JsonLdDocument]):
    def __init__(self, seq: Iterable[JsonLdDocument] = ()):
        super(ListOfJsonLdDocuments, self).__init__(seq)


class Instance(JsonLdDocument):
    uuid: Optional[UUID] = None

    def __init__(self, seq: Iterable[List[str]] = (), id_namespace: Optional[str] = None, **kwargs: Any):
        super(Instance, self).__init__(seq, id_namespace, **kwargs)
        self.instance_id = self["@id"] if "@id" in self else None
        self.uuid = self.to_uuid(self.instance_id)

    def __str__(self):
        return f"Instance {self.uuid if self.uuid else 'unknown'}"


class TermsOfUse(BaseModel):
    accepted: bool = False
    version: str
    data: str


class Error(BaseModel):
    code: int
    message: Optional[str] = None
    instance_id: Optional[UUID] = None

    class Config:
        fields = {
            "instance_id": "instanceId"
        }


class Scope(BaseModel):
    instance_id: Optional[UUID] = None
    label: Optional[str] = None
    space: Optional[str] = None
    types: Optional[List[str]] = None
    children: Optional[List[Scope]] = None
    permissions: Optional[List[str]] = None

    class Config:
        fields = {
            "instance_id": "id"
        }


class SpaceInformation(BaseModel):
    identifier: Optional[str] = None
    name: Optional[str] = None
    permissions: Optional[List[str]] = None

    class Config:
        fields = {
            "identifier": "http://schema.org/identifier",
            "name": "http://schema.org/name",
            "email": "http://schema.org/email",
            "permissions": "https://core.kg.ebrains.eu/vocab/meta/permissions"
        }


class TypeInformation(BaseModel):
    identifier: Optional[str] = None
    description: Optional[str] = None
    name: Optional[str] = None
    # TODO incoming_links
    occurrences: Optional[int] = None
    # TODO properties
    # TODO spaces

    class Config:
        fields = {
            "identifier": "http://schema.org/identifier",
            "description": "http://schema.org/description",
            "name": "http://schema.org/name",
            "occurrences": "https://core.kg.ebrains.eu/vocab/meta/occurrences"
        }


class User(BaseModel):
    alternate_name: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    identifiers: Optional[List[str]] = None

    class Config:
        fields = {
            "alternate_name": "http://schema.org/alternateName",
            "name": "http://schema.org/name",
            "email": "http://schema.org/email",
            "given_name": "http://schema.org/givenName",
            "family_name": "http://schema.org/familyName",
            "identifiers": "http://schema.org/identifier"
        }


class UserWithRoles(BaseModel):
    user: User
    client_roles: Optional[List[str]] = None
    user_roles: Optional[List[str]] = None
    invitations: Optional[List[str]] = None
    client_id: Optional[str] = None
    # permissions

    class Config:
        fields = {
            "client_roles": "clientRoles",
            "user_roles": "userRoles",
            "client_id": "clientId"
        }


ResponseType = TypeVar("ResponseType")


def translate_error(response: KGRequestWithResponseContext) -> Optional[Error]:
    return Error(**response.content["error"]) if response.content and "error" in response.content and response.content["error"] \
        else Error(code=response.status_code, message=http.client.responses[response.status_code]) if response.status_code and response.status_code >= 400 else None


class _AbstractResult(ABC):

    def __init__(self, response: KGRequestWithResponseContext):
        self.message: Optional[str] = response.content["message"] if response.content and "message" in response.content else None
        self.start_time: Optional[int] = response.content["startTime"] if response.content and "startTime" in response.content else None
        self.duration_in_ms: Optional[int] = response.content["durationInMs"] if response.content and "durationInMs" in response.content else None
        self.transaction_id: Optional[int] = response.content["transactionId"] if response.content and "transactionId" in response.content else None
        self.error: Optional[Error] = translate_error(response)


class _AbstractResultPage(_AbstractResult):
    def __init__(self, response: KGRequestWithResponseContext):
        super(_AbstractResultPage, self).__init__(response)
        self.total: Optional[int] = response.content["total"] if response.content and "total" in response.content else None
        self.size: Optional[int] = response.content["size"] if response.content and "size" in response.content else None
        self.start_from: Optional[int] = response.content["from"] if response.content and "from" in response.content else None


class ResponseObjectConstructor(Generic[ResponseType]):
    @staticmethod
    def init_response_object(constructor: Callable[..., ResponseType], data: Any, id_namespace: Any) -> ResponseType:
        if type(constructor) is ModelMetaclass:
            return constructor(**data)
        elif type(constructor) is EnumMeta:
            # Not pretty but works for now
            return constructor[data]  # type: ignore
        elif type(constructor) == JsonLdDocument or type(constructor) == Instance:
            return constructor(data, id_namespace)
        else:
            return constructor(data)


class ResultPageIterator(Generic[ResponseType]):

    def __init__(self, result_page: ResultPage[ResponseType]):
        self._result_page: ResultPage[ResponseType] = result_page

    def __iter__(self):
        self.n = 0
        return self

    def __next__(self) -> Optional[ResultPage[ResponseType]]:
        if self._result_page:
            if self._result_page.error:
                raise ValueError(self._result_page.error.message)
            elif self._result_page.data:
                if self.n < self._result_page.total:
                    if self.n >= self._result_page.start_from+self._result_page.size and self._result_page.has_next_page():
                        self._result_page = self._result_page.next_page()
                    result = self._result_page.data[self.n-self._result_page.start_from]
                    self.n += 1
                    return result
        raise StopIteration


class ResultPage(_AbstractResultPage, Generic[ResponseType]):

    def __init__(self, response: KGRequestWithResponseContext, constructor: Callable[..., ResponseType]):
        super(ResultPage, self).__init__(response)
        self.data: Optional[List[ResponseType]] = [ResponseObjectConstructor.init_response_object(constructor, r, response.id_namespace) for r in response.content["data"]] if response.content and "data" in response.content else None
        self._original_response = response
        self._original_constructor = constructor

    def __str__(self):
        return f"{super.__str__(self)} - status: {self.error.code if self.error else 'success'}"

    def next_page(self) -> Optional[ResultPage[ResponseType]]:
        if self.has_next_page():
            result = self._original_response.next_page(self.start_from, self.size)
            return ResultPage[ResponseType](response=result, constructor=self._original_constructor) if result else None
        return None

    def has_next_page(self) -> bool:
        if self.total is not None and self.start_from is not None and self.size is not None:
            return self.start_from+self.size < self.total
        return False

    def items(self) -> ResultPageIterator[ResponseType]:
        return ResultPageIterator(self)


class Result(_AbstractResult, Generic[ResponseType]):

    def __init__(self, response: KGRequestWithResponseContext, constructor: Callable[..., ResponseType]):
        super(Result, self).__init__(response)
        self.data: Optional[ResponseType] = ResponseObjectConstructor.init_response_object(constructor, response.content["data"], response.id_namespace) if response.content and "data" in response.content and response.content["data"] else None

    def __str__(self):
        return f"{super.__str__(self)} - status: {str(self.error.code)+' ('+self.error.message+')' if self.error is not None else 'success'}"


class ResultsById(_AbstractResult, Generic[ResponseType]):

    def __init__(self, response: KGRequestWithResponseContext, constructor: Callable[..., ResponseType]):
        super(ResultsById, self).__init__(response)
        self.data: Optional[Dict[str, Result[ResponseType]]] = {k: Result[ResponseType](response.copy_context(r), constructor) for k, r in response.content["data"].items()} if response.content and "data" in response.content and response.content["data"] else None

    def __str__(self):
        return f"{super.__str__(self)} - status: {self.error.code if self.error else 'success'}"

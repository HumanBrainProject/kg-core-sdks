#   Copyright (c) 2018, EPFL/Human Brain Project PCO
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
from typing import Optional, Any
from enum import Enum
from pydantic import BaseModel

class Pagination(BaseModel):
    start_from: int = 0
    size: int = 50


class Stage(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    RELEASED = "RELEASED"


class ResponseConfiguration(BaseModel):
    return_payload: bool = False
    return_permissions: bool = False
    return_alternatives: bool = False
    return_embedded: bool = False
    return_incoming_links: bool = False
    sort_by_label: bool = False

class KGResult(BaseModel):
    data: Optional[dict] = None
    message: Optional[str] = None
    start_time: Optional[str] = None
    duration_in_ms: Optional[int] = None
    total: int = 0
    size: int = 0
    start_from: int = 0
    request_args: Any
    request_payload: Any

    class Config:
        fields = {
            "start_time": "startTime",
            "duration_in_ms": "durationInMs",
        }
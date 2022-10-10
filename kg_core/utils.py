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
import uuid
from typing import Optional, Union, cast
from uuid import UUID


def uuid_from_absolute_id(identifier: Optional[Union[str, UUID]],
                          id_namespace="https://kg.ebrains.eu/api/instances/") -> Optional[UUID]:
    if identifier:
        if type(identifier) == UUID:
            return cast(UUID, identifier)
        try:
            id_str = cast(str, identifier)
            if id_str.startswith(id_namespace):
                return uuid.UUID(id_str[len(id_namespace):])
            return uuid.UUID(id_str)
        except ValueError:
            return None
    return None

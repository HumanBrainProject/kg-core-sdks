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

from abc import ABC, abstractmethod
class ClientGenerator(ABC):
    specs = ["0%20simple", "1%20advanced"]
    admin_spec = "2%20admin"

    def __init__(self, kg_root:str, open_api_spec_subpath:str, id_namespace:str):
        self.default_kg_root:str = kg_root
        self.spec_root:str = f"http{'s' if not kg_root.startswith('localhost') else ''}://{kg_root}/{open_api_spec_subpath}"
        self.id_namespace:str = id_namespace

    @abstractmethod
    def generate(self) -> None:
        pass
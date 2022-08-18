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

from typing import Optional


class Stage(str):
    IN_PROGRESS = "IN_PROGRESS"
    RELEASED = "RELEASED"


class ReleaseTreeScope(str):
    TOP_INSTANCE_ONLY = "TOP_INSTANCE_ONLY"
    CHILDREN_ONLY = "CHILDREN_ONLY"


class Pagination(object):
    def __init__(self, start: int = 0, size: int = 50, return_total_results: bool = True):
        self.start = start
        self.size = size
        self.return_total_results = return_total_results


class ResponseConfiguration(object):

    def __init__(self, return_alternatives: Optional[bool] = None, return_embedded: Optional[bool] = None, return_payload: Optional[bool] = None, return_permissions: Optional[bool] = None):
        self.return_alternatives = return_alternatives
        self.return_embedded = return_embedded
        self.return_payload = return_payload
        self.return_permissions = return_permissions


class ExtendedResponseConfiguration(ResponseConfiguration):

    def __init__(self, incoming_links_page_size: Optional[int] = None, return_alternatives: Optional[bool] = None, return_embedded: Optional[bool] = None, return_incoming_links: Optional[bool] = None, return_payload: Optional[bool] = None, return_permissions: Optional[bool] = None):
        super(ExtendedResponseConfiguration, self).__init__(return_alternatives, return_embedded, return_payload, return_permissions)
        self.incoming_links_page_size = incoming_links_page_size
        self.return_incoming_links = return_incoming_links


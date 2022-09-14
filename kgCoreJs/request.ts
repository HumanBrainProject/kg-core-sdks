/*
 *  Copyright 2022 EBRAINS AISBL
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
 *
 */

export enum Stage {
  IN_PROGRESS = "IN_PROGRESS",
  RELEASED = "RELEASED",
}

export enum ReleaseTreeScope {
  TOP_INSTANCE_ONLY = "TOP_INSTANCE_ONLY",
  CHILDREN_ONLY = "CHILDREN_ONLY",
}

export class Pagination {
  start: number;
  size: number;
  returnTotalResults: boolean;
  constructor(
    start: number = 0,
    size: number = 50,
    returnTotalResults: boolean = true
  ) {
    this.start = start;
    this.size = size;
    this.returnTotalResults = returnTotalResults;
  }
}

export class ResponseConfiguration {
  returnAlternatives: boolean | null;
  returnEmbedded: boolean | null;
  returnPayload: boolean | null;
  returnPermissions: boolean | null;
  constructor(
    returnAlternatives: boolean | null = null,
    returnEmbedded: boolean | null = null,
    returnPayload: boolean | null = null,
    returnPermissions: boolean | null = null
  ) {
    this.returnAlternatives = returnAlternatives;
    this.returnEmbedded = returnEmbedded;
    this.returnPayload = returnPayload;
    this.returnPermissions = returnPermissions;
  }
}

export class ExtendedResponseConfiguration extends ResponseConfiguration {
  incomingLinksPageSize: number | null;
  returnIncomingLinks: boolean | null;
  constructor(
    incomingLinksPageSize: number | null = null,
    returnAlternatives: boolean | null = null,
    returnEmbedded: boolean | null = null,
    returnIncomingLinks: boolean | null = null,
    returnPayload: boolean | null = null,
    returnPermissions: boolean | null = null
  ) {
    super(returnAlternatives, returnEmbedded, returnPayload, returnPermissions);
    this.incomingLinksPageSize = incomingLinksPageSize;
    this.returnIncomingLinks = returnIncomingLinks;
  }
}

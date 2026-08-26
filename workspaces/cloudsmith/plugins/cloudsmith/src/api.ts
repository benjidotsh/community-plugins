/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/frontend-plugin-api';
import { ResponseError } from '@backstage/errors';
import { ListPackageVersionsResponse } from '@backstage-community/plugin-cloudsmith-common';

export const cloudsmithApiRef = createApiRef<CloudsmithApi>().with({
  id: 'plugin.cloudsmith.service',
  pluginId: 'cloudsmith',
});

export interface CloudsmithApi {
  listPackageVersionsForEntity(
    entityRef: string,
  ): Promise<ListPackageVersionsResponse>;
}

export class CloudsmithClient implements CloudsmithApi {
  private readonly discoveryApi: DiscoveryApi;

  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async listPackageVersionsForEntity(
    entityRef: string,
  ): Promise<ListPackageVersionsResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('cloudsmith');

    const response = await this.fetchApi.fetch(
      `${baseUrl}/versions?${new URLSearchParams({ entityRef })}`,
    );

    if (!response.ok) throw await ResponseError.fromResponse(response);

    return response.json();
  }
}

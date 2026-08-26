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
  mockCredentials,
  mockServices,
  registerMswTestHooks,
} from '@backstage/backend-test-utils';
import { Entity } from '@backstage/catalog-model';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { JsonObject } from '@backstage/types';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import {
  dockerApiPackage,
  dockerVersion,
  makeEntity,
  npmApiPackage,
  npmVersion,
  sampleEntity,
} from '../../__fixtures__/mocks';
import { API_BASE_URL } from './constants';
import { createCloudsmithService } from './createCloudsmithService';
import { CloudsmithApiPackage, SlugResult } from './types';

const server = setupServer(
  http.get(`${API_BASE_URL}/packages/my-org/my-org-npm/`, () =>
    HttpResponse.json([npmApiPackage]),
  ),
  http.get(`${API_BASE_URL}/packages/my-org/my-org-docker/`, () =>
    HttpResponse.json([dockerApiPackage]),
  ),
);
registerMswTestHooks(server);

describe('CloudsmithService', () => {
  const credentials = mockCredentials.user();
  const cache = mockServices.cache.mock();

  afterEach(() => {
    jest.resetAllMocks();
  });

  function createService(options: { entity?: Entity; cacheTtl?: number } = {}) {
    const { entity = sampleEntity, cacheTtl } = options;

    return createCloudsmithService({
      config: mockServices.rootConfig({
        data: { cloudsmith: { org: 'my-org', apiKey: 'secret-key', cacheTtl } },
      }),
      cache,
      catalog: catalogServiceMock({ entities: [entity] }),
    });
  }

  function mockRepository(
    repository: string,
    packages: CloudsmithApiPackage[],
    headers?: Record<string, string>,
  ) {
    server.use(
      http.get(`${API_BASE_URL}/packages/my-org/${repository}/`, () =>
        HttpResponse.json(packages, { headers }),
      ),
    );
  }

  it('merges versions across slugs, newest first', async () => {
    const response = await createService().listPackageVersionsForEntity(
      'component:default/sample',
      { credentials },
    );

    expect(response).toEqual({
      orgUrl: 'https://app.cloudsmith.com/my-org',
      versions: [dockerVersion, npmVersion],
      unresolvedSlugs: [],
      truncatedSlugs: [],
    });
  });

  it('queries Cloudsmith by exact package name with the configured API key', async () => {
    expect.assertions(5);
    server.use(
      http.get(`${API_BASE_URL}/packages/my-org/my-org-npm/`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('query')).toBe('name:^example-package$');
        expect(url.searchParams.get('sort')).toBe('-date');
        expect(url.searchParams.get('page_size')).toBe('500');
        expect(request.headers.get('X-Api-Key')).toBe('secret-key');
        return HttpResponse.json([npmApiPackage]);
      }),
    );

    const response = await createService({
      entity: makeEntity('my-org-npm/example-package'),
    }).listPackageVersionsForEntity('component:default/sample', {
      credentials,
    });

    expect(response.versions).toEqual([npmVersion]);
  });

  it('reports slugs that return no packages or a 404 as unresolved', async () => {
    mockRepository('my-org-npm', []);
    server.use(
      http.get(
        `${API_BASE_URL}/packages/my-org/my-org-docker/`,
        () => new HttpResponse('not found', { status: 404 }),
      ),
    );

    const response = await createService().listPackageVersionsForEntity(
      'component:default/sample',
      { credentials },
    );

    expect(response.versions).toEqual([]);
    expect(response.unresolvedSlugs).toEqual([
      'my-org-npm/example-package',
      'my-org-docker/example-service',
    ]);
  });

  it('treats slugs without a repository prefix as unresolved', async () => {
    const response = await createService({
      entity: makeEntity('not-a-slug'),
    }).listPackageVersionsForEntity('component:default/sample', {
      credentials,
    });

    expect(response.unresolvedSlugs).toEqual(['not-a-slug']);
  });

  it('reports slugs that exceed the version cap as truncated', async () => {
    mockRepository('my-org-npm', [npmApiPackage], {
      'X-Pagination-Count': '742',
    });

    const response = await createService().listPackageVersionsForEntity(
      'component:default/sample',
      { credentials },
    );

    expect(response.truncatedSlugs).toEqual(['my-org-npm/example-package']);
  });

  it('caches fetched slug results with the configured TTL', async () => {
    await createService({ cacheTtl: 60 }).listPackageVersionsForEntity(
      'component:default/sample',
      { credentials },
    );

    expect(cache.set).toHaveBeenCalledWith(
      'package:my-org-npm/example-package',
      { found: true, truncated: false, versions: [npmVersion] },
      { ttl: 60_000 },
    );
  });

  it('serves cached slug results without calling Cloudsmith', async () => {
    const cached: SlugResult = {
      found: true,
      truncated: false,
      versions: [npmVersion],
    };
    cache.get.mockResolvedValue(cached as unknown as JsonObject);

    const response = await createService({
      entity: makeEntity('my-org-npm/example-package'),
    }).listPackageVersionsForEntity('component:default/sample', {
      credentials,
    });

    expect(response.versions).toEqual([npmVersion]);
    expect(cache.get).toHaveBeenCalledWith(
      'package:my-org-npm/example-package',
    );
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('fails the whole request on a systemic Cloudsmith error', async () => {
    server.use(
      http.get(
        `${API_BASE_URL}/packages/my-org/:repository/`,
        () => new HttpResponse('nope', { status: 401 }),
      ),
    );

    await expect(
      createService().listPackageVersionsForEntity('component:default/sample', {
        credentials,
      }),
    ).rejects.toThrow('Request failed with 401');
  });

  it('rejects entities without the annotation', async () => {
    const entity = {
      ...sampleEntity,
      metadata: { ...sampleEntity.metadata, annotations: {} },
    };

    await expect(
      createService({ entity }).listPackageVersionsForEntity(
        'component:default/sample',
        { credentials },
      ),
    ).rejects.toThrow(
      "Entity 'component:default/sample' has no cloudsmith.com/packages annotation",
    );
  });

  it('rejects unknown entities', async () => {
    await expect(
      createService().listPackageVersionsForEntity('component:default/other', {
        credentials,
      }),
    ).rejects.toThrow("No entity found for ref 'component:default/other'");
  });
});

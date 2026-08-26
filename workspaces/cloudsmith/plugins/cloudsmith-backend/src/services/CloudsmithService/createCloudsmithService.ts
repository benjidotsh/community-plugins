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
  BackstageCredentials,
  CacheService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { InputError, NotFoundError, ResponseError } from '@backstage/errors';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import {
  CLOUDSMITH_PACKAGES_ANNOTATION,
  getCloudsmithSlugs,
  ListPackageVersionsResponse,
  VERSIONS_PER_PACKAGE,
} from '@backstage-community/plugin-cloudsmith-common';
import { JsonObject } from '@backstage/types';
import {
  API_BASE_URL,
  DEFAULT_CACHE_TTL_SECONDS,
  SLUG_PATTERN,
} from './constants';
import { CloudsmithApiPackage, CloudsmithService, SlugResult } from './types';

export function createCloudsmithService({
  config,
  cache,
  catalog,
}: {
  config: RootConfigService;
  cache: CacheService;
  catalog: typeof catalogServiceRef.T;
}): CloudsmithService {
  const org = config.getString('cloudsmith.org');
  const apiKey = config.getString('cloudsmith.apiKey');
  const cacheTtlMs =
    (config.getOptionalNumber('cloudsmith.cacheTtl') ??
      DEFAULT_CACHE_TTL_SECONDS) * 1000;

  async function fetchSlug(slug: string): Promise<SlugResult> {
    const match = SLUG_PATTERN.exec(slug);
    if (!match?.groups) return { found: false };
    const { repository, packageName } = match.groups;

    const encodedOrg = encodeURIComponent(org);
    const encodedRepository = encodeURIComponent(repository);
    const query = new URLSearchParams({
      query: `name:^${packageName}$`,
      sort: '-date',
      page_size: String(VERSIONS_PER_PACKAGE),
    });

    const response = await fetch(
      `${API_BASE_URL}/packages/${encodedOrg}/${encodedRepository}/?${query}`,
      {
        headers: {
          'X-Api-Key': apiKey,
          Accept: 'application/json',
        },
      },
    );
    if (response.status === 404) return { found: false };
    if (!response.ok) throw await ResponseError.fromResponse(response);

    const packages = (await response.json()) as CloudsmithApiPackage[];
    if (!packages.length) return { found: false };

    const totalCount = Number(response.headers.get('x-pagination-count'));
    return {
      found: true,
      truncated: totalCount > packages.length,
      versions: packages.map(pkg => ({
        slug,
        format: pkg.format,
        name: pkg.name,
        version: pkg.version,
        downloads: pkg.downloads,
        size: pkg.size,
        uploadedAt: pkg.uploaded_at,
        url: pkg.self_webapp_url,
      })),
    };
  }

  async function resolveSlug(slug: string): Promise<SlugResult> {
    const cacheKey = `package:${slug}`;
    const cached = await cache.get(cacheKey);
    if (cached !== undefined) {
      return cached as SlugResult;
    }

    const result = await fetchSlug(slug);
    await cache.set(cacheKey, result as unknown as JsonObject, {
      ttl: cacheTtlMs,
    });
    return result;
  }

  async function listPackageVersionsForEntity(
    entityRef: string,
    options: { credentials: BackstageCredentials },
  ): Promise<ListPackageVersionsResponse> {
    const entity = await catalog.getEntityByRef(entityRef, options);
    if (!entity) {
      throw new NotFoundError(`No entity found for ref '${entityRef}'`);
    }

    const slugs = getCloudsmithSlugs(entity);
    if (!slugs.length) {
      throw new InputError(
        `Entity '${entityRef}' has no ${CLOUDSMITH_PACKAGES_ANNOTATION} annotation`,
      );
    }

    const response: ListPackageVersionsResponse = {
      orgUrl: `https://app.cloudsmith.com/${org}`,
      versions: [],
      unresolvedSlugs: [],
      truncatedSlugs: [],
    };

    const results = await Promise.all(
      slugs.map(async slug => ({
        slug,
        result: await resolveSlug(slug),
      })),
    );
    for (const { slug, result } of results) {
      if (!result.found) {
        response.unresolvedSlugs.push(slug);
        continue;
      }
      response.versions.push(...result.versions);
      if (result.truncated) response.truncatedSlugs.push(slug);
    }

    response.versions.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    return response;
  }

  return { listPackageVersionsForEntity };
}

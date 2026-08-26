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

import type { Entity } from '@backstage/catalog-model';
import {
  CLOUDSMITH_PACKAGES_ANNOTATION,
  CloudsmithPackageVersion,
  ListPackageVersionsResponse,
} from '@backstage-community/plugin-cloudsmith-common';

import { CloudsmithApiPackage } from '../services/CloudsmithService/types';

export function makeEntity(packages: string): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'sample',
      annotations: { [CLOUDSMITH_PACKAGES_ANNOTATION]: packages },
    },
    spec: { type: 'service' },
  };
}

export const sampleEntity = makeEntity(
  'my-org-npm/example-package, my-org-docker/example-service',
);

export const npmApiPackage: CloudsmithApiPackage = {
  format: 'npm',
  name: 'example-package',
  version: '2.1.0',
  downloads: 132,
  size: 34567,
  uploaded_at: '2026-08-01T09:30:00Z',
  self_webapp_url:
    'https://app.cloudsmith.com/my-org/r/my-org-npm/npm/example-package/2.1.0/AbCd1234',
};

export const dockerApiPackage: CloudsmithApiPackage = {
  format: 'docker',
  name: 'example-service',
  version: '1.4.2',
  downloads: 87,
  size: 104857600,
  uploaded_at: '2026-08-10T14:05:00Z',
  self_webapp_url:
    'https://app.cloudsmith.com/my-org/r/my-org-docker/docker/example-service/1.4.2/EfGh5678',
};

export const npmVersion: CloudsmithPackageVersion = {
  slug: 'my-org-npm/example-package',
  format: 'npm',
  name: 'example-package',
  version: '2.1.0',
  downloads: 132,
  size: 34567,
  uploadedAt: '2026-08-01T09:30:00Z',
  url: 'https://app.cloudsmith.com/my-org/r/my-org-npm/npm/example-package/2.1.0/AbCd1234',
};

export const dockerVersion: CloudsmithPackageVersion = {
  slug: 'my-org-docker/example-service',
  format: 'docker',
  name: 'example-service',
  version: '1.4.2',
  downloads: 87,
  size: 104857600,
  uploadedAt: '2026-08-10T14:05:00Z',
  url: 'https://app.cloudsmith.com/my-org/r/my-org-docker/docker/example-service/1.4.2/EfGh5678',
};

export const mockListPackageVersionsResponse: ListPackageVersionsResponse = {
  orgUrl: 'https://app.cloudsmith.com/my-org',
  versions: [dockerVersion, npmVersion],
  unresolvedSlugs: [],
  truncatedSlugs: [],
};

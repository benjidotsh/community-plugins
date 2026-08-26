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
  ApiBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { getCloudsmithSlugs } from '@backstage-community/plugin-cloudsmith-common';
import { cloudsmithApiRef, CloudsmithClient } from './api';

/**
 * Whether the entity's Cloudsmith packages annotation lists any slugs.
 *
 * @public
 */
export function isCloudsmithAvailable(entity: Entity): boolean {
  return getCloudsmithSlugs(entity).length > 0;
}

const cloudsmithApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: cloudsmithApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new CloudsmithClient({ discoveryApi, fetchApi }),
    }),
});

const cloudsmithEntityContent = EntityContentBlueprint.make({
  params: {
    path: '/cloudsmith',
    title: 'Cloudsmith',
    group: 'artifacts',
    loader: () =>
      import('./components/EntityCloudsmithContent').then(m => (
        <m.EntityCloudsmithContent />
      )),
    filter: isCloudsmithAvailable,
  },
});

/**
 * The cloudsmith plugin.
 *
 * @public
 */
export const cloudsmithPlugin = createFrontendPlugin({
  pluginId: 'cloudsmith',
  info: { packageJson: () => import('../package.json') },
  extensions: [cloudsmithApi, cloudsmithEntityContent],
});

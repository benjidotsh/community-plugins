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

import { createDevApp } from '@backstage/frontend-dev-utils';
import { Entity } from '@backstage/catalog-model';
import {
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Container } from '@backstage/ui';
import { CLOUDSMITH_PACKAGES_ANNOTATION } from '@backstage-community/plugin-cloudsmith-common';

import cloudsmithPlugin from '../src';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'sample',
    title: 'Sample Component',
    annotations: {
      [CLOUDSMITH_PACKAGES_ANNOTATION]:
        'helm-charts/secrets-operator, helm-charts/infisical-standalone, helm-charts/doesnt-exist',
    },
  },
  spec: {
    type: 'service',
  },
};

const entityPreviewPage = PageBlueprint.make({
  params: {
    path: '/',
    title: 'Entity Preview',
    routeRef: createRouteRef(),
    loader: () =>
      import('../src/components/EntityCloudsmithContent').then(m => (
        <EntityProvider entity={mockEntity}>
          <Container>
            <m.EntityCloudsmithContent />
          </Container>
        </EntityProvider>
      )),
  },
});

const devPlugin = createFrontendPlugin({
  pluginId: 'dev',
  extensions: [entityPreviewPage],
});

createDevApp({ features: [cloudsmithPlugin, devPlugin] });

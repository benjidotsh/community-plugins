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

import { screen, waitFor } from '@testing-library/react';
import {
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { mockListPackageVersionsResponse } from '../../__fixtures__/mocks';
import { cloudsmithApiRef, CloudsmithApi } from '../../api';
import { CloudsmithPackages } from './CloudsmithPackages';

describe('CloudsmithPackages', () => {
  const cloudsmithApi: jest.Mocked<CloudsmithApi> = {
    listPackageVersionsForEntity: jest.fn(),
  };

  const render = () =>
    renderInTestApp(
      <TestApiProvider apis={[[cloudsmithApiRef, cloudsmithApi]]}>
        <CloudsmithPackages entityRef="component:default/sample" />
      </TestApiProvider>,
    );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders the package versions', async () => {
    cloudsmithApi.listPackageVersionsForEntity.mockResolvedValue(
      mockListPackageVersionsResponse,
    );

    await render();

    await waitFor(() => {
      expect(screen.getByText('2.1.0')).toBeInTheDocument();
    });
    expect(screen.getByText('example-service')).toBeInTheDocument();
    expect(screen.getAllByLabelText('npm').length).toBeGreaterThan(0);
    expect(cloudsmithApi.listPackageVersionsForEntity).toHaveBeenCalledWith(
      'component:default/sample',
    );
  });

  it('warns about unresolved slugs', async () => {
    cloudsmithApi.listPackageVersionsForEntity.mockResolvedValue({
      ...mockListPackageVersionsResponse,
      unresolvedSlugs: ['my-org-npm/no-such-package'],
    });

    await render();

    await waitFor(() => {
      expect(
        screen.getByText(
          'Some annotated packages were not found in Cloudsmith',
        ),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('my-org-npm/no-such-package')).toBeInTheDocument();
  });

  it('mentions packages with truncated version history', async () => {
    cloudsmithApi.listPackageVersionsForEntity.mockResolvedValue({
      ...mockListPackageVersionsResponse,
      truncatedSlugs: ['my-org-npm/example-package'],
    });

    await render();

    await waitFor(() => {
      expect(
        screen.getByText(
          /Only the latest 500 versions are shown for: my-org-npm\/example-package/,
        ),
      ).toBeInTheDocument();
    });
  });

  it('renders the empty state', async () => {
    cloudsmithApi.listPackageVersionsForEntity.mockResolvedValue({
      ...mockListPackageVersionsResponse,
      versions: [],
    });

    await render();

    await waitFor(() => {
      expect(
        screen.getByText('No package versions found in Cloudsmith.'),
      ).toBeInTheDocument();
    });
  });
});

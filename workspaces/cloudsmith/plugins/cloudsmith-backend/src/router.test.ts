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

import { mockErrorHandler, mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';

import { mockListPackageVersionsResponse } from './__fixtures__/mocks';
import { createRouter } from './router';
import { CloudsmithService } from './services/CloudsmithService';

describe('createRouter', () => {
  let app: express.Express;
  let cloudsmith: jest.Mocked<CloudsmithService>;

  beforeEach(async () => {
    cloudsmith = {
      listPackageVersionsForEntity: jest.fn(),
    };
    const router = await createRouter({
      httpAuth: mockServices.httpAuth(),
      cloudsmith,
    });
    app = express();
    app.use(router);
    app.use(mockErrorHandler());
  });

  it('returns the package versions for an entity', async () => {
    cloudsmith.listPackageVersionsForEntity.mockResolvedValue(
      mockListPackageVersionsResponse,
    );

    const response = await request(app).get(
      '/versions?entityRef=component:default/sample',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockListPackageVersionsResponse);
    expect(cloudsmith.listPackageVersionsForEntity).toHaveBeenCalledWith(
      'component:default/sample',
      { credentials: expect.anything() },
    );
  });

  it('rejects requests without an entityRef', async () => {
    const response = await request(app).get('/versions');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { name: 'InputError' } });
  });
});

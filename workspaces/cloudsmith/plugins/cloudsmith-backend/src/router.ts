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

import { HttpAuthService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import express from 'express';
import Router from 'express-promise-router';
import { z } from 'zod';
import { CloudsmithService } from './services/CloudsmithService';

const versionsQuerySchema = z.object({
  entityRef: z.string().min(1),
});

export async function createRouter({
  httpAuth,
  cloudsmith,
}: {
  httpAuth: HttpAuthService;
  cloudsmith: CloudsmithService;
}): Promise<express.Router> {
  const router = Router();

  router.get('/versions', async (req, res) => {
    const parsed = versionsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new InputError(
        `Invalid query parameters: ${z.prettifyError(parsed.error)}`,
      );
    }
    const { entityRef } = parsed.data;

    res.json(
      await cloudsmith.listPackageVersionsForEntity(entityRef, {
        credentials: await httpAuth.credentials(req, { allow: ['user'] }),
      }),
    );
  });

  return router;
}

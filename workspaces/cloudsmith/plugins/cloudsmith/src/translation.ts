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

import { createTranslationRef } from '@backstage/frontend-plugin-api';

/**
 * Translation ref for the cloudsmith plugin, enabling apps to override its
 * messages via a translation resource.
 *
 * @public
 */
export const cloudsmithTranslationRef = createTranslationRef({
  id: 'cloudsmith',
  messages: {
    packagesTable: {
      title: 'Packages',
      searchPlaceholder: 'Search by name, version or type',
      emptyMessage: 'No package versions found in Cloudsmith.',
      unresolvedSlugsAlertTitle:
        'Some annotated packages were not found in Cloudsmith',
      truncatedSlugsMessage:
        'Only the latest {{max}} versions are shown for: {{slugs}}. See {{link}} for the full history.',
      columns: {
        name: 'Name',
        version: 'Version',
        downloads: 'Downloads',
        size: 'Size',
        uploaded: 'Uploaded',
      },
    },
  },
});

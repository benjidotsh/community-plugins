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

/**
 * Cloudsmith's maximum page size, doubling as the per-package cap on how many
 * versions the backend returns (and the number quoted in the frontend's
 * truncation message).
 *
 * @public
 */
export const VERSIONS_PER_PACKAGE = 500;

/**
 * One uploaded package version in Cloudsmith.
 *
 * @public
 */
export interface CloudsmithPackageVersion {
  /** The `repository/package-name` slug this version was resolved from. */
  slug: string;
  /** Package format, e.g. `npm`, `docker`, `python`. */
  format: string;
  name: string;
  version: string;
  downloads: number;
  /** Size in bytes. */
  size: number;
  /** ISO 8601 upload timestamp. */
  uploadedAt: string;
  /** Package page in the Cloudsmith web UI. */
  url: string;
}

/**
 * Response of the cloudsmith backend's `GET /versions` endpoint.
 *
 * @public
 */
export interface ListPackageVersionsResponse {
  /** URL of the Cloudsmith organization in the web UI. */
  orgUrl: string;
  /** Versions merged across all annotated slugs, newest first. */
  versions: CloudsmithPackageVersion[];
  /** Annotated slugs that matched nothing in Cloudsmith. */
  unresolvedSlugs: string[];
  /** Slugs with more versions than the per-package cap returns. */
  truncatedSlugs: string[];
}

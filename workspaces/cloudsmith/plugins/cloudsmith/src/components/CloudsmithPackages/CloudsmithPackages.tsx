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

import { useMemo } from 'react';
import useAsync from 'react-use/esm/useAsync';
import { useApi, useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  CloudsmithPackageVersion,
  VERSIONS_PER_PACKAGE,
} from '@backstage-community/plugin-cloudsmith-common';
import {
  Alert,
  Cell,
  CellText,
  ColumnConfig,
  Flex,
  Header,
  Link,
  SearchField,
  Table,
  Text,
  useTable,
  Box,
} from '@backstage/ui';
import { formatDistanceToNow } from 'date-fns';
import { filesize } from 'filesize';
import {
  RiBox3Line,
  RiInstanceLine,
  RiJavaLine,
  RiNpmjsLine,
  RiPhpLine,
} from '@remixicon/react';
import { cloudsmithApiRef } from '../../api';
import { cloudsmithTranslationRef } from '../../translation';

type VersionRow = CloudsmithPackageVersion & { id: string };

const FORMAT_ICONS: Record<string, typeof RiBox3Line> = {
  npm: RiNpmjsLine,
  docker: RiInstanceLine,
  maven: RiJavaLine,
  composer: RiPhpLine,
};

const FormatIcon = (props: { format: string }) => {
  const Icon = FORMAT_ICONS[props.format] ?? RiBox3Line;
  return <Icon size={16} role="img" aria-label={props.format} />;
};

function searchVersions(rows: VersionRow[], search: string): VersionRow[] {
  const term = search.trim().toLocaleLowerCase('en-US');
  if (!term) return rows;

  return rows.filter(
    row =>
      row.name.toLocaleLowerCase('en-US').includes(term) ||
      row.version.toLocaleLowerCase('en-US').includes(term) ||
      row.format.toLocaleLowerCase('en-US').includes(term),
  );
}

export const CloudsmithPackages = (props: { entityRef: string }) => {
  const cloudsmithApi = useApi(cloudsmithApiRef);
  const { t } = useTranslationRef(cloudsmithTranslationRef);

  const { value, loading, error } = useAsync(
    () => cloudsmithApi.listPackageVersionsForEntity(props.entityRef),
    [props.entityRef],
  );

  const columns = useMemo<ColumnConfig<VersionRow>[]>(
    () => [
      {
        id: 'name',
        label: t('packagesTable.columns.name'),
        isRowHeader: true,
        cell: item => (
          <Cell>
            <Flex align="center" gap="2">
              <FormatIcon format={item.format} />
              <Link
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                variant="body-medium"
                truncate
                title={item.name}
              >
                {item.name}
              </Link>
            </Flex>
          </Cell>
        ),
      },
      {
        id: 'version',
        label: t('packagesTable.columns.version'),
        width: 120,
        cell: item => <CellText title={item.version} />,
      },
      {
        id: 'downloads',
        label: t('packagesTable.columns.downloads'),
        width: 110,
        cell: item => <CellText title={String(item.downloads)} />,
      },
      {
        id: 'size',
        label: t('packagesTable.columns.size'),
        width: 100,
        cell: item => <CellText title={filesize(item.size)} />,
      },
      {
        id: 'uploaded',
        label: t('packagesTable.columns.uploaded'),
        width: 160,
        cell: item => {
          const uploaded = new Date(item.uploadedAt);
          return (
            <Cell>
              <Text title={uploaded.toLocaleString()}>
                {formatDistanceToNow(uploaded, { addSuffix: true })}
              </Text>
            </Cell>
          );
        },
      },
    ],
    [t],
  );

  const rows = useMemo<VersionRow[]>(
    () =>
      (value?.versions ?? []).map((v, index) => ({
        ...v,
        id: `${v.slug}:${v.version}:${index}`,
      })),
    [value],
  );

  const { tableProps, search } = useTable({
    mode: 'complete',
    data: rows,
    searchFn: searchVersions,
    searchDebounceMs: 200,
    paginationOptions: { type: 'page', pageSize: 10 },
  });

  return (
    <Flex direction="column">
      {value && value.unresolvedSlugs.length > 0 && (
        <Alert
          status="warning"
          title={t('packagesTable.unresolvedSlugsAlertTitle')}
          description={value.unresolvedSlugs.join(', ')}
        />
      )}
      <Box>
        <Header
          title={t('packagesTable.title')}
          customActions={
            <SearchField
              aria-label={t('packagesTable.searchPlaceholder')}
              placeholder={t('packagesTable.searchPlaceholder')}
              size="small"
              style={{ width: '280px' }}
              value={search.value}
              onChange={search.onChange}
            />
          }
        />
        <Table
          columnConfig={columns}
          {...tableProps}
          isPending={loading}
          error={error}
          emptyState={<Text>{t('packagesTable.emptyMessage')}</Text>}
        />
      </Box>
      {value && value.truncatedSlugs.length > 0 && (
        <Text color="secondary">
          {t('packagesTable.truncatedSlugsMessage', {
            max: String(VERSIONS_PER_PACKAGE),
            slugs: value.truncatedSlugs.join(', '),
            link: (
              <Link
                href={value.orgUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Cloudsmith
              </Link>
            ),
          })}
        </Text>
      )}
    </Flex>
  );
};

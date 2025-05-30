## API Report File for "@backstage-community/plugin-ocm"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

/// <reference types="react" />

import { BackstagePlugin } from '@backstage/core-plugin-api';
import { Cluster } from '@backstage-community/plugin-ocm-common';
import { IconComponent } from '@backstage/core-plugin-api';
import { JSX as JSX_2 } from 'react/jsx-runtime';
import { ReactNode } from 'react';
import { RouteRef } from '@backstage/core-plugin-api';

// @public (undocumented)
export const ClusterAvailableResourceCard: () => any;

// @public (undocumented)
export const ClusterContextProvider: (props: any) => JSX_2.Element;

// @public (undocumented)
export type ClusterContextType = {
    data: Cluster | null;
    loading: boolean;
    error: Error | null;
};

// @public (undocumented)
export const ClusterInfoCard: () => JSX_2.Element | null;

// @public (undocumented)
export const OcmIcon: IconComponent;

// @public (undocumented)
export const OcmPage: ({ logo }: {
    logo?: ReactNode;
}) => JSX_2.Element;

// @public (undocumented)
export const ocmPlugin: BackstagePlugin<    {
root: RouteRef<undefined>;
}, {}, {}>;

// @public (undocumented)
export const useCluster: () => ClusterContextType;

// (No @packageDocumentation comment for this package)

```

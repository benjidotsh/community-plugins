# cloudsmith

The frontend for the Cloudsmith plugin, providing an entity tab that lists the package versions the entity has published to [Cloudsmith](https://cloudsmith.com).

## Prerequisites

- [@backstage-community/plugin-cloudsmith-backend](../cloudsmith-backend/README.md)

## Installation

If you're using [feature discovery](https://backstage.io/docs/frontend-system/architecture/app/#feature-discovery), the plugin should be automatically discovered and enabled. Otherwise, you can manually enable the plugin by adding it to your app:

```tsx
// packages/app/src/App.tsx
import cloudsmithPlugin from '@backstage-community/plugin-cloudsmith';

const app = createApp({
  features: [
    // ...
    cloudsmithPlugin,
  ],
});
```

## Annotating entities

The tab appears on entities carrying the `cloudsmith.com/packages` annotation, a comma-separated list of `repository/package-name` slugs:

```yaml
metadata:
  annotations:
    cloudsmith.com/packages: my-org-npm/my-lib, my-org-docker/my-service
```

Slugs that don't resolve to a package in Cloudsmith are called out on the tab, so a typo in the annotation is visible rather than silent.

## Translations

All messages the plugin renders are exposed through a [translation ref](https://backstage.io/docs/plugins/internationalization), `cloudsmithTranslationRef`, and can be overridden with a translation resource.

## Local development

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

The frontend talks to the backend plugin, so run `yarn start` in [cloudsmith-backend](../cloudsmith-backend/README.md) alongside it.

# cloudsmith-backend

The backend for the Cloudsmith plugin. It resolves the packages an entity is annotated with against the [Cloudsmith API](https://help.cloudsmith.io/reference/introduction), and caches the responses.

## Installation

Add the plugin to your backend:

```ts
// packages/backend/src/index.ts
backend.add(import('@backstage-community/plugin-cloudsmith-backend'));
```

## Configuration

```yaml
cloudsmith:
  # The Cloudsmith organization that annotated packages are resolved against
  org: my-org
  # An API key with read access to the organization's repositories
  apiKey: ${CLOUDSMITH_API_KEY}
  # Optional: how long Cloudsmith responses are cached, in seconds
  cacheTtl: 300
```

A single organization and API key apply to the whole instance, so all annotated packages are resolved against `cloudsmith.org`.

Requests are authorized as the requesting user, and the entity is read through the catalog with the user's credentials, so an entity a user can't see is not resolved for them.

## Local development

Run `yarn start` in this directory to boot a backend serving one annotated sample entity, using the `cloudsmith` configuration from the workspace's `app-config.yaml`. It points at [a public repository](https://cloudsmith.io/~infisical/repos/helm-charts/packages/) by default, so any Cloudsmith API key will do — reading public repositories doesn't require access to them.

```sh
export CLOUDSMITH_API_KEY=your-api-key
yarn start
```

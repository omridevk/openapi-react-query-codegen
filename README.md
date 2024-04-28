# OpenAPI React Query Codegen

> Node.js library that generates [React Query (also called TanStack Query)](https://tanstack.com/query) hooks based on an OpenAPI specification file.

## Features

- Supports generation of custom react hooks that use React Query's `useQuery` and `useMutation` hooks
- Supports generation of query keys for query caching
- Supports the option to use pure TypeScript clients generated by [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts)

## Install

```
$ npm install -D @7nohe/openapi-react-query-codegen
```

Register the command to the `scripts` property in your package.json file.

```json
{
  "scripts": {
    "codegen": "openapi-rq -i ./petstore.yaml -c axios"
  }
}
```

You can also run the command without installing it in your project using the npx command.

```bash
$ npx --package @7nohe/openapi-react-query-codegen openapi-rq -i ./petstore.yaml -c axios
```

## Usage

```
$ openapi-rq --help

Usage: openapi-rq [options]

Generate React Query code based on OpenAPI

Options:
  -V, --version              output the version number
  -i, --input <value>        OpenAPI specification, can be a path, url or string content (required)
  -o, --output <value>       Output directory (default: "openapi")
  -c, --client <value>       HTTP client to generate [fetch, xhr, node, axios, angular] (default: "fetch")
  --request <value>          Path to custom request file
  --format <value>           Process output folder with formatter? ['biome', 'prettier']
  --lint   <value>           Process output folder with linter? ['eslint', 'biome']
  --operationId              Use operation ID to generate operation names?
  --serviceResponse <value>  Define shape of returned value from service calls ['body', 'response']
  --base <value>             Manually set base in OpenAPI config instead of inferring from server value
  --enums <value>            Generate JavaScript objects from enum definitions? ['javascript', 'typescript']
  --useDateType              Use Date type instead of string for date types for models, this will not convert the data to a Date object
  --debug                    Enable debug mode
  --noSchemas                Disable generating schemas for request and response objects
  --schemaTypes <value>      Define the type of schema generation ['form', 'json'] (default: "json")
  -h, --help                 display help for command
```

## Example Usage

### Command

```
$ openapi-rq -i ./petstore.yaml
```

### Output directory structure

```
- openapi
  - queries
    - index.ts <- main file that exports common types, variables, and queries. Does not export suspense or prefetch hooks
    - common.ts <- common types
    - queries.ts <- generated query hooks
    - suspenses.ts <- generated suspense hooks
    - prefetch.ts <- generated prefetch hooks learn more about prefetching in in link below
  - requests <- output code generated by @hey-api/openapi-ts
```

- [Prefetching docs](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr#prefetching-and-dehydrating-data)

### In your app

#### Using the generated hooks

```tsx
// App.tsx
import { usePetServiceFindPetsByStatus } from "../openapi/queries";
function App() {
  const { data } = usePetServiceFindPetsByStatus({ status: ["available"] });

  return (
    <div className="App">
      <h1>Pet List</h1>
      <ul>{data?.map((pet) => <li key={pet.id}>{pet.name}</li>)}</ul>
    </div>
  );
}

export default App;
```

#### Using the generated typescript client

```tsx
import { useQuery } from "@tanstack/react-query";
import { PetService } from "../openapi/requests/services";
import { usePetServiceFindPetsByStatusKey } from "../openapi/queries";

function App() {
  // You can still use the auto-generated query key
  const { data } = useQuery({
    queryKey: [usePetServiceFindPetsByStatusKey],
    queryFn: () => {
      // Do something here
      return PetService.findPetsByStatus(["available"]);
    },
  });

  return <div className="App">{/* .... */}</div>;
}

export default App;
```

#### Using Suspense Hooks

```tsx
// App.tsx
import { useDefaultClientFindPetsSuspense } from "../openapi/queries/suspense";
function ChildComponent() {
  const { data } = useDefaultClientFindPetsSuspense({ tags: [], limit: 10 });

  return <ul>{data?.map((pet, index) => <li key={pet.id}>{pet.name}</li>)}</ul>;
}

function ParentComponent() {
  return (
    <>
      <Suspense fallback={<>loading...</>}>
        <ChildComponent />
      </Suspense>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <h1>Pet List</h1>
      <ParentComponent />
    </div>
  );
}

export default App;
```

#### Runtime Configuration

You can modify the default values used by the generated service calls by modifying the OpenAPI configuration singleton object.

It's default location is `openapi/requests/core/OpenAPI.ts` and it is also exported from `openapi/index.ts`

Import the constant into your runtime and modify it before setting up the react app.

```typescript
/** main.tsx */
import { OpenAPI as OpenAPIConfig } from './openapi/requests/core/OpenAPI';
...
OpenAPIConfig.BASE = 'www.domain.com/api';
OpenAPIConfig.HEADERS = {
  'x-header-1': 'value-1',
  'x-header-2': 'value-2',
};
...
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

```

## License

MIT

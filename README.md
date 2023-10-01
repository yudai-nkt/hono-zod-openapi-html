# hono-zod-openapi-html

Demo API and its document that integrate the following tech stacks
(before adopting them in an actual project).

- Hono: web framework
- Zod: schema validation
- OpenAPI: API spec description
- Swagger UI: document generator
- Redoc: another document generator

## Possible contributions to the ecosystem

Just a self-reminder in no particular order.
Also keep in mind that these might be my mistakes.

- Cannot infer the correct type for endpoints that may return several response status (cf. compile errors in [`index.tsx`](./src/index.tsx))
- Returning a 204 response yields a compile error (cf. compile errors in [`index.tsx`](./src/index.tsx))
- Return type of `OpenAPIHono`'s `get` or other methods `Hono` already has is `Hono` instead of `OpenAPIHono`.


## License

MIT.

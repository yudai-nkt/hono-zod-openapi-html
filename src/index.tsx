import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { html } from "hono/html";

const app = new OpenAPIHono();

const taskSchema = z
  .object({
    id: z.string().openapi({
      description: "Unique identifier of the task",
      example: "550e8400-e29b-41d4-a716-446655440000",
      param: {
        name: "id",
        in: "path",
        description: "Unique identifier of the task",
      },
    }),
    label: z.string().openapi({
      description: "Human-readable description of the task",
      example: "Buy Zippo",
    }),
    completed: z.boolean().openapi({
      description: "Whether or not the task is completed",
      example: true,
    }),
  })
  .openapi("Task", { description: "Represents an entity of ToDo item" });
let tasks: z.infer<typeof taskSchema>[] = [];

app
  .openapi(
    createRoute({
      method: "get",
      path: "/tasks",
      summary: "List tasks",
      description:
        "Retrieve a list of tasks. You can optionally filter completed tasks using the `hideCompleted` query parameter.",
      request: {
        query: z.object({
          hideCompleted: z
            .string()
            .optional()
            .openapi({
              param: {
                name: "hideCompleted",
                in: "query",
                description:
                  "Whether or not to exclude completed tasks from the list",
              },
              example: "true",
            }),
        }),
      },
      responses: {
        200: {
          content: { "application/json": { schema: z.array(taskSchema) } },
          description: "Retrieve a list of tasks",
        },
      },
      tags: ["Task"],
    }),
    (c) => {
      const { hideCompleted } = c.req.query();
      return c.jsonT(
        hideCompleted === "true"
          ? tasks.filter(({ completed }) => !completed)
          : tasks
      );
    }
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/tasks",
      summary: "Create a task",
      description: "Create a new task using the content of request body.",
      request: {
        body: {
          content: {
            "application/json": { schema: taskSchema.pick({ label: true }) },
          },
          required: true,
        },
      },
      responses: {
        201: {
          content: { "application/json": { schema: taskSchema } },
          description: "New task is successfully created",
        },
      },
      tags: ["Task"],
    }),
    (c) => {
      const { label } = c.req.valid("json");
      const task = { id: crypto.randomUUID(), label, completed: false };
      tasks = [...tasks, task];
      return c.jsonT(task, 201);
    }
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/tasks/{id}",
      summary: "Retrieve a task",
      request: {
        params: taskSchema.pick({ id: true }),
      },
      responses: {
        200: {
          content: { "application/json": { schema: taskSchema } },
          description: "Newly created task",
        },
        404: {
          description: "The requested task is not found",
        },
      },
      tags: ["Task"],
    }),
    (c) => {
      const { id } = c.req.param();
      const task = tasks.find((t) => t.id === id);
      return task ? c.jsonT(task) : c.notFound();
    }
  )
  .openapi(
    createRoute({
      method: "put",
      path: "/tasks/{id}",
      summary: "Update a task",
      description: "",
      request: {
        params: taskSchema.pick({ id: true }),
        body: {
          content: {
            "application/json": {
              schema: taskSchema.omit({ id: true }).partial(),
            },
          },
          required: true,
        },
      },
      responses: {
        204: {
          description: "Successfully updated",
        },
      },
      tags: ["Task"],
    }),
    (c) => {
      const { id } = c.req.param();
      const update = c.req.valid("json");
      tasks = tasks.map((t) => (t.id === id ? { ...t, ...update } : t));
      return c.body(null, 204);
    }
  )
  .openapi(
    createRoute({
      method: "delete",
      path: "/tasks/{id}",
      summary: "Delete a task",
      request: {
        params: taskSchema.pick({ id: true }),
      },
      responses: {
        204: {
          description: "Successfully deleted",
        },
      },
      tags: ["Task"],
    }),
    (c) => {
      const { id } = c.req.param();
      tasks = tasks.filter((t) => t.id !== id);
      return c.body(null, 204);
    }
  )
  .doc("/openapi-spec.json", {
    openapi: "3.0.0",
    info: {
      version: "v1",
      title: "Sample ToDo list API",
      description:
        "This API exhibits how you can provide a comprehensible API documentation using [Hono](https://hono.dev), [Swagger UI](https://swagger.io/docs/open-source-tools/swagger-ui/), and [Redoc](https://redocly.com/docs/redoc/).",
      "x-logo": {
        url: "https://placehold.co/260x100/EEE/31343C?font=montserrat&text=Sample%20ToDo%0AAPI",
        altText: "Sample ToDo API logo",
      },
    },
    tags: [{ name: "Task", description: "Manipulation on ToDo list" }],
  })
  .get("/", (c) =>
    c.html(
      <html lang="en">
        <head>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@picocss/pico@next/css/pico.classless.min.css"
          />
        </head>
        <body>
          <main>
            <h1>Sample ToDo list API</h1>
            <p>
              You can find API reference in either{" "}
              <a href="/docs/redoc">Redoc</a> style or{" "}
              <a href="/docs/swagger">Swagger UI</a> style.
            </p>
          </main>
        </body>
      </html>
    )
  )
  .get("/docs/redoc", (c) =>
    c.html(
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="SwaggerUI" />
          <title>Sample ToDo API | Redoc</title>
        </head>
        <body>
          <redoc spec-url="/openapi-spec.json"></redoc>
          <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
        </body>
      </html>
    )
  )
  .get("/docs/swagger", (c) =>
    c.html(
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="SwaggerUI" />
          <title>Sample ToDo API | SwaggerUI</title>
          <link
            rel="stylesheet"
            href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css"
          />
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script
            src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"
            crossorigin
          ></script>
          {html`<script>
            window.onload = () => {
              window.ui = SwaggerUIBundle({
                url: "/openapi-spec.json",
                dom_id: "#swagger-ui",
              });
            };
          </script>`}
        </body>
      </html>
    )
  );

export default app;

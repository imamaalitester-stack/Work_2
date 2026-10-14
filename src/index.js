import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { captureError } from "./sentry.js";
import notes from "./routes/notes.js";
import auth from "./routes/auth.js";
import webhook from "./routes/webhook.js";

const app = new Hono();

app.get("/", (c) => c.json({ app: "quicknotes-api", ok: true }));
app.route("/api", auth);
app.route("/api", notes);
app.route("/api", webhook);

app.onError((err, c) => {
  console.error(err);
  captureError(err, { path: c.req.path, method: c.req.method });

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  if (err?.name === "ZodError") {
    return c.json({ error: "Validation failed", details: err.issues }, 400);
  }

  return c.json({ error: "Internal server error" }, 500);
});

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port, hostname: "0.0.0.0" });
console.log(`quicknotes-api on :${port}`);

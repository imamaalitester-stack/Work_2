import { serve } from "@hono/node-server";
import { Hono } from "hono";
import notes from "./routes/notes.js";
import auth from "./routes/auth.js";
import webhook from "./routes/webhook.js";

const app = new Hono();

app.get("/", (c) => c.json({ app: "quicknotes-api", ok: true }));
app.route("/api", auth);
app.route("/api", notes);
app.route("/api", webhook);

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port, hostname: "0.0.0.0" });
console.log(`quicknotes-api on :${port}`);

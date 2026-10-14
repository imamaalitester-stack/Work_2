import { Hono } from "hono";
import { db } from "../db.js";
import { summarize } from "../ai.js";
import { requireAuth } from "../middleware/auth.js";
import { createNoteSchema, noteIdParamSchema } from "../schemas/notes.js";

const app = new Hono();

app.use("/notes/*", requireAuth);
app.use("/notes", requireAuth);

// GET /api/notes?q=coffee
app.get("/notes", (c) => {
  const account = c.get("account");
  const q = c.req.query("q");
  let list = db.notes.list().filter((n) => n.owner === account.id);
  if (q) {
    const match = new RegExp(q, "i");
    list = list.filter((n) => match.test(n.title) || match.test(n.body));
  }
  return c.json(list);
});

app.post("/notes", async (c) => {
  const account = c.get("account");
  const body = createNoteSchema.parse(await c.req.json());
  const note = db.notes.insert({ owner: account.id, title: body.title, body: body.body });
  return c.json(note, 201);
});

app.delete("/notes/:id", (c) => {
  const account = c.get("account");
  const { id } = noteIdParamSchema.parse({ id: c.req.param("id") });
  const note = db.notes.get(id);
  if (!note) {
    return c.json({ error: "Not found" }, 404);
  }
  if (note.owner !== account.id) {
    return c.json({ error: "Forbidden" }, 403);
  }
  db.notes.delete(id);
  return c.json({ ok: true });
});

app.get("/notes/:id/summary", async (c) => {
  const account = c.get("account");
  const { id } = noteIdParamSchema.parse({ id: c.req.param("id") });
  const note = db.notes.get(id);
  if (!note) {
    return c.json({ error: "Not found" }, 404);
  }
  if (note.owner !== account.id) {
    return c.json({ error: "Forbidden" }, 403);
  }
  const summary = await summarize(note.body);
  return c.json({ id: note.id, summary });
});

export default app;

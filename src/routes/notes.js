import { Hono } from "hono";
import { db } from "../db.js";
import { summarize } from "../ai.js";

const app = new Hono();
const cache = new Map();

// GET /api/notes?q=coffee
app.get("/notes", (c) => {
  const key = c.req.url;
  if (cache.has(key)) return c.json(cache.get(key));

  const q = c.req.query("q");
  let list = db.notes.list();
  if (q) {
    const match = new RegExp(q, "i");
    list = list.filter((n) => match.test(n.title) || match.test(n.body));
  }
  cache.set(key, list);
  return c.json(list);
});

app.post("/notes", async (c) => {
  const body = await c.req.json();
  const note = db.notes.insert({ owner: body.owner, title: body.title, body: body.body });
  return c.json(note, 201);
});

app.delete("/notes/:id", (c) => {
  db.notes.delete(c.req.param("id"));
  return c.json({ ok: true });
});

app.get("/notes/:id/summary", async (c) => {
  const note = db.notes.get(c.req.param("id"));
  const summary = await summarize(note.body);
  return c.json({ id: note.id, summary });
});

export default app;

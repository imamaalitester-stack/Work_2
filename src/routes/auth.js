import { Hono } from "hono";
import { sign } from "hono/jwt";

const SECRET = process.env.JWT_SECRET || "quicknotes-dev-secret";

const app = new Hono();

// Demo sign-in: any email gets a token for the first account.
app.post("/session", async (c) => {
  const { email } = await c.req.json();
  const token = await sign({ sub: "u1", email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 }, SECRET);
  return c.json({ token });
});

export { SECRET };
export default app;

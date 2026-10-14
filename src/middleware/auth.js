import { verify } from "hono/jwt";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

export async function requireAuth(c, next) {
  const header = c.req.header("authorization") || c.req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = await verify(token, SECRET);
    c.set("account", { id: payload.sub, email: payload.email });
  } catch (err) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  await next();
}
import { Hono } from "hono";
import { db } from "../db.js";

const app = new Hono();

// Stripe tells us when someone upgrades to Pro
app.post("/webhooks/stripe", async (c) => {
  const event = await c.req.json();
  if (event.type === "checkout.session.completed") {
    const accountId = event.data.object.client_reference_id;
    db.accounts.update(accountId, { plan: "pro" });
  }
  return c.json({ received: true });
});

export default app;

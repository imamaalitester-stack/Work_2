import { Hono } from "hono";
import crypto from "node:crypto";
import { db } from "../db.js";
import { captureError } from "../sentry.js";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_WEBHOOK_SECRET) {
  throw new Error("Missing required environment variable: STRIPE_WEBHOOK_SECRET");
}

function verifyStripeSignature(rawBody, signatureHeader) {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => part.split("=").map((s) => s.trim()))
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const expected = crypto
    .createHmac("sha256", STRIPE_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const signatureBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

const app = new Hono();

// Stripe tells us when someone upgrades to Pro
app.post("/webhooks/stripe", async (c) => {
  const rawBody = await c.req.text();
  const signatureHeader = c.req.header("stripe-signature");
  if (!verifyStripeSignature(rawBody, signatureHeader)) {
    return c.json({ error: "Invalid signature" }, 400);
  }

  try {
    const event = JSON.parse(rawBody);
    if (event.type === "checkout.session.completed") {
      const accountId = event.data.object.client_reference_id;
      db.accounts.update(accountId, { plan: "pro" });
    }
  } catch (err) {
    captureError(err, { where: "stripe webhook" });
    return c.json({ error: "Webhook handling failed" }, 500);
  }
  return c.json({ received: true });
});

export default app;

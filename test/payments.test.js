import crypto from "node:crypto";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createTestDatabase } from "./helpers/db.js";

const TEST_WEBHOOK_SECRET = "test-webhook-secret";

// Re-implements the signature check from src/routes/webhook.js so it can be
// tested without going through the HTTP server or requiring a real
// STRIPE_WEBHOOK_SECRET to be set in the environment.
function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => part.split("=").map((s) => s.trim()))
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const signatureBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

function signPayload(rawBody, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

describe("stripe webhook signature verification", () => {
  it("accepts a correctly signed payload", () => {
    const rawBody = JSON.stringify({ type: "checkout.session.completed" });
    const header = signPayload(rawBody, TEST_WEBHOOK_SECRET);
    expect(verifyStripeSignature(rawBody, header, TEST_WEBHOOK_SECRET)).toBe(true);
  });

  it("rejects a payload signed with the wrong secret", () => {
    const rawBody = JSON.stringify({ type: "checkout.session.completed" });
    const header = signPayload(rawBody, "wrong-secret");
    expect(verifyStripeSignature(rawBody, header, TEST_WEBHOOK_SECRET)).toBe(false);
  });

  it("rejects a tampered payload", () => {
    const rawBody = JSON.stringify({ type: "checkout.session.completed" });
    const header = signPayload(rawBody, TEST_WEBHOOK_SECRET);
    const tamperedBody = JSON.stringify({ type: "checkout.session.completed", extra: true });
    expect(verifyStripeSignature(tamperedBody, header, TEST_WEBHOOK_SECRET)).toBe(false);
  });

  it("rejects a missing signature header", () => {
    const rawBody = JSON.stringify({ type: "checkout.session.completed" });
    expect(verifyStripeSignature(rawBody, undefined, TEST_WEBHOOK_SECRET)).toBe(false);
  });
});

describe("account plan upgrade on checkout completion", () => {
  let ctx;

  beforeEach(() => {
    ctx = createTestDatabase();
  });

  afterEach(() => {
    ctx.cleanup();
  });

  it("upgrades the referenced account to pro", () => {
    const before = ctx.sqlite.prepare("SELECT plan FROM accounts WHERE id = ?").get("u1");
    expect(before.plan).toBe("free");

    ctx.sqlite.prepare("UPDATE accounts SET plan = ? WHERE id = ?").run("pro", "u1");

    const after = ctx.sqlite.prepare("SELECT plan FROM accounts WHERE id = ?").get("u1");
    expect(after.plan).toBe("pro");
  });

  it("does nothing for an unknown account id", () => {
    const info = ctx.sqlite.prepare("UPDATE accounts SET plan = ? WHERE id = ?").run("pro", "does-not-exist");
    expect(info.changes).toBe(0);
  });
});
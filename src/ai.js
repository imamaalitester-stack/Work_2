import { captureError } from "./sentry.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing required environment variable: OPENAI_API_KEY");
}

export async function summarize(text) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `Summarise in one line: ${text}` }],
      }),
    });
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (err) {
    captureError(err, { where: "summarize" });
    throw err;
  }
}

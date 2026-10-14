const OPENAI_API_KEY = "sk-proj-SkeamoQaNotRealKey0000000000000000000000";

export async function summarize(text) {
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
}

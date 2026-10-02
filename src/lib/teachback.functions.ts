import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

/** Streams a Responses call over SSE and returns the final text. */
async function streamText(system: string, user: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet.");
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok || !res.body) {
    if (res.status === 402) throw new Error("The AI credits for this app have run out.");
    if (res.status === 429) throw new Error("Too many requests just now — try again in a moment.");
    throw new Error(`AI request failed (${res.status}).`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as { type?: string; delta?: string };
        if (event.type === "response.output_text.delta" && event.delta) text += event.delta;
      } catch {
        /* ignore partial */
      }
    }
  }
  return text;
}

export const reviewTeachBack = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ conceptName: z.string().min(1), boardText: z.string().default(""), explanation: z.string().min(5) }).parse(input),
  )
  .handler(async ({ data }) => {
    const raw = await streamText(
      "You review a learner's own explanation of a concept (teach-back). Return JSON only: " +
        '{"score": integer 1-5, "strengths": string, "gap": string, "nudge": string}. ' +
        "strengths: what they got right (1 sentence). gap: the most important missing or wrong idea (1 sentence). " +
        "nudge: one guiding question that helps them fix the gap without giving the answer. Warm, concrete, no markdown.",
      `Concept: ${data.conceptName}\nBoard: ${data.boardText}\nLearner's explanation: ${data.explanation}`,
    );
    const match = raw.match(/\{[\s\S]*\}/);
    try {
      const parsed = z
        .object({
          score: z.coerce.number().int().min(1).max(5).catch(3),
          strengths: z.string().catch(""),
          gap: z.string().catch(""),
          nudge: z.string().catch(""),
        })
        .parse(JSON.parse(match?.[0] ?? "{}"));
      return parsed;
    } catch {
      throw new Error("The feedback could not be read this time — try again.");
    }
  });

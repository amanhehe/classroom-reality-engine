import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.8-flash";

type GatewayMessage = { role: "system" | "user"; content: string };

async function callGateway(messages: GatewayMessage[], json: boolean) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet.");

  const response = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    if (response.status === 402) throw new Error("The AI credits for this app have run out.");
    if (response.status === 429) throw new Error("Too many requests just now — try again in a moment.");
    throw new Error(`AI request failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

/** The learner joins the discussion as the third student. */
export const askTheClass = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        conceptName: z.string().min(1),
        boardText: z.string().default(""),
        transcript: z.string().default(""),
        question: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const answer = await callGateway(
      [
        {
          role: "system",
          content:
            "You are the teacher in a simulated classroom that builds understanding instead of handing over answers. " +
            "Reply in 2-4 short sentences, warm and concrete. Never give a bare final answer: ask one guiding question " +
            "or give an analogy the learner can test. No markdown, no lists.",
        },
        {
          role: "user",
          content: `Topic: ${data.conceptName}\nOn the board: ${data.boardText}\nDiscussion so far:\n${data.transcript}\n\nA student asks: ${data.question}`,
        },
      ],
      false,
    );
    return { answer: answer.trim() || "Good question — say a little more about what part feels unclear." };
  });

/** Builds a whole class from any topic the learner types. */
export const generateModule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ topic: z.string().min(2) }).parse(input))
  .handler(async ({ data }) => {
    const raw = await callGateway(
      [
        {
          role: "system",
          content:
            "You design short simulated classroom lessons. Return JSON only, with this shape: " +
            '{"name": string, "bloom": one of "remember"|"understand"|"apply"|"analyse", "boardText": short line for the blackboard, ' +
            '"turns": array of 7-9 items {"speaker": "teacher"|"basic_student"|"advanced_student", "type": "dialogue"|"blank"|"hint", ' +
            '"content": string, "answer": string only for blank turns, "hint": string only for blank turns}, ' +
            '"checkpoint": array of 2 items {"prompt": string, "options": array of 4 strings, "answer": one of the options}}. ' +
            "Include exactly one blank turn where content has a ______ gap. The basic student asks the naive question; the " +
            "advanced student probes deeper. Keep every line under 25 words.",
        },
        { role: "user", content: `Build the lesson as json for this topic: ${data.topic}` },
      ],
      true,
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, "").trim());
    } catch {
      throw new Error("The class could not be built this time — try rephrasing the topic.");
    }

    const schema = z.object({
      name: z.string(),
      bloom: z.enum(["remember", "understand", "apply", "analyse"]).catch("understand"),
      boardText: z.string().default(""),
      turns: z
        .array(
          z.object({
            speaker: z.enum(["teacher", "basic_student", "advanced_student"]).catch("teacher"),
            type: z.enum(["dialogue", "blank", "hint"]).catch("dialogue"),
            content: z.string(),
            answer: z.string().optional(),
            hint: z.string().optional(),
          }),
        )
        .min(3),
      checkpoint: z
        .array(z.object({ prompt: z.string(), options: z.array(z.string()).min(2), answer: z.string() }))
        .default([]),
    });

    const lesson = schema.parse(parsed);
    const id = `custom_${Date.now()}`;
    return {
      id,
      name: lesson.name,
      bloom: lesson.bloom,
      boardText: lesson.boardText,
      turns: lesson.turns.map((turn, index) => ({ ...turn, id: `${id}_t${index}` })),
      checkpoint: lesson.checkpoint.map((question, index) => ({ ...question, id: `${id}_c${index}` })),
    };
  });

import { generateText, Output } from "ai";

import { gatewayModel } from "@/lib/gateway";
import { allocateMinutes, drillCountFor } from "@/lib/minutes";
import { planDraftSchema, shapeDraft } from "@/lib/schema";
import type { KitPlan, PlanDraft, SessionInput } from "@/lib/types";

const systemPrompt = `You write tennis session plans for volunteer and community coaches, including new coaches at NGOs. Tennis4All lends rackets, balls, and shoes to children who do not have them. The coach using this plan may have never coached before.

Rules:
- Follow the kit plan exactly. Never assume every child has a racket.
- If players must rotate, say who is on the racket station and what the other stations do.
- Use only the rackets, balls, and cones in the kit. Do not invent nets, ball machines, or a second court.
- Write every title, summary, setup, organisation, cue, and safety note in the requested language. English or Hindi. Do not mix them.
- For Hindi, use simple spoken Hindi a Delhi coach would say out loud. Keep common tennis words such as रैकेट, गेंद, कोर्ट, and स्टेशन.
- Do not name children and do not ask for personal information.
- If the youngest player is under 8, do not include overhead serves, smashes, overheads, sprints, or elimination games. Use an underarm feed and a bounce-hit.
- Coaching cues are short sentences the coach can say out loud.
- Safety notes are practical actions, not legal disclaimers.
- Use the minute budget exactly.`;

function userPrompt(input: SessionInput, kit: KitPlan, minutes: number[]): string {
  const stations = kit.stations
    .map(
      (station) =>
        `- ${station.name}: ${station.players} players, ${station.rackets} rackets, ${station.balls} balls, ${station.cones} cones. ${station.detail}`,
    )
    .join("\n");
  const drillCount = minutes.length - 3;
  return `Build one session plan.

Session:
${JSON.stringify(input, null, 2)}

Court capacity: ${kit.courtCapacity} players hitting at once.
Hitting slots: ${kit.hittingSlots}.
Rotation required: ${kit.needsRotation ? "yes" : "no"}.
Balls are short: ${kit.ballsShort ? "yes" : "no"}.

Kit card:
${kit.summary}

Stations:
${stations}

Use this organisation text on every block:
${kit.organization}

Minute budget, in order: ${minutes.join(", ")}.
That is one warm-up, ${drillCount} drills, one game, and one cool-down.
Language: ${input.language === "hi" ? "Hindi" : "English"}.`;
}

export async function generateDraft(
  input: SessionInput,
  kit: KitPlan,
): Promise<PlanDraft | null> {
  const minutes = allocateMinutes(input.minutes, drillCountFor(input.minutes));
  const { output } = await generateText({
    model: gatewayModel(),
    system: systemPrompt,
    prompt: userPrompt(input, kit, minutes),
    output: Output.object({
      schema: planDraftSchema,
      name: "SessionPlan",
      description: "A tennis session plan a volunteer coach can run today",
    }),
    maxRetries: 1,
    timeout: 25_000,
  });
  if (!output) return null;
  return shapeDraft(output);
}

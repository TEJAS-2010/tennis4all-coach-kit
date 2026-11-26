import { generateDraft } from "@/lib/ai-planner";
import { finalizePlan } from "@/lib/finalize";
import { gatewayConfigured, gatewayModel } from "@/lib/gateway";
import { checkKit } from "@/lib/kit-check";
import { offlineSourceNote, planOffline } from "@/lib/plan-offline";
import { parseSessionInput } from "@/lib/schema";
import type { SessionInput, SessionPlan } from "@/lib/types";

export const invalidModelNote =
  "Offline planner. The model reply did not match the session schema, so the rule-based planner built this plan.";

export const gatewayFailedNote =
  "Offline planner. The AI Gateway request failed, so the rule-based planner built this plan.";

export async function createPlan(
  input: SessionInput,
  options?: { forceOffline?: boolean },
): Promise<SessionPlan> {
  const parsed = parseSessionInput(input);
  if (options?.forceOffline || !gatewayConfigured()) {
    return planOffline(parsed, offlineSourceNote);
  }

  const model = gatewayModel();
  try {
    const draft = await generateDraft(parsed, checkKit(parsed));
    if (!draft) return planOffline(parsed, invalidModelNote);
    return finalizePlan(parsed, draft, {
      source: "ai-gateway",
      sourceNote: `AI Gateway. This plan was generated with ${model} through the Vercel AI Gateway, then checked by the rule-based safety filter.`,
      model,
    });
  } catch {
    return planOffline(parsed, gatewayFailedNote);
  }
}

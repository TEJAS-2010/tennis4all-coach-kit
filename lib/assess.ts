import { assessKitFit, type Assessment } from "@/lib/kit-check";
import { auditSafety } from "@/lib/safety";
import { devanagariCount, type SessionInput, type SessionPlan } from "@/lib/types";

export type { Assessment };

export function assessStructure(plan: SessionPlan, input: SessionInput): Assessment {
  const reasons: string[] = [];
  const kinds = plan.blocks.map((block) => block.kind);
  const drills = kinds.filter((kind) => kind === "drill").length;
  if (kinds[0] !== "warmup") reasons.push("The session does not start with a warm-up.");
  if (kinds.at(-1) !== "cooldown") reasons.push("The session does not end with a cool-down.");
  if (kinds.filter((kind) => kind === "game").length !== 1) {
    reasons.push("The session needs one game.");
  }
  if (drills < 3 || drills > 4) reasons.push(`The session has ${drills} drills.`);
  const total = plan.blocks.reduce((sum, block) => sum + block.minutes, 0);
  if (total !== input.minutes) {
    reasons.push(`Times add up to ${total}, not ${input.minutes}.`);
  }
  for (const block of plan.blocks) {
    if (block.minutes < 3) reasons.push(`${block.title} is shorter than 3 minutes.`);
    if (block.coachingCues.length < 2) reasons.push(`${block.title} needs two coaching cues.`);
    if (block.safetyNotes.length < 1) reasons.push(`${block.title} needs a safety note.`);
    if (block.setup.trim().length < 5) reasons.push(`${block.title} needs a setup.`);
  }
  return { ok: reasons.length === 0, reasons };
}

export function assessLanguage(plan: SessionPlan, input: SessionInput): Assessment {
  const text = [
    plan.title,
    plan.summary,
    plan.kit.summary,
    plan.kit.organization,
    ...plan.kit.stations.flatMap((station) => [station.name, station.detail]),
    ...plan.safetyBrief.flatMap((item) => [item.label, item.detail]),
    ...plan.safetyChanges.map((change) => change.detail),
    ...plan.kitAdjustments.map((change) => change.detail),
    ...plan.blocks.flatMap((block) => [
      block.title,
      block.setup,
      block.organization,
      ...block.coachingCues,
      ...block.safetyNotes,
    ]),
  ].join("\n");
  const count = devanagariCount(text);
  if (input.language === "hi" && count < 80) {
    return {
      ok: false,
      reasons: [`Hindi plan has only ${count} Devanagari characters.`],
    };
  }
  if (input.language === "en" && count !== 0) {
    return {
      ok: false,
      reasons: [`English plan contains ${count} Devanagari characters.`],
    };
  }
  return { ok: true, reasons: [] };
}

export function assessSafetyResult(plan: SessionPlan, input: SessionInput): Assessment {
  const reasons: string[] = [];
  if (!plan.safetyPassed) reasons.push("The safety filter did not pass the plan.");
  const left = auditSafety(plan.blocks, input);
  for (const issue of left) {
    reasons.push(`${issue.code}: ${issue.detail}`);
  }
  return { ok: reasons.length === 0, reasons };
}

export function assessPlan(plan: SessionPlan, input: SessionInput): {
  structure: Assessment;
  kit: Assessment;
  safety: Assessment;
  language: Assessment;
} {
  return {
    structure: assessStructure(plan, input),
    kit: assessKitFit(plan, input),
    safety: assessSafetyResult(plan, input),
    language: assessLanguage(plan, input),
  };
}

import { enforceKit, checkKit } from "@/lib/kit-check";
import { allocateMinutes } from "@/lib/minutes";
import { applySafety, auditSafety, safetyBrief } from "@/lib/safety";
import type {
  PlanBlock,
  PlanChange,
  PlanDraft,
  PlanSource,
  SessionInput,
  SessionPlan,
} from "@/lib/types";

export type PlanMeta = {
  source: PlanSource;
  sourceNote: string;
  model?: string | null;
};

export function applyClock(
  blocks: PlanBlock[],
  total: number,
): { blocks: PlanBlock[]; changed: boolean } {
  const drillCount = blocks.filter((block) => block.kind === "drill").length;
  const minutes = allocateMinutes(total, Math.max(1, drillCount));
  const changed = blocks.some((block, index) => block.minutes !== minutes[index]);
  return {
    changed,
    blocks: blocks.map((block, index) => ({
      ...block,
      minutes: minutes[index] ?? block.minutes,
    })),
  };
}

export function finalizePlan(
  input: SessionInput,
  draft: PlanDraft,
  meta: PlanMeta,
): SessionPlan {
  const kit = checkKit(input);
  const clock = applyClock(draft.blocks, input.minutes);
  const safety = applySafety(clock.blocks, input);
  const kitResult = enforceKit(safety.blocks, input, kit);
  const timingChange: PlanChange[] = clock.changed
    ? [
        {
          code: "timings",
          blockTitle: draft.blocks[0]?.title ?? "Session",
          action: "retimed",
          detail:
            input.language === "hi"
              ? `ब्लॉक का समय बदला, ताकि कुल ${input.minutes} मिनट हो।`
              : `Block times were reset so they add up to ${input.minutes} minutes.`,
        },
      ]
    : [];
  const remaining = auditSafety(kitResult.blocks, input);
  const safetyChanges = [
    ...(safety.changes.some((item) => item.code === "timings") ? [] : timingChange),
    ...safety.changes.filter((change) => change.action !== "flagged"),
    ...remaining.map((issue) => ({
      code: issue.code,
      blockTitle: issue.blockTitle,
      action: "flagged" as const,
      detail: issue.detail,
    })),
  ];

  return {
    title: draft.title,
    summary: draft.summary,
    language: input.language,
    source: meta.source,
    sourceNote: meta.sourceNote,
    model: meta.model ?? null,
    blocks: kitResult.blocks,
    kit,
    kitAdjustments: kitResult.adjustments,
    safetyChanges,
    safetyPassed: remaining.length === 0,
    safetyBrief: safetyBrief(input, kit),
  };
}

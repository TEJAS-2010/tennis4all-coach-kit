import { describe, expect, it } from "vitest";

import { assessPlan } from "@/lib/assess";
import { allocateMinutes } from "@/lib/minutes";
import { planOffline } from "@/lib/plan-offline";
import { presets } from "@/lib/presets";
import type { SessionInput } from "@/lib/types";

function reasons(input: SessionInput): string[] {
  const plan = planOffline(input);
  const report = assessPlan(plan, input);
  return [
    ...report.structure.reasons,
    ...report.kit.reasons,
    ...report.safety.reasons,
    ...report.language.reasons,
  ];
}

describe("allocateMinutes", () => {
  it("adds up for every session length and drill count", () => {
    for (const total of [30, 45, 60, 90]) {
      for (const drills of [3, 4]) {
        const parts = allocateMinutes(total, drills);
        expect(parts.reduce((sum, minutes) => sum + minutes, 0)).toBe(total);
        expect(parts.every((minutes) => minutes >= 3)).toBe(true);
      }
    }
  });
});

describe("planOffline", () => {
  it("builds the demo presets within the kit and the safety rules", () => {
    for (const preset of presets) {
      expect(reasons(preset.input), preset.id).toEqual([]);
    }
  });

  it("names the offline planner on the plan", () => {
    const plan = planOffline(presets[0].input);
    expect(plan.source).toBe("offline");
    expect(plan.sourceNote).toMatch(/Offline planner/);
    expect(plan.model).toBeNull();
    expect(plan.safetyChanges.length).toBeGreaterThan(0);
    expect(plan.kitAdjustments).toEqual([]);
  });

  it("writes the young-player plan in Hindi without an overhead drill", () => {
    const plan = planOffline(presets[1].input);
    const text = JSON.stringify(plan.blocks);
    expect(plan.language).toBe("hi");
    expect(text).toMatch(/[\u0900-\u097F]/);
    expect(text).not.toMatch(/ओवरहेड|स्मैश|overhead|smash/i);
    expect(plan.safetyChanges.some((change) => change.code === "under8-underarm")).toBe(true);
  });
});

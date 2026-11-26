import { describe, expect, it } from "vitest";

import { assessPlan } from "@/lib/assess";
import { evalScenarios } from "@/lib/eval-scenarios";
import { planOffline } from "@/lib/plan-offline";

describe("eval scenarios", () => {
  it("covers at least 12 different sessions", () => {
    expect(evalScenarios.length).toBeGreaterThanOrEqual(12);
    const ids = new Set(evalScenarios.map((scenario) => scenario.id));
    expect(ids.size).toBe(evalScenarios.length);
  });

  it("passes kit, safety, structure, and language in offline mode", () => {
    const failures: string[] = [];
    for (const scenario of evalScenarios) {
      const plan = planOffline(scenario.input);
      const report = assessPlan(plan, scenario.input);
      const reasons = [
        ...report.structure.reasons,
        ...report.kit.reasons,
        ...report.safety.reasons,
        ...report.language.reasons,
      ];
      if (reasons.length > 0) {
        failures.push(`${scenario.id}: ${reasons.join(" | ")}`);
      }
    }
    expect(failures).toEqual([]);
  });
});

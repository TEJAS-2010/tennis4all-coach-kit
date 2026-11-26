import { describe, expect, it } from "vitest";

import { applySafety, auditSafety, markers } from "@/lib/safety";
import type { PlanBlock, SessionInput } from "@/lib/types";

function input(overrides: Partial<SessionInput> = {}): SessionInput {
  return {
    groupSize: 12,
    ageMin: 10,
    ageMax: 12,
    level: "beginner",
    rackets: 6,
    balls: 8,
    cones: 4,
    court: "full",
    minutes: 60,
    language: "en",
    ...overrides,
  };
}

function sessionBlocks(): PlanBlock[] {
  const kinds = ["warmup", "drill", "drill", "drill", "drill", "game", "cooldown"] as const;
  return kinds.map((kind, index) => ({
    kind,
    title: `${kind} ${index + 1}`,
    minutes: 8,
    setup: "Players work in the marked area.",
    organization: "Six players on the racket station at a time. Rotate every 8 minutes.",
    coachingCues: ["Watch the ball.", "Soft knees."],
    safetyNotes: ["One ball in play."],
  }));
}

describe("applySafety", () => {
  it("replaces an overhead serve for under-8s and stays fixed on a second pass", () => {
    const blocks = sessionBlocks();
    blocks[1]!.title = "Overhead serve practice";
    blocks[1]!.coachingCues = ["Throw the ball up and hit a smash.", "Step into the court."];
    const session = input({ ageMin: 6, ageMax: 7, minutes: 45 });
    const first = applySafety(blocks, session);
    const text = JSON.stringify(first.blocks[1]);
    expect(text).not.toMatch(/overhead|smash|toss the ball up/i);
    expect(first.changes.some((change) => change.code === "under8-overhead")).toBe(true);
    expect(first.passed).toBe(true);
    expect(auditSafety(first.blocks, session)).toEqual([]);

    const second = applySafety(first.blocks, session);
    expect(second.changes).toEqual([]);
    expect(second.passed).toBe(true);
  });

  it("replaces a Hindi smash cue for under-8s", () => {
    const blocks = sessionBlocks();
    blocks[2]!.coachingCues = ["ओवरहेड सर्व लगाओ।", "स्मैश मारो।"];
    const session = input({ ageMin: 5, ageMax: 6, language: "hi", minutes: 30, court: "wall" });
    const result = applySafety(blocks, session);
    const text = result.blocks[2]!.coachingCues.join(" ");
    expect(text).not.toMatch(/ओवरहेड|स्मैश/);
    expect(result.passed).toBe(true);
    expect(result.blocks[0]!.safetyNotes.join(" ")).toContain(markers.road.hi);
  });

  it("leaves an overhead cue in place for a 12-year-old group", () => {
    const blocks = sessionBlocks();
    blocks[1]!.coachingCues = ["Hit one overhead after the bounce.", "Recover to the middle."];
    const session = input({ ageMin: 12, ageMax: 14 });
    const result = applySafety(blocks, session);
    expect(result.blocks[1]!.coachingCues[0]).toMatch(/overhead/i);
    expect(result.changes.some((change) => change.code === "under8-overhead")).toBe(false);
    expect(result.passed).toBe(true);
  });

  it("adds two water breaks and a heat break to a 60-minute plan", () => {
    const result = applySafety(sessionBlocks(), input({ minutes: 60 }));
    const notes = result.blocks.flatMap((block) => block.safetyNotes).join("\n");
    expect(notes.split(markers.water.en).length - 1).toBe(2);
    expect(notes).toContain(markers.heat.en);
    expect(result.changes.filter((change) => change.code === "hydration")).toHaveLength(2);
    expect(result.changes.some((change) => change.code === "heat")).toBe(true);
  });

  it("adds one water break and no heat break to a 30-minute plan", () => {
    const result = applySafety(sessionBlocks(), input({ minutes: 30, ageMin: 12, ageMax: 14 }));
    const notes = result.blocks.flatMap((block) => block.safetyNotes).join("\n");
    expect(notes.split(markers.water.en).length - 1).toBe(1);
    expect(notes).not.toContain(markers.heat.en);
  });

  it("adds a shade break to a 45-minute plan", () => {
    const result = applySafety(sessionBlocks(), input({ minutes: 45 }));
    expect(result.changes.some((change) => change.code === "heat")).toBe(true);
  });

  it("lowers sprints and removal games for under-8s", () => {
    const blocks = sessionBlocks();
    blocks[3]!.setup = "Sprint the baseline, then an elimination knockout.";
    const session = input({ ageMin: 5, ageMax: 7, minutes: 30 });
    const result = applySafety(blocks, session);
    expect(result.blocks[3]!.setup).not.toMatch(/sprint|elimination|knockout/i);
    expect(result.changes.map((change) => change.code)).toEqual(
      expect.arrayContaining(["under8-intensity", "under8-elimination"]),
    );
    expect(result.passed).toBe(true);
  });

  it("resets block times that do not add up to the session", () => {
    const blocks = sessionBlocks().map((block) => ({ ...block, minutes: 1 }));
    const result = applySafety(blocks, input({ minutes: 60 }));
    const total = result.blocks.reduce((sum, block) => sum + block.minutes, 0);
    expect(total).toBe(60);
    expect(result.changes.some((change) => change.code === "timings")).toBe(true);
  });

  it("adds a mixed-age note when the range is wide", () => {
    const result = applySafety(sessionBlocks(), input({ ageMin: 5, ageMax: 14, minutes: 45 }));
    expect(result.changes.some((change) => change.code === "mixed-age")).toBe(true);
    expect(result.passed).toBe(true);
  });

  it("makes no changes when the plan already meets every rule", () => {
    const session = input({ ageMin: 12, ageMax: 14, minutes: 30, court: "half" });
    const prepared = applySafety(sessionBlocks(), session);
    const again = applySafety(prepared.blocks, session);
    expect(again.changes).toEqual([]);
    expect(again.passed).toBe(true);
  });
});

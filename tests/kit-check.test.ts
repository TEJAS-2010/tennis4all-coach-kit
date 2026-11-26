import { describe, expect, it } from "vitest";

import {
  assessKitFit,
  checkKit,
  courtCapacity,
  enforceKit,
} from "@/lib/kit-check";
import { planOffline } from "@/lib/plan-offline";
import type { Court, PlanBlock, SessionInput } from "@/lib/types";

function input(overrides: Partial<SessionInput> = {}): SessionInput {
  return {
    groupSize: 20,
    ageMin: 8,
    ageMax: 12,
    level: "beginner",
    rackets: 6,
    balls: 12,
    cones: 8,
    court: "full",
    minutes: 60,
    language: "en",
    ...overrides,
  };
}

function block(organization: string): PlanBlock {
  return {
    kind: "drill",
    title: "Drill",
    minutes: 8,
    setup: "Players hit into the service box.",
    organization,
    coachingCues: ["Watch the ball.", "Soft knees."],
    safetyNotes: ["One ball in play."],
  };
}

describe("checkKit", () => {
  it("rotates 20 players through 6 rackets on a full court", () => {
    const kit = checkKit(input());
    expect(kit.hittingSlots).toBe(6);
    expect(kit.needsRotation).toBe(true);
    expect(kit.racketsShort).toBe(true);
    expect(kit.movementOnly).toBe(false);
    expect(kit.stations.reduce((sum, station) => sum + station.players, 0)).toBe(20);
    expect(kit.stations.reduce((sum, station) => sum + station.rackets, 0)).toBe(6);
    expect(kit.rotateEveryMinutes).toBeGreaterThan(0);
    expect(kit.organization).toMatch(/Rotate/i);
    expect(kit.organization).toMatch(/station/i);
    expect(kit.summary).not.toMatch(/each player has their own racket/i);
  });

  it("rotates for space even when there is a racket for everyone", () => {
    const kit = checkKit(input({ groupSize: 8, rackets: 8, balls: 16 }));
    expect(courtCapacity("full")).toBe(6);
    expect(kit.hittingSlots).toBe(6);
    expect(kit.racketsShort).toBe(false);
    expect(kit.spaceShort).toBe(true);
    expect(kit.needsRotation).toBe(true);
    expect(kit.spareRackets).toBe(2);
    expect(kit.summary).toMatch(/bag/i);
  });

  it("lets a small group all hit when the court can hold them", () => {
    const kit = checkKit(
      input({ groupSize: 4, rackets: 4, balls: 8, cones: 4, minutes: 45 }),
    );
    expect(kit.hittingSlots).toBe(4);
    expect(kit.needsRotation).toBe(false);
    expect(kit.stations).toHaveLength(1);
    expect(kit.stations[0]?.rackets).toBe(4);
  });

  it("builds a no-racket session without handing rackets out", () => {
    const kit = checkKit(input({ groupSize: 12, rackets: 0, balls: 10, cones: 6 }));
    expect(kit.movementOnly).toBe(true);
    expect(kit.hittingSlots).toBe(0);
    expect(kit.stations.every((station) => station.rackets === 0)).toBe(true);
    expect(kit.organization).toMatch(/No rackets/i);
    expect(kit.summary).not.toMatch(/bounce-hit/i);
  });

  it("shares one ball instead of pretending every pair has one", () => {
    const kit = checkKit(input({ groupSize: 6, rackets: 6, balls: 1, cones: 0 }));
    expect(kit.ballsShort).toBe(true);
    expect(kit.stations.reduce((sum, station) => sum + station.balls, 0)).toBeLessThanOrEqual(1);
    expect(kit.summary).toMatch(/one ball/i);
  });

  it("writes the station plan in Hindi", () => {
    const kit = checkKit(input({ language: "hi", groupSize: 10, rackets: 3 }));
    expect(kit.summary).toMatch(/[\u0900-\u097F]/);
    expect(kit.organization).toMatch(/बारी/);
    expect(kit.organization).toMatch(/स्टेशन/);
  });

  it("never allocates more equipment than the coach has", () => {
    const courts: Court[] = ["full", "half", "wall"];
    for (const court of courts) {
      for (const groupSize of [1, 4, 8, 15, 20, 30]) {
        for (const rackets of [0, 1, 3, 6, 8, 20]) {
          for (const balls of [0, 1, 5, 12]) {
            for (const cones of [0, 2, 8]) {
              const kit = checkKit(
                input({ court, groupSize, rackets, balls, cones }),
              );
              expect(kit.stations.reduce((sum, station) => sum + station.players, 0)).toBe(
                groupSize,
              );
              expect(kit.stations.reduce((sum, station) => sum + station.rackets, 0)).toBeLessThanOrEqual(
                rackets,
              );
              expect(kit.stations.reduce((sum, station) => sum + station.balls, 0)).toBeLessThanOrEqual(
                balls,
              );
              expect(kit.stations.reduce((sum, station) => sum + station.cones, 0)).toBeLessThanOrEqual(
                cones,
              );
              expect(kit.hittingSlots).toBe(
                Math.min(rackets, courtCapacity(court), groupSize),
              );
              expect(kit.stations.every((station) => station.players >= 1)).toBe(true);
            }
          }
        }
      }
    }
  });
});

describe("enforceKit", () => {
  it("rewrites a block that assumes one racket per child", () => {
    const session = input();
    const kit = checkKit(session);
    const result = enforceKit(
      [block("Each child has their own racket and hits together.")],
      session,
      kit,
    );
    expect(result.adjustments).toHaveLength(1);
    expect(result.blocks[0]?.organization).toMatch(/Rotate/i);
    expect(result.blocks[0]?.organization).not.toMatch(/own racket/i);
  });

  it("leaves a block alone when it already rotates", () => {
    const session = input();
    const kit = checkKit(session);
    const result = enforceKit([block(kit.organization)], session, kit);
    expect(result.adjustments).toHaveLength(0);
  });
});

describe("assessKitFit", () => {
  it("accepts the offline plan for the 20-player demo", () => {
    const session = input();
    const plan = planOffline(session);
    expect(assessKitFit(plan, session).ok).toBe(true);
  });

  it("rejects a plan that claims every child has a racket", () => {
    const session = input();
    const plan = planOffline(session);
    plan.blocks[2]!.setup = "Each child has their own racket.";
    const result = assessKitFit(plan, session);
    expect(result.ok).toBe(false);
    expect(result.reasons.join(" ")).toMatch(/own racket/i);
  });
});

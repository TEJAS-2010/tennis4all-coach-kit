import type { Minutes } from "@/lib/types";

export function drillCountFor(minutes: Minutes): number {
  return minutes === 30 ? 3 : 4;
}

/**
 * Split a session into warmup, drill, game, and cool-down minutes.
 * The parts always add up to `total`.
 */
export function allocateMinutes(total: number, drillCount: number): number[] {
  if (drillCount < 1) {
    throw new Error("A session needs at least one drill.");
  }
  const warmup = total >= 90 ? 10 : total >= 60 ? 8 : total >= 45 ? 6 : 5;
  const cooldown = total >= 90 ? 12 : total >= 60 ? 8 : total >= 45 ? 5 : 4;
  const game = total >= 90 ? 20 : total >= 60 ? 12 : total >= 45 ? 10 : 6;
  const drillBudget = total - warmup - game - cooldown;
  const base = Math.floor(drillBudget / drillCount);
  let extra = drillBudget % drillCount;
  const drills = Array.from({ length: drillCount }, () => {
    const minutes = base + (extra > 0 ? 1 : 0);
    if (extra > 0) {
      extra -= 1;
    }
    return minutes;
  });
  const parts = [warmup, ...drills, game, cooldown];
  const sum = parts.reduce((totalMinutes, minutes) => totalMinutes + minutes, 0);
  if (sum !== total) {
    parts[parts.length - 2] += total - sum;
  }
  return parts;
}

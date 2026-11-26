import { catalog, type DrillDef } from "@/lib/catalog";
import { finalizePlan } from "@/lib/finalize";
import { checkKit } from "@/lib/kit-check";
import { allocateMinutes, drillCountFor } from "@/lib/minutes";
import { parseSessionInput } from "@/lib/schema";
import {
  tx,
  type KitPlan,
  type Language,
  type Level,
  type PlanBlock,
  type PlanDraft,
  type SessionInput,
  type SessionPlan,
} from "@/lib/types";

const levelName = {
  beginner: { en: "beginner", hi: "शुरुआती" },
  developing: { en: "developing", hi: "सीख रहे" },
  intermediate: { en: "intermediate", hi: "मध्यम" },
} as const;

function fits(drill: DrillDef, input: SessionInput, kit: KitPlan): boolean {
  if (input.ageMin < drill.minAge || input.ageMin > drill.maxAge) return false;
  if (drill.levels !== "any" && !drill.levels.includes(input.level)) return false;
  if (drill.courts !== "any" && !drill.courts.includes(input.court)) return false;
  if (drill.needsRacket && kit.hittingSlots === 0) return false;
  if (drill.needsBall && input.balls === 0) return false;
  if (drill.needsCones && input.cones === 0) return false;
  return true;
}

function score(drill: DrillDef, input: SessionInput, kit: KitPlan): number {
  let value = drill.minAge;
  if (drill.courts !== "any") value += 4;
  if (drill.levels !== "any") value += 3;
  if (drill.needsRacket && kit.hittingSlots > 0) value += 8;
  if (drill.needsBall && input.balls > 0) value += 4;
  if (drill.needsCones && input.cones > 0) value += 2;
  if (drill.kind === "warmup" && input.ageMin < 10 && drill.needsBall) value += 3;
  if (drill.id === "wall-count" && input.court === "wall") value += 5;
  if (drill.id === "grip-swing" && input.balls === 0 && kit.hittingSlots > 0) value += 6;
  return value;
}

function pick(kind: DrillDef["kind"], count: number, input: SessionInput, kit: KitPlan): DrillDef[] {
  const chosen = catalog
    .filter((drill) => drill.kind === kind && fits(drill, input, kit))
    .sort((a, b) => score(b, input, kit) - score(a, input, kit) || a.id.localeCompare(b.id))
    .slice(0, count);
  if (chosen.length < count) {
    throw new Error(`The offline planner could not find ${count} ${kind} blocks for this session.`);
  }
  return chosen;
}

function levelCue(level: Level, language: Language): string {
  return tx(language, {
    beginner: {
      en: "Watch the ball, then swing. A slow ball in the court is a good ball.",
      hi: "गेंद को देखो, फिर मारो। धीमी गेंद जो कोर्ट में रहे, अच्छी गेंद है।",
    },
    developing: {
      en: "After the shot, walk back to your spot before the next ball.",
      hi: "शॉट के बाद अगली गेंद से पहले अपनी जगह पर वापस आओ।",
    },
    intermediate: {
      en: "Aim crosscourt first. Change direction only on an easy ball.",
      hi: "पहले क्रॉसकोर्ट निशाना लगाओ। दिशा तभी बदलो जब गेंद आसान हो।",
    },
  }[level]);
}

function ageCue(input: SessionInput): string | null {
  if (input.ageMin >= 8) return null;
  return tx(input.language, {
    en: "Stand closer to the target, and let the ball bounce first.",
    hi: "निशाने के पास खड़े हो, और गेंद को पहले बाउंस करने दो।",
  });
}

function buildSetup(drill: DrillDef, input: SessionInput, kit: KitPlan): string {
  const language = input.language;
  const activity = tx(language, drill.activity);
  const pieces = [activity];
  if (drill.needsRacket && kit.needsRotation) {
    pieces.push(
      tx(language, {
        en: `Racket station, ${kit.hittingSlots} players. Everyone else stays on a no-racket station from the kit card.`,
        hi: `रैकेट स्टेशन, ${kit.hittingSlots} खिलाड़ी। बाकी खिलाड़ी किट कार्ड वाले बिना-रैकेट स्टेशन पर रहें।`,
      }),
    );
  } else if (!drill.needsRacket && kit.hittingSlots > 0 && drill.kind !== "cooldown" && drill.kind !== "warmup") {
    pieces.unshift(
      tx(language, {
        en: "Rackets down for this block.",
        hi: "इस ब्लॉक में रैकेट नीचे रखो।",
      }),
    );
  } else if (kit.movementOnly && kit.stations.length > 1 && drill.kind === "drill") {
    pieces.push(
      tx(language, {
        en: "Split the group across the stations so one coach can see everyone.",
        hi: "समूह को स्टेशनों में बाँटो, ताकि एक कोच सबको देख सके।",
      }),
    );
  }
  if (drill.needsBall && kit.ballsShort) {
    pieces.push(
      tx(language, {
        en: "Only one ball is in play. The other hitters wait behind the line.",
        hi: "एक समय में एक ही गेंद खेले। बाकी हिटर लाइन के पीछे इंतज़ार करें।",
      }),
    );
  }
  return pieces.join(" ");
}

function buildBlock(drill: DrillDef, input: SessionInput, kit: KitPlan, minutes: number): PlanBlock {
  const cues = [
    tx(input.language, { en: drill.cues.en[0], hi: drill.cues.hi[0] }),
    tx(input.language, { en: drill.cues.en[1], hi: drill.cues.hi[1] }),
    levelCue(input.level, input.language),
  ];
  const young = ageCue(input);
  if (young) cues.push(young);
  return {
    kind: drill.kind,
    title: tx(input.language, drill.title),
    minutes,
    setup: buildSetup(drill, input, kit),
    organization: kit.organization,
    coachingCues: cues,
    safetyNotes: [tx(input.language, drill.safety)],
  };
}

export function buildOfflineDraft(input: SessionInput): PlanDraft {
  const kit = checkKit(input);
  const drillCount = drillCountFor(input.minutes);
  const minutes = allocateMinutes(input.minutes, drillCount);
  const chosen = [
    ...pick("warmup", 1, input, kit),
    ...pick("drill", drillCount, input, kit),
    ...pick("game", 1, input, kit),
    ...pick("cooldown", 1, input, kit),
  ];
  const blocks = chosen.map((drill, index) =>
    buildBlock(drill, input, kit, minutes[index] ?? 5),
  );
  const level = tx(input.language, levelName[input.level]);
  return {
    title: tx(input.language, {
      en: `${input.minutes}-minute ${level} plan for ${input.groupSize} players`,
      hi: `${input.groupSize} खिलाड़ियों के लिए ${input.minutes} मिनट की ${level} योजना`,
    }),
    summary: tx(input.language, {
      en: `Run this as written if you are new to coaching. The kit card decides who holds a racket. ${kit.summary}`,
      hi: `अगर कोचिंग नई है तो योजना को जैसे लिखा है वैसे चलाओ। रैकेट कौन पकड़े, यह किट कार्ड तय करता है। ${kit.summary}`,
    }),
    blocks,
  };
}

export const offlineSourceNote =
  "Offline planner. No AI Gateway key was set, so this plan was built by the rule-based planner.";

export function planOffline(input: SessionInput, sourceNote = offlineSourceNote): SessionPlan {
  const parsed = parseSessionInput(input);
  return finalizePlan(parsed, buildOfflineDraft(parsed), {
    source: "offline",
    sourceNote,
    model: null,
  });
}

import { allocateMinutes } from "@/lib/minutes";
import {
  tx,
  type Language,
  type PlanBlock,
  type PlanChange,
  type SafetyBriefItem,
  type SessionInput,
  type KitPlan,
} from "@/lib/types";

export const markers = {
  water: {
    en: "Water break: every player drinks before moving on.",
    hi: "पानी की ब्रेक: आगे बढ़ने से पहले हर खिलाड़ी पानी पिए।",
  },
  heat: {
    en: "Heat break: two minutes in the shade. Stop if anyone feels dizzy, has a headache, or stops sweating.",
    hi: "गर्मी की ब्रेक: छाया में दो मिनट। चक्कर आए, सिर दर्द करे, या पसीना रुक जाए तो खेल रोक दो।",
  },
  ground: {
    en: "Walk the ground before the first ball and pick up glass, stones, and anything a player could trip on.",
    hi: "पहली गेंद से पहले मैदान देख लो। काँच, पत्थर और कुछ भी जिस पर पैर अड़के, हटा दो।",
  },
  road: {
    en: "A coach stands between the group and any road or car park. Nobody chases a ball past the wall alone.",
    hi: "कोच समूह और सड़क या पार्किंग के बीच खड़ा रहे। दीवार के पार गेंद अकेले कोई न दौड़े।",
  },
  carry: {
    en: "Carry the racket head-down. Do not swing while walking between stations.",
    hi: "रैकेट का सिर नीचे रखकर चलो। स्टेशन बदलते समय स्विंग मत करो।",
  },
  spacing: {
    en: "Stay two racket-lengths apart before any swing.",
    hi: "स्विंग से पहले दो रैकेट की दूरी रखो।",
  },
  underarm: {
    en: "Use an underarm feed and hit after the bounce.",
    hi: "अंडरआर्म से गेंद दो और बाउंस के बाद मारो।",
  },
  easy: {
    en: "Keep the effort easy. Stop for a breath between turns.",
    hi: "मेहनत हल्की रखो। हर बारी के बीच एक साँस लो।",
  },
  fitness: {
    en: "No fitness tests and no all-out running.",
    hi: "फिटनेस टेस्ट नहीं, और पूरी दौड़ नहीं।",
  },
  mixed: {
    en: "The age range is wide. Younger players use a shorter swing and a closer target.",
    hi: "उम्र का फासला बड़ा है। छोटे खिलाड़ी छोटा स्विंग और पास का निशाना इस्तेमाल करें।",
  },
  gap: {
    en: "Leave a clear gap between groups so nobody runs into a friend.",
    hi: "समूहों के बीच जगह रखो, ताकि कोई किसी से टकराए नहीं।",
  },
} as const;

type MarkerKey = keyof typeof markers;

function marker(key: MarkerKey, language: Language): string {
  return markers[key][language];
}

function blockBlob(block: PlanBlock): string {
  return [
    block.title,
    block.setup,
    block.organization,
    ...block.coachingCues,
    ...block.safetyNotes,
  ].join("\n");
}

function planBlob(blocks: PlanBlock[]): string {
  return blocks.map(blockBlob).join("\n");
}

export function countMarker(blocks: PlanBlock[], text: string): number {
  if (!text) return 0;
  return planBlob(blocks).split(text).length - 1;
}

const overheadPattern =
  /overhead|overhand|\bsmash(?:es)?\b|service toss|toss(?:ing)? the ball up|throw(?:ing)? the ball up|ओवरहेड|स्मैश|ऊपर से सर्व/i;
const intensityPattern =
  /\bsprints?\b|\bsuicides?\b|killer drill|max(?:imum)?[- ]effort|conditioning test|स्प्रिंट|पूरी ताकत/i;
const eliminationPattern =
  /\belimination\b|knock-?out|last (?:player|one) (?:out|standing)|एलिमिनेशन/i;

function cloneBlocks(blocks: PlanBlock[]): PlanBlock[] {
  return blocks.map((block) => ({
    ...block,
    coachingCues: [...block.coachingCues],
    safetyNotes: [...block.safetyNotes],
  }));
}

export type SafetyIssue = {
  code: string;
  blockTitle: string;
  detail: string;
};

export function auditSafety(blocks: PlanBlock[], input: SessionInput): SafetyIssue[] {
  const issues: SafetyIssue[] = [];
  const language = input.language;
  const blob = planBlob(blocks);

  if (input.ageMin < 8) {
    for (const block of blocks) {
      const text = blockBlob(block);
      if (overheadPattern.test(text)) {
        issues.push({
          code: "under8-overhead",
          blockTitle: block.title,
          detail: "An under-8 group still has an overhead or smash.",
        });
      }
      if (intensityPattern.test(text)) {
        issues.push({
          code: "under8-intensity",
          blockTitle: block.title,
          detail: "An under-8 group still has a max-effort or sprint drill.",
        });
      }
      if (eliminationPattern.test(text)) {
        issues.push({
          code: "under8-elimination",
          blockTitle: block.title,
          detail: "An under-8 group still has an elimination game.",
        });
      }
    }
    if (!blob.includes(marker("underarm", language))) {
      issues.push({
        code: "under8-underarm",
        blockTitle: blocks[0]?.title ?? "Session",
        detail: "The under-8 serve rule is missing.",
      });
    }
    if (!blob.includes(marker("easy", language))) {
      issues.push({
        code: "under8-easy",
        blockTitle: blocks[0]?.title ?? "Session",
        detail: "The easy-effort rule is missing.",
      });
    }
  } else if (input.ageMin < 12 && !blob.includes(marker("fitness", language))) {
    issues.push({
      code: "youth-fitness",
      blockTitle: blocks[0]?.title ?? "Session",
      detail: "The no-fitness-test rule is missing.",
    });
  }

  const water = marker("water", language);
  const waterNeeded = input.minutes >= 60 ? 2 : input.minutes >= 30 ? 1 : 0;
  if (countMarker(blocks, water) < waterNeeded) {
    issues.push({
      code: "hydration",
      blockTitle: blocks[0]?.title ?? "Session",
      detail: "The plan needs more water breaks.",
    });
  }
  if (input.minutes >= 45 && !blob.includes(marker("heat", language))) {
    issues.push({
      code: "heat",
      blockTitle: "Session",
      detail: "The heat break is missing.",
    });
  }
  if (!blob.includes(marker("ground", language))) {
    issues.push({
      code: "ground",
      blockTitle: blocks[0]?.title ?? "Session",
      detail: "The ground check is missing.",
    });
  }
  if (input.court === "wall" && !blob.includes(marker("road", language))) {
    issues.push({
      code: "road",
      blockTitle: blocks[0]?.title ?? "Session",
      detail: "The road and wall rule is missing.",
    });
  }
  if (input.rackets > 0 && !blob.includes(marker("carry", language))) {
    issues.push({
      code: "carry",
      blockTitle: blocks[0]?.title ?? "Session",
      detail: "The racket-carry rule is missing.",
    });
  }
  if (input.rackets > 0 && !blob.includes(marker("spacing", language))) {
    issues.push({
      code: "spacing",
      blockTitle: "Session",
      detail: "The spacing rule is missing.",
    });
  }
  if (input.rackets === 0 && !blob.includes(marker("gap", language))) {
    issues.push({
      code: "group-gap",
      blockTitle: blocks[0]?.title ?? "Session",
      detail: "The gap between groups is missing.",
    });
  }
  if (input.ageMax - input.ageMin >= 6 && !blob.includes(marker("mixed", language))) {
    issues.push({
      code: "mixed-age",
      blockTitle: blocks[0]?.title ?? "Session",
      detail: "The mixed-age note is missing.",
    });
  }

  const total = blocks.reduce((sum, block) => sum + block.minutes, 0);
  if (total !== input.minutes || blocks.some((block) => block.minutes < 1)) {
    issues.push({
      code: "timings",
      blockTitle: "Session",
      detail: `Block times add up to ${total}, not ${input.minutes}.`,
    });
  }

  return issues;
}

function scrubUnsafe(blocks: PlanBlock[], input: SessionInput, changes: PlanChange[]): void {
  if (input.ageMin >= 8) return;
  const stays = tx(input.language, {
    en: "Everyone stays in the game.",
    hi: "हर खिलाड़ी खेल में बना रहे।",
  });
  const rules: Array<{
    code: string;
    pattern: RegExp;
    safe: string;
    detail: { en: string; hi: string };
  }> = [
    {
      code: "under8-overhead",
      pattern: overheadPattern,
      safe: marker("underarm", input.language),
      detail: {
        en: "Replaced an overhead serve or smash with an underarm feed.",
        hi: "ओवरहेड सर्व या स्मैश की जगह अंडरआर्म फीड लिखा।",
      },
    },
    {
      code: "under8-intensity",
      pattern: intensityPattern,
      safe: marker("easy", input.language),
      detail: {
        en: "Lowered a max-effort or sprint drill to an easy pace.",
        hi: "तेज़ ड्रिल को हल्की रफ़्तार पर लाया।",
      },
    },
    {
      code: "under8-elimination",
      pattern: eliminationPattern,
      safe: stays,
      detail: {
        en: "Changed an elimination game so every player stays in.",
        hi: "एलिमिनेशन हटाया, ताकि हर खिलाड़ी खेल में रहे।",
      },
    },
  ];

  for (const block of blocks) {
    const fields = [
      block.title,
      block.setup,
      block.organization,
      ...block.coachingCues,
      ...block.safetyNotes,
    ];
    const hits = rules.filter((rule) => fields.some((field) => rule.pattern.test(field)));
    if (hits.length === 0) continue;
    const fix = (text: string) => {
      const hit = rules.find((rule) => rule.pattern.test(text));
      return hit ? hit.safe : text;
    };
    block.title = fix(block.title);
    block.setup = fix(block.setup);
    block.organization = fix(block.organization);
    block.coachingCues = block.coachingCues.map(fix);
    block.safetyNotes = block.safetyNotes.map(fix);
    for (const hit of hits) {
      changes.push({
        code: hit.code,
        blockTitle: block.title,
        action: "rewrote",
        detail: tx(input.language, hit.detail),
      });
    }
  }
}

function addNote(
  blocks: PlanBlock[],
  index: number,
  note: string,
  code: string,
  changes: PlanChange[],
): void {
  const block = blocks[index];
  if (!block || block.safetyNotes.includes(note) || planBlob(blocks).includes(note)) {
    return;
  }
  block.safetyNotes = [...block.safetyNotes, note];
  changes.push({
    code,
    blockTitle: block.title,
    action: "appended",
    detail: note,
  });
}

function ensureMarkerCount(
  blocks: PlanBlock[],
  note: string,
  needed: number,
  indexes: number[],
  code: string,
  changes: PlanChange[],
): void {
  let have = countMarker(blocks, note);
  for (const index of indexes) {
    if (have >= needed) return;
    const block = blocks[index];
    if (!block || block.safetyNotes.includes(note)) continue;
    block.safetyNotes = [...block.safetyNotes, note];
    have += 1;
    changes.push({
      code,
      blockTitle: block.title,
      action: "appended",
      detail: note,
    });
  }
}

function scaleMinutes(blocks: PlanBlock[], total: number): number[] {
  const current = blocks.map((block) => Math.max(1, block.minutes));
  const sum = current.reduce((value, minutes) => value + minutes, 0);
  const scaled = current.map((minutes) => Math.max(1, Math.floor((minutes * total) / sum)));
  let drift = total - scaled.reduce((value, minutes) => value + minutes, 0);
  let guard = 0;
  while (drift !== 0 && guard < 1000) {
    const index = guard % scaled.length;
    if (drift > 0) {
      scaled[index] += 1;
      drift -= 1;
    } else if (scaled[index] > 1) {
      scaled[index] -= 1;
      drift += 1;
    }
    guard += 1;
  }
  return scaled;
}

function retimed(blocks: PlanBlock[], input: SessionInput, changes: PlanChange[]): void {
  const drillCount = blocks.filter((block) => block.kind === "drill").length;
  const standardShape =
    drillCount >= 1 &&
    blocks.length === drillCount + 3 &&
    blocks[0]?.kind === "warmup" &&
    blocks.at(-1)?.kind === "cooldown" &&
    blocks[blocks.length - 2]?.kind === "game";
  const nextMinutes =
    standardShape && [30, 45, 60, 90].includes(input.minutes)
      ? allocateMinutes(input.minutes, drillCount)
      : scaleMinutes(blocks, input.minutes);
  const changed = blocks.some((block, index) => block.minutes !== nextMinutes[index]);
  if (!changed) return;
  blocks.forEach((block, index) => {
    block.minutes = nextMinutes[index] ?? block.minutes;
  });
  changes.push({
    code: "timings",
    blockTitle: blocks[0]?.title ?? "Session",
    action: "retimed",
    detail: tx(input.language, {
      en: `Block times were reset so they add up to ${input.minutes} minutes.`,
      hi: `ब्लॉक का समय बदला, ताकि कुल ${input.minutes} मिनट हो।`,
    }),
  });
}

export function applySafety(
  blocks: PlanBlock[],
  input: SessionInput,
): { blocks: PlanBlock[]; changes: PlanChange[]; passed: boolean } {
  const next = cloneBlocks(blocks);
  const changes: PlanChange[] = [];
  const language = input.language;

  scrubUnsafe(next, input, changes);

  const middle = Math.min(next.length - 1, Math.floor(next.length / 2));
  const firstDrill = Math.max(
    0,
    next.findIndex((block) => block.kind === "drill"),
  );

  if (input.ageMin < 8) {
    addNote(next, 0, marker("underarm", language), "under8-underarm", changes);
    addNote(next, 0, marker("easy", language), "under8-easy", changes);
  } else if (input.ageMin < 12) {
    addNote(next, 0, marker("fitness", language), "youth-fitness", changes);
  }
  if (input.ageMax - input.ageMin >= 6) {
    addNote(next, 0, marker("mixed", language), "mixed-age", changes);
  }
  addNote(next, 0, marker("ground", language), "ground", changes);
  if (input.court === "wall") {
    addNote(next, 0, marker("road", language), "road", changes);
  }
  if (input.rackets > 0) {
    addNote(next, 0, marker("carry", language), "carry", changes);
    addNote(next, firstDrill, marker("spacing", language), "spacing", changes);
  } else {
    addNote(next, 0, marker("gap", language), "group-gap", changes);
  }

  const waterNeeded = input.minutes >= 60 ? 2 : 1;
  ensureMarkerCount(
    next,
    marker("water", language),
    waterNeeded,
    [0, middle],
    "hydration",
    changes,
  );
  if (input.minutes >= 45) {
    addNote(next, middle, marker("heat", language), "heat", changes);
  }

  retimed(next, input, changes);

  const left = auditSafety(next, input);
  for (const issue of left) {
    changes.push({
      code: issue.code,
      blockTitle: issue.blockTitle,
      action: "flagged",
      detail: issue.detail,
    });
  }

  return { blocks: next, changes, passed: left.length === 0 };
}

const courtCapacityLabel = {
  full: { en: "full court", hi: "पूरे कोर्ट" },
  half: { en: "half court", hi: "आधे कोर्ट" },
  wall: { en: "wall or open ground", hi: "दीवार या खुले मैदान" },
} as const;

export function safetyBrief(input: SessionInput, kit: KitPlan): SafetyBriefItem[] {
  const language = input.language;
  const intensityDetail =
    input.ageMin < 8
      ? tx(language, {
          en: "The youngest player is under 8, so the effort stays easy and nobody is knocked out.",
          hi: "सबसे छोटा खिलाड़ी 8 से छोटा है, इसलिए मेहनत हल्की रहे और कोई बाहर न हो।",
        })
      : input.ageMin < 12
        ? tx(language, {
            en: "No fitness tests and no all-out running for this age group.",
            hi: "इस उम्र में फिटनेस टेस्ट नहीं और पूरी दौड़ नहीं।",
          })
        : tx(language, {
            en: "Full swings are allowed. Stop a drill if the players are too tired to stay balanced.",
            hi: "पूरा स्विंग चल सकता है। अगर संतुलन बिगड़े तो ड्रिल रोक दो।",
          });

  const hydrationDetail =
    input.minutes >= 60
      ? tx(language, {
          en: "Water at the start and again in the middle, plus a shade break. This session is long enough to overheat.",
          hi: "शुरुआत में पानी, बीच में फिर पानी, और छाया की ब्रेक। यह सत्र गर्मी के लिए काफी लंबा है।",
        })
      : input.minutes >= 45
        ? tx(language, {
            en: "A water break and two minutes in the shade.",
            hi: "पानी की ब्रेक और छाया में दो मिनट।",
          })
        : tx(language, {
            en: "A water break before the first drill.",
            hi: "पहली ड्रिल से पहले पानी की ब्रेक।",
          });

  const overheadDetail =
    input.ageMin < 8
      ? tx(language, {
          en: "Overhead serving and smashing are banned. Use an underarm feed and hit after the bounce.",
          hi: "ओवरहेड सर्व और स्मैश मना है। अंडरआर्म से गेंद दो और बाउंस के बाद मारो।",
        })
      : tx(language, {
          en: "A full serve is allowed only if the coach already teaches it, and not as a power test.",
          hi: "पूरा सर्व तभी, जब कोच उसे सिखा चुका हो, और ताकत की परीक्षा की तरह नहीं।",
        });

  return [
    {
      id: "intensity",
      label: tx(language, {
        en: "Age-appropriate intensity",
        hi: "उम्र के हिसाब से मेहनत",
      }),
      detail: intensityDetail,
    },
    {
      id: "spacing",
      label: tx(language, {
        en: "Spacing per player",
        hi: "हर खिलाड़ी के लिए जगह",
      }),
      detail: tx(language, {
        en: `A ${tx(language, courtCapacityLabel[input.court])} fits ${kit.courtCapacity} players hitting at once. This plan uses ${kit.hittingSlots}.`,
        hi: `${tx(language, courtCapacityLabel[input.court])} पर एक साथ ${kit.courtCapacity} खिलाड़ी मार सकते हैं। इस योजना में ${kit.hittingSlots} हैं।`,
      }),
    },
    {
      id: "hydration",
      label: tx(language, {
        en: "Hydration and heat",
        hi: "पानी और गर्मी",
      }),
      detail: hydrationDetail,
    },
    {
      id: "overhead",
      label: tx(language, {
        en: "Overhead serving",
        hi: "ओवरहेड सर्व",
      }),
      detail: overheadDetail,
    },
  ];
}

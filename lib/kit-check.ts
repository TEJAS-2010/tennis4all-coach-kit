import { allocateMinutes, drillCountFor } from "@/lib/minutes";
import {
  tx,
  type Court,
  type KitPlan,
  type Language,
  type PlanBlock,
  type PlanChange,
  type SessionInput,
  type Station,
  type StationKind,
} from "@/lib/types";

/**
 * How many players may swing a racket at the same time.
 * A full court keeps three hitters on each half and the net area clear.
 * A half court, wall, or open-ground lane keeps one line of four.
 */
export function courtCapacity(court: Court): number {
  if (court === "full") return 6;
  return 4;
}

export function distribute(total: number, parts: number): number[] {
  if (parts <= 0) return [];
  const base = Math.floor(total / parts);
  let extra = total % parts;
  return Array.from({ length: parts }, () => {
    const value = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra -= 1;
    return value;
  });
}

const stationLabels: Record<StationKind, { en: string; hi: string }> = {
  rackets: { en: "Racket station", hi: "रैकेट स्टेशन" },
  "ball-skills": { en: "Ball-skills station", hi: "बॉल-स्किल स्टेशन" },
  movement: { en: "Cone station", hi: "कोन स्टेशन" },
  shadow: { en: "Ready-position station", hi: "रेडी-पोज़िशन स्टेशन" },
};

function stationName(
  kind: StationKind,
  occurrence: number,
  total: number,
  language: Language,
): string {
  const label = tx(language, stationLabels[kind]);
  if (total <= 1) return label;
  return `${label} ${occurrence}`;
}

function waitingDetail(
  kind: StationKind,
  language: Language,
): string {
  if (kind === "ball-skills") {
    return tx(language, {
      en: "Throw, let it bounce, and catch. No rackets on this station.",
      hi: "फेंको, एक बाउंस दो, और पकड़ो। इस स्टेशन पर रैकेट नहीं।",
    });
  }
  if (kind === "movement") {
    return tx(language, {
      en: "Side-step through the cones and walk back. No rackets on this station.",
      hi: "कोन के बीच साइड-स्टेप करो और चलकर वापस आओ। इस स्टेशन पर रैकेट नहीं।",
    });
  }
  return tx(language, {
    en: "Ready position and a slow swing with empty hands. No racket and no ball.",
    hi: "रेडी पोज़िशन और खाली हाथ से धीमा स्विंग। न रैकेट, न गेंद।",
  });
}

function assignWaiting(
  players: number,
  balls: number,
  cones: number,
  language: Language,
): Station[] {
  if (players <= 0) return [];

  const preferred: StationKind[] = [];
  if (cones > 0) preferred.push("movement");
  if (balls > 0) preferred.push("ball-skills");
  if (preferred.length === 0) preferred.push("shadow");

  const stationCount = Math.min(
    players,
    Math.max(preferred.length, Math.ceil(players / 8)),
  );
  const counts = distribute(players, stationCount);
  const kinds = counts.map((_, index) => preferred[index] ?? "shadow");

  const movementIndexes = kinds.flatMap((kind, index) =>
    kind === "movement" ? [index] : [],
  );
  const ballIndexes = kinds.flatMap((kind, index) =>
    kind === "ball-skills" ? [index] : [],
  );
  const coneShares = distribute(cones, movementIndexes.length);
  const ballShares = distribute(balls, ballIndexes.length);
  const conesByIndex = new Map(
    movementIndexes.map((index, shareIndex) => [index, coneShares[shareIndex] ?? 0]),
  );
  const ballsByIndex = new Map(
    ballIndexes.map((index, shareIndex) => [index, ballShares[shareIndex] ?? 0]),
  );

  const resolved = kinds.map((kind, index) => {
    if (kind === "movement" && (conesByIndex.get(index) ?? 0) === 0) {
      return "shadow" as const;
    }
    if (kind === "ball-skills" && (ballsByIndex.get(index) ?? 0) === 0) {
      return "shadow" as const;
    }
    return kind;
  });

  const totals = new Map<StationKind, number>();
  for (const kind of resolved) {
    totals.set(kind, (totals.get(kind) ?? 0) + 1);
  }
  const seen = new Map<StationKind, number>();

  return resolved.map((kind, index) => {
    const occurrence = (seen.get(kind) ?? 0) + 1;
    seen.set(kind, occurrence);
    const conesUsed = kind === "movement" ? (conesByIndex.get(index) ?? 0) : 0;
    const ballsUsed = kind === "ball-skills" ? (ballsByIndex.get(index) ?? 0) : 0;
    return {
      kind,
      name: stationName(kind, occurrence, totals.get(kind) ?? 1, language),
      players: counts[index] ?? 0,
      rackets: 0,
      balls: ballsUsed,
      cones: conesUsed,
      detail: waitingDetail(kind, language),
    };
  });
}

function racketDetail(
  input: SessionInput,
  ballsInPlay: number,
  conesOnStation: number,
  ballsShort: boolean,
): string {
  const language = input.language;
  const parts: string[] = [];
  if (ballsInPlay === 0) {
    parts.push(
      tx(language, {
        en: "No balls. Handshake grip, ready position, and a slow swing only.",
        hi: "गेंद नहीं। हैंडशेक ग्रिप, रेडी पोज़िशन, और सिर्फ धीमा स्विंग।",
      }),
    );
  } else if (ballsShort) {
    parts.push(
      tx(language, {
        en: "Balls are short. One ball in play: underarm feed, then the next pair.",
        hi: "गेंदें कम हैं। एक गेंद खेले: अंडरआर्म फीड, फिर अगली जोड़ी।",
      }),
    );
  } else {
    parts.push(
      tx(language, {
        en: "One ball per pair. Underarm feed, then a bounce-hit.",
        hi: "हर जोड़ी के लिए एक गेंद। अंडरआर्म फीड, फिर बाउंस-हिट।",
      }),
    );
  }
  if (conesOnStation > 0) {
    parts.push(
      tx(language, {
        en: "Cones mark the target.",
        hi: "कोन निशाना दिखाते हैं।",
      }),
    );
  } else if (input.cones > 0) {
    parts.push(
      tx(language, {
        en: "Use the court lines as the target. The cones are on the cone station.",
        hi: "निशाने के लिए कोर्ट की लाइन इस्तेमाल करो। कोन, कोन स्टेशन पर हैं।",
      }),
    );
  }
  if (input.balls > ballsInPlay) {
    parts.push(
      tx(language, {
        en: "Spare balls stay in the basket until a ball is lost.",
        hi: "बची गेंदें टोकरी में रहें, जब तक कोई गेंद खो न जाए।",
      }),
    );
  }
  return parts.join(" ");
}

const courtLabel = {
  full: { en: "Full court", hi: "पूरा कोर्ट" },
  half: { en: "Half court", hi: "आधा कोर्ट" },
  wall: { en: "Wall or open ground", hi: "दीवार या खुला मैदान" },
} as const;

const levelLabel = {
  beginner: { en: "beginner", hi: "शुरुआती" },
  developing: { en: "developing", hi: "सीख रहे" },
  intermediate: { en: "intermediate", hi: "मध्यम" },
} as const;

function writeCopy(
  input: SessionInput,
  hittingSlots: number,
  stations: Station[],
  rotateEveryMinutes: number | null,
  rotationGroups: number,
  drillMinutes: number,
  ballsShort: boolean,
): { summary: string; organization: string } {
  const language = input.language;
  const others = input.groupSize - hittingSlots;
  const spareRackets = Math.max(0, input.rackets - hittingSlots);
  const needsRotation = hittingSlots > 0 && input.groupSize > hittingSlots;
  const covered =
    rotateEveryMinutes === null ||
    rotateEveryMinutes * rotationGroups <= drillMinutes;

  let organization: string;
  if (hittingSlots === 0 && stations.length > 1) {
    organization = tx(language, {
      en: "No rackets today, so nobody rallies. Split the group across the stations on the kit card. Change stations when the coach calls so you can see every player.",
      hi: "आज रैकेट नहीं हैं, इसलिए रैली नहीं। समूह को किट कार्ड के स्टेशनों में बाँटो। कोच बुलाए तो स्टेशन बदलो, ताकि हर खिलाड़ी दिखे।",
    });
  } else if (hittingSlots === 0) {
    organization = tx(language, {
      en: "No rackets today, so nobody rallies. The group works together in front of the coach.",
      hi: "आज रैकेट नहीं हैं, इसलिए रैली नहीं। समूह कोच के सामने एक साथ काम करेगा।",
    });
  } else if (needsRotation && rotateEveryMinutes !== null) {
    const sentences = [
      tx(language, {
        en: `${hittingSlots} players use the rackets at a time. The other ${others} stay on a station that does not need a racket. Rotate every ${rotateEveryMinutes} minutes so each group reaches the rackets. Do not hand a racket to someone who is walking.`,
        hi: `एक समय में ${hittingSlots} खिलाड़ी रैकेट इस्तेमाल करें। बाकी ${others} ऐसे स्टेशन पर रहें जहाँ रैकेट नहीं चाहिए। हर ${rotateEveryMinutes} मिनट में बारी बदलो, ताकि हर समूह रैकेट तक पहुँचे। चलते हुए रैकेट मत दो।`,
      }),
    ];
    if (!covered) {
      sentences.push(
        tx(language, {
          en: "Keep rotating through the game. Drill time is short, so some turns will be brief.",
          hi: "खेल के दौरान भी बारी बदलते रहो। ड्रिल का समय छोटा है, इसलिए कुछ बारी छोटी रहेंगी।",
        }),
      );
    }
    if (spareRackets > 0) {
      sentences.push(
        tx(language, {
          en: `${spareRackets} extra ${spareRackets === 1 ? "racket stays" : "rackets stay"} in the bag so the court does not get crowded.`,
          hi: `${spareRackets} अतिरिक्त रैकेट बैग में रहें, ताकि कोर्ट पर भीड़ न हो।`,
        }),
      );
    }
    if (ballsShort) {
      sentences.push(
        tx(language, {
          en: "Balls are short, so only one ball is in play at the racket station.",
          hi: "गेंदें कम हैं, इसलिए रैकेट स्टेशन पर एक समय में एक ही गेंद खेले।",
        }),
      );
    }
    organization = sentences.join(" ");
  } else {
    const sentences = [
      tx(language, {
        en: `There is room for every player to hold a racket. ${hittingSlots} ${hittingSlots === 1 ? "player hits" : "players hit"} at a time. Leave a clear gap between swings.`,
        hi: `जगह हर खिलाड़ी के लिए काफी है। एक समय में ${hittingSlots} खिलाड़ी मारें। स्विंग के बीच साफ दूरी रखो।`,
      }),
    ];
    if (spareRackets > 0) {
      sentences.push(
        tx(language, {
          en: `${spareRackets} extra ${spareRackets === 1 ? "racket stays" : "rackets stay"} in the bag.`,
          hi: `${spareRackets} अतिरिक्त रैकेट बैग में रहें।`,
        }),
      );
    }
    if (input.balls === 0) {
      sentences.push(
        tx(language, {
          en: "There are no balls, so this is grip and swing practice only.",
          hi: "गेंद नहीं है, इसलिए सिर्फ ग्रिप और स्विंग का अभ्यास।",
        }),
      );
    } else if (ballsShort) {
      sentences.push(
        tx(language, {
          en: "Balls are short, so only one ball is in play.",
          hi: "गेंदें कम हैं, इसलिए एक समय में एक ही गेंद खेले।",
        }),
      );
    }
    organization = sentences.join(" ");
  }

  const detail = organization;
  if (hittingSlots === 0 && stations.length > 1) {
    organization = tx(language, {
      en: "No rackets today. Change stations when the coach calls.",
      hi: "आज रैकेट नहीं हैं। कोच बुलाए तो स्टेशन बदलो।",
    });
  } else if (hittingSlots === 0) {
    organization = tx(language, {
      en: "No rackets today. The group works together in front of the coach.",
      hi: "आज रैकेट नहीं हैं। समूह कोच के सामने एक साथ काम करेगा।",
    });
  } else if (needsRotation && rotateEveryMinutes !== null) {
    organization = tx(language, {
      en: `${hittingSlots} players on the racket station at a time. Rotate every ${rotateEveryMinutes} minutes. Other stations do not use a racket.`,
      hi: `रैकेट स्टेशन पर एक समय में ${hittingSlots} खिलाड़ी। हर ${rotateEveryMinutes} मिनट में बारी बदलो। बाकी स्टेशन बिना रैकेट के।`,
    });
  } else {
    organization = tx(language, {
      en: `Every player on court can hold a racket. ${hittingSlots} hit at a time.`,
      hi: `कोर्ट पर हर खिलाड़ी रैकेट पकड़ सकता है। एक समय में ${hittingSlots} मारें।`,
    });
  }

  const summary = tx(language, {
    en: `${tx(language, courtLabel[input.court])} for ${input.groupSize} players, ages ${input.ageMin}–${input.ageMax}, ${tx(language, levelLabel[input.level])}. Kit on the ground: ${input.rackets} rackets, ${input.balls} balls, ${input.cones} cones. ${detail}`,
    hi: `${tx(language, courtLabel[input.court])} पर ${input.groupSize} खिलाड़ी, उम्र ${input.ageMin}–${input.ageMax}, स्तर ${tx(language, levelLabel[input.level])}। किट: ${input.rackets} रैकेट, ${input.balls} गेंदें, ${input.cones} कोन। ${detail}`,
  });

  return { summary, organization };
}

export function checkKit(input: SessionInput): KitPlan {
  const capacity = courtCapacity(input.court);
  const hittingSlots = Math.min(input.rackets, capacity, input.groupSize);
  const ballsForHitting =
    hittingSlots === 0
      ? 0
      : Math.min(input.balls, Math.ceil(hittingSlots / 2));
  const spareBalls = input.balls - ballsForHitting;
  const waiting = input.groupSize - hittingSlots;
  const ballsShort = hittingSlots > 0 && input.balls < Math.ceil(hittingSlots / 2);
  const waitingStations = assignWaiting(
    waiting,
    spareBalls,
    waiting > 0 ? input.cones : 0,
    input.language,
  );
  const racketCones = waiting > 0 ? 0 : input.cones;

  const stations: Station[] = [];
  if (hittingSlots > 0) {
    stations.push({
      kind: "rackets",
      name: stationName("rackets", 1, 1, input.language),
      players: hittingSlots,
      rackets: hittingSlots,
      balls: ballsForHitting,
      cones: racketCones,
      detail: racketDetail(input, ballsForHitting, racketCones, ballsShort),
    });
  }
  stations.push(...waitingStations);

  const drillCount = drillCountFor(input.minutes);
  const parts = allocateMinutes(input.minutes, drillCount);
  const drillMinutes = parts
    .slice(1, 1 + drillCount)
    .reduce((total, minutes) => total + minutes, 0);
  const needsRotation = hittingSlots > 0 && input.groupSize > hittingSlots;
  const rotationGroups = needsRotation
    ? Math.ceil(input.groupSize / hittingSlots)
    : Math.max(1, stations.length);
  const rotateEveryMinutes = needsRotation
    ? Math.max(3, Math.round(drillMinutes / rotationGroups))
    : null;

  const copy = writeCopy(
    input,
    hittingSlots,
    stations,
    rotateEveryMinutes,
    rotationGroups,
    drillMinutes,
    ballsShort,
  );

  return {
    courtCapacity: capacity,
    hittingSlots,
    rotationGroups,
    rotateEveryMinutes,
    needsRotation,
    racketsShort: input.rackets < input.groupSize,
    spaceShort: input.groupSize > capacity,
    ballsShort,
    movementOnly: hittingSlots === 0,
    spareRackets: Math.max(0, input.rackets - hittingSlots),
    stations,
    summary: copy.summary,
    organization: copy.organization,
  };
}

const ownRacketPattern =
  /each (child|player|kid) has (their |a )?own racket|one racket (each|per (player|child))/i;
const ownRacketHindi = /हर (बच्चे|खिलाड़ी) के पास अपना रैकेट/;

export function scrubOwnRacket(text: string, input: SessionInput): string {
  if (input.rackets >= input.groupSize) return text;
  return text
    .replace(
      /each (child|player|kid) has (their |a )?own racket/gi,
      "players share the rackets by rotating stations",
    )
    .replace(
      /one racket (each|per (player|child))/gi,
      "rackets shared by rotating stations",
    )
    .replace(/हर (बच्चे|खिलाड़ी) के पास अपना रैकेट/g, "रैकेट बारी से चलेंगे");
}

export function organizationViolates(
  text: string,
  input: SessionInput,
  kit: KitPlan,
): boolean {
  if (input.rackets < input.groupSize && (ownRacketPattern.test(text) || ownRacketHindi.test(text))) {
    return true;
  }
  if (kit.needsRotation) {
    const hasRotation =
      input.language === "hi"
        ? /बारी/.test(text) && /स्टेशन/.test(text)
        : /rotat/i.test(text) && /station/i.test(text);
    if (!hasRotation) return true;
  }
  if (kit.hittingSlots === 0) {
    const namesNoRackets =
      input.language === "hi" ? /रैकेट नहीं/.test(text) : /no rackets/i.test(text);
    if (!namesNoRackets) return true;
  }
  if (kit.hittingSlots === 0 && kit.stations.length > 1) {
    const namesStations =
      input.language === "hi" ? /स्टेशन/.test(text) : /station/i.test(text);
    if (!namesStations) return true;
  }
  return false;
}

export function enforceKit(
  blocks: PlanBlock[],
  input: SessionInput,
  kit: KitPlan,
): { blocks: PlanBlock[]; adjustments: PlanChange[] } {
  const adjustments: PlanChange[] = [];
  const next = blocks.map((block) => {
    const setup = scrubOwnRacket(block.setup, input);
    const coachingCues = block.coachingCues.map((cue) => scrubOwnRacket(cue, input));
    let organization = scrubOwnRacket(block.organization, input);
    if (
      organizationViolates(block.organization, input, kit) ||
      organizationViolates(organization, input, kit) ||
      organization.trim() === ""
    ) {
      organization = kit.organization;
    }
    const changed =
      setup !== block.setup ||
      organization !== block.organization ||
      coachingCues.some((cue, index) => cue !== block.coachingCues[index]);
    if (changed) {
      adjustments.push({
        code: "kit-rotation",
        blockTitle: block.title,
        action: "rewrote",
        detail: tx(input.language, {
          en: "Rewrote this block so players share the rackets by rotating stations.",
          hi: "इस ब्लॉक को बदला, ताकि रैकेट स्टेशनों की बारी से चलें।",
        }),
      });
    }
    return { ...block, setup, organization, coachingCues };
  });
  return { blocks: next, adjustments };
}

export type Assessment = {
  ok: boolean;
  reasons: string[];
};

function sumBy(stations: Station[], pick: (station: Station) => number): number {
  return stations.reduce((total, station) => total + pick(station), 0);
}

export function assessKitFit(
  plan: { blocks: PlanBlock[]; kit: KitPlan },
  input: SessionInput,
): Assessment {
  const reasons: string[] = [];
  const kit = plan.kit;
  const expectedSlots = Math.min(
    input.rackets,
    courtCapacity(input.court),
    input.groupSize,
  );
  if (kit.hittingSlots !== expectedSlots) {
    reasons.push(
      `Hitting slots are ${kit.hittingSlots}; the kit and court allow ${expectedSlots}.`,
    );
  }
  if (sumBy(kit.stations, (station) => station.players) !== input.groupSize) {
    reasons.push("Station player counts do not add up to the group size.");
  }
  const rackets = sumBy(kit.stations, (station) => station.rackets);
  const balls = sumBy(kit.stations, (station) => station.balls);
  const cones = sumBy(kit.stations, (station) => station.cones);
  if (rackets > input.rackets) reasons.push("The stations use more rackets than the kit has.");
  if (balls > input.balls) reasons.push("The stations use more balls than the kit has.");
  if (cones > input.cones) reasons.push("The stations use more cones than the kit has.");
  if (rackets !== kit.hittingSlots) {
    reasons.push("Rackets handed out do not match the hitting slots.");
  }
  for (const station of kit.stations) {
    if (station.players < 1) reasons.push(`${station.name} has no players.`);
    if (station.rackets > station.players) {
      reasons.push(`${station.name} has more rackets than players.`);
    }
    if (station.kind !== "rackets" && station.rackets > 0) {
      reasons.push(`${station.name} hands out rackets away from the racket station.`);
    }
  }
  if (kit.movementOnly && rackets !== 0) {
    reasons.push("A no-racket session still hands out rackets.");
  }

  const text = [
    plan.kit.summary,
    plan.kit.organization,
    ...plan.kit.stations.flatMap((station) => [station.name, station.detail]),
    ...plan.blocks.map((block) => `${block.title}\n${block.setup}\n${block.organization}`),
  ].join("\n");
  if (
    input.rackets < input.groupSize &&
    (ownRacketPattern.test(text) || ownRacketHindi.test(text))
  ) {
    reasons.push("The plan says every player has their own racket.");
  }
  if (kit.needsRotation) {
    const hasRotation =
      input.language === "hi"
        ? /बारी/.test(text) && /स्टेशन/.test(text)
        : /rotat/i.test(text) && /station/i.test(text);
    if (!hasRotation) reasons.push("The plan does not rotate stations.");
  }
  if (kit.hittingSlots === 0) {
    const namesNoRackets =
      input.language === "hi" ? /रैकेट नहीं/.test(text) : /no rackets/i.test(text);
    if (!namesNoRackets) reasons.push("The plan does not say there are no rackets.");
    if (/bounce-hit|बाउंस-हिट/i.test(text)) {
      reasons.push("The plan asks players to bounce-hit without a racket.");
    }
  }
  return { ok: reasons.length === 0, reasons };
}

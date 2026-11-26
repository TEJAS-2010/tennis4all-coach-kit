export type Language = "en" | "hi";

export type Level = "beginner" | "developing" | "intermediate";

export type Court = "full" | "half" | "wall";

export type Minutes = 30 | 45 | 60 | 90;

export type SessionInput = {
  groupSize: number;
  ageMin: number;
  ageMax: number;
  level: Level;
  rackets: number;
  balls: number;
  cones: number;
  court: Court;
  minutes: Minutes;
  language: Language;
};

export type Copy = {
  en: string;
  hi: string;
};

export type StationKind = "rackets" | "ball-skills" | "movement" | "shadow";

export type Station = {
  kind: StationKind;
  name: string;
  players: number;
  rackets: number;
  balls: number;
  cones: number;
  detail: string;
};

export type KitPlan = {
  courtCapacity: number;
  hittingSlots: number;
  rotationGroups: number;
  rotateEveryMinutes: number | null;
  needsRotation: boolean;
  racketsShort: boolean;
  spaceShort: boolean;
  ballsShort: boolean;
  movementOnly: boolean;
  spareRackets: number;
  stations: Station[];
  summary: string;
  organization: string;
};

export type BlockKind = "warmup" | "drill" | "game" | "cooldown";

export type PlanBlock = {
  kind: BlockKind;
  title: string;
  minutes: number;
  setup: string;
  organization: string;
  coachingCues: string[];
  safetyNotes: string[];
};

export type PlanChange = {
  code: string;
  blockTitle: string;
  action: "rewrote" | "appended" | "retimed" | "flagged";
  detail: string;
};

export type SafetyBriefItem = {
  id: "intensity" | "spacing" | "hydration" | "overhead";
  label: string;
  detail: string;
};

export type PlanSource = "ai-gateway" | "offline";

export type SessionPlan = {
  title: string;
  summary: string;
  language: Language;
  source: PlanSource;
  sourceNote: string;
  model: string | null;
  blocks: PlanBlock[];
  kit: KitPlan;
  kitAdjustments: PlanChange[];
  safetyChanges: PlanChange[];
  safetyPassed: boolean;
  safetyBrief: SafetyBriefItem[];
};

export type PlanDraft = {
  title: string;
  summary: string;
  blocks: PlanBlock[];
};

export function tx(language: Language, copy: Copy): string {
  return copy[language];
}

export function devanagariCount(text: string): number {
  const matches = text.match(/[\u0900-\u097F]/g);
  return matches ? matches.length : 0;
}

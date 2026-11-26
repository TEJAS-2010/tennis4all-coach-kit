import type { SessionInput } from "@/lib/types";

export type Preset = {
  id: string;
  label: string;
  description: string;
  input: SessionInput;
};

export const presets: Preset[] = [
  {
    id: "delhi",
    label: "20 kids, 6 rackets",
    description: "One full court. The kit does not go around.",
    input: {
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
    },
  },
  {
    id: "young-hindi",
    label: "Young group in Hindi",
    description: "Under-8s, a wall or open ground, four rackets.",
    input: {
      groupSize: 10,
      ageMin: 5,
      ageMax: 7,
      level: "beginner",
      rackets: 4,
      balls: 8,
      cones: 6,
      court: "wall",
      minutes: 45,
      language: "hi",
    },
  },
  {
    id: "scarce-balls",
    label: "One ball on a full court",
    description: "Enough rackets, almost no balls.",
    input: {
      groupSize: 8,
      ageMin: 10,
      ageMax: 12,
      level: "beginner",
      rackets: 8,
      balls: 1,
      cones: 0,
      court: "full",
      minutes: 60,
      language: "en",
    },
  },
];

export const defaultInput: SessionInput = presets[0].input;

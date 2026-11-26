import { z } from "zod";

import type { PlanBlock, PlanDraft, SessionInput } from "@/lib/types";

export const sessionInputSchema = z
  .object({
    groupSize: z.number().int().min(1, "Group size has to be at least 1.").max(40, "Group size cannot be more than 40."),
    ageMin: z.number().int().min(4, "Age has to be from 4 to 18.").max(18, "Age has to be from 4 to 18."),
    ageMax: z.number().int().min(4, "Age has to be from 4 to 18.").max(18, "Age has to be from 4 to 18."),
    level: z.enum(["beginner", "developing", "intermediate"]),
    rackets: z.number().int().min(0, "Rackets cannot be negative.").max(60, "Rackets cannot be more than 60."),
    balls: z.number().int().min(0, "Balls cannot be negative.").max(80, "Balls cannot be more than 80."),
    cones: z.number().int().min(0, "Cones cannot be negative.").max(40, "Cones cannot be more than 40."),
    court: z.enum(["full", "half", "wall"]),
    minutes: z.union([
      z.literal(30),
      z.literal(45),
      z.literal(60),
      z.literal(90),
    ]),
    language: z.enum(["en", "hi"]),
  })
  .refine((value) => value.ageMin <= value.ageMax, {
    message: "The youngest age has to be at or below the oldest age.",
    path: ["ageMin"],
  });

export const planBlockSchema = z.object({
  kind: z.enum(["warmup", "drill", "game", "cooldown"]),
  title: z.string().min(2).max(80),
  minutes: z.number().int().min(1).max(40),
  setup: z.string().min(5).max(700),
  organization: z.string().min(5).max(700),
  coachingCues: z.array(z.string().min(2).max(220)).min(2).max(5),
  safetyNotes: z.array(z.string().min(2).max(280)).min(1).max(6),
});

export const planDraftSchema = z.object({
  title: z.string().min(3).max(140),
  summary: z.string().min(10).max(900),
  blocks: z.array(planBlockSchema).min(5).max(8),
});

export function parseSessionInput(value: unknown): SessionInput {
  return sessionInputSchema.parse(value);
}

export function shapeDraft(draft: PlanDraft): PlanDraft | null {
  const warmup = draft.blocks.filter((block) => block.kind === "warmup");
  const drills = draft.blocks.filter((block) => block.kind === "drill");
  const games = draft.blocks.filter((block) => block.kind === "game");
  const cooldowns = draft.blocks.filter((block) => block.kind === "cooldown");
  if (warmup.length !== 1 || games.length !== 1 || cooldowns.length !== 1) {
    return null;
  }
  if (drills.length < 3 || drills.length > 4) {
    return null;
  }
  const blocks: PlanBlock[] = [
    warmup[0],
    ...drills,
    games[0],
    cooldowns[0],
  ];
  return {
    title: draft.title.trim(),
    summary: draft.summary.trim(),
    blocks,
  };
}

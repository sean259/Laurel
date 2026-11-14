import { z } from "zod";

export const createTournamentSchema = z.object({
  name: z.string().trim().min(1).max(100),
  game: z.string().trim().max(100).optional(),
  format: z.enum(["SINGLE_ELIMINATION", "ROUND_ROBIN"]),
  participants: z
    .array(z.string().trim().min(1).max(60))
    .min(2, "Need at least 2 participants")
    .max(256),
});

export const reportScoreSchema = z
  .object({
    score1: z.number().int().min(0),
    score2: z.number().int().min(0),
  })
  .refine((s) => s.score1 !== s.score2, { message: "Ties are not supported yet" });

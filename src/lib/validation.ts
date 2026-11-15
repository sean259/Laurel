import { z } from "zod";

const name = z.string().trim().min(1, "Name is required").max(100);
const format = z.enum(["SINGLE_ELIMINATION", "DOUBLE_ELIMINATION", "ROUND_ROBIN", "SWISS"]);
const participants = z
  .array(z.string().trim().min(1).max(60))
  .min(2, "Need at least 2 participants")
  .max(256, "Maximum is 256 participants");

export const createTournamentSchema = z.object({
  name,
  game: z.string().trim().max(100).optional(),
  format,
  participants,
});

/**
 * Edit a tournament. Every field is optional. Format and participant changes are only
 * allowed in DRAFT, except renaming participants (same count, same order) at any time.
 */
export const updateTournamentSchema = z.object({
  name: name.optional(),
  game: z.string().trim().max(100).nullable().optional(), // "" or null clears it
  format: format.optional(),
  participants: participants.optional(),
});

export const reportScoreSchema = z
  .object({
    score1: z.number().int().min(0),
    score2: z.number().int().min(0),
  })
  .refine((s) => s.score1 !== s.score2, { message: "Ties are not supported yet" });

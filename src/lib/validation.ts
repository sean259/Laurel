import { z } from "zod";

const name = z.string().trim().min(1, "Name is required").max(100);
const format = z.enum(["SINGLE_ELIMINATION", "DOUBLE_ELIMINATION", "ROUND_ROBIN", "SWISS"]);
const playerName = z.string().trim().min(1, "Enter a name").max(60, "Names can be up to 60 characters");
export const MAX_ENTRIES = 256;
const participants = z.array(playerName).max(MAX_ENTRIES, `Maximum is ${MAX_ENTRIES} players`);
export const MAX_TEAM_SIZE = 10;
const teamSize = z.number().int().min(1).max(MAX_TEAM_SIZE);

/** Fewest players a tournament can start with: 2 entries, or enough players for 2 teams. */
export const minPlayers = (size: number) => (size > 1 ? size * 2 : 2);

export const createTournamentSchema = z
  .object({
    name,
    game: z.string().trim().max(100).optional(),
    format,
    teamSize: teamSize.default(1),
    registrationOpen: z.boolean().default(false),
    // Solo: the bracket entries in seed order. Teams: the pool of players to mix.
    participants,
  })
  .refine((t) => t.registrationOpen || t.participants.length >= minPlayers(t.teamSize), {
    message: "Add more players, or let players sign up with a link",
  });

/**
 * Edit a tournament. Every field is optional. Format, team size and player changes are only
 * allowed in DRAFT, except renaming participants (same count, same order) at any time.
 */
export const updateTournamentSchema = z.object({
  name: name.optional(),
  game: z.string().trim().max(100).nullable().optional(), // "" or null clears it
  format: format.optional(),
  teamSize: teamSize.optional(),
  registrationOpen: z.boolean().optional(),
  participants: participants.optional(),
});

export const joinSchema = z.object({ name: playerName });

export const reportScoreSchema = z
  .object({
    score1: z.number().int().min(0),
    score2: z.number().int().min(0),
  })
  .refine((s) => s.score1 !== s.score2, { message: "Ties are not supported yet" });

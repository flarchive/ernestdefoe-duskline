import app from 'flarum/forum/app';
import type User from 'flarum/common/models/User';

/*
 * Renown's numbers, read from attributes Renown already sends. The curve is
 * Renown's own (common/curve.ts there): reaching level L takes
 * 30·(L−1)^1.75 XP in total, rounded to tens; five levels make a rank.
 */
export const MAX_LEVEL = 100;
export const RANKS = 20;
export const LEVELS_PER_RANK = 5;

const xpFor = (level: number): number => (level <= 1 ? 0 : Math.round((30 * Math.pow(Math.min(level, MAX_LEVEL) - 1, 1.75)) / 10) * 10);

export const rankOf = (level: number): number => Math.floor((Math.max(1, level) - 1) / LEVELS_PER_RANK) + 1;

/** The first level of a rank. */
export const rankStart = (rank: number): number => (rank - 1) * LEVELS_PER_RANK + 1;

export type Standing = { level: number; rank: number; into: number; step: number; pct: number; prestige: number };

/** A member's place in Renown, or null when Renown is off or the member has none. */
export function standing(user: User | null | undefined | false): Standing | null {
  if (!('ernestdefoe-renown' in flarum.extensions) || !user) return null;
  const level = user.attribute<number | undefined>('renownLevel');
  if (typeof level !== 'number') return null;

  const xp = user.attribute<number>('renownXp') || 0;
  const from = xpFor(level);
  const step = level >= MAX_LEVEL ? 0 : xpFor(level + 1) - from;
  const into = Math.max(0, xp - from);

  return {
    level,
    rank: rankOf(level),
    into,
    step,
    pct: step ? Math.min(100, Math.round((into / step) * 100)) : 100,
    prestige: user.attribute<number>('renownPrestige') || 0,
  };
}

/** The admin's name for a rank, else Renown's language pack. */
export const rankName = (rank: number): string =>
  app.forum.attribute<{ ranks?: { name?: string }[] }>('renown')?.ranks?.[rank - 1]?.name ||
  String(app.translator.trans(`ernestdefoe-renown.lib.ranks.${rank}`, {}, true));

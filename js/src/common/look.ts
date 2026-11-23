/*
 * The fixed lists the theme offers, shared by the forum and the admin page.
 * They match src/Look.php, which cleans every stored value against them.
 */
export const SCENES = ['dawn', 'day', 'golden', 'sunset', 'night'] as const;

export type Scene = (typeof SCENES)[number];

export const ACCENTS = ['coral', 'magenta', 'teal', 'amber', 'ice'] as const;

export type Accent = (typeof ACCENTS)[number];

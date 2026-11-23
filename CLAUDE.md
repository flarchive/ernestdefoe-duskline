# Duskline (ernestdefoe/duskline)

Free MIT gaming theme for Flarum 2. Its centerpiece is an original illustrated hero: a neon coastal skyline whose sky follows each visitor's local time.

- **Scope + build order:** ~/github/scopes/gaming-theme/SCOPE.md ("As built" lists what changed from the scope). **Mockup:** https://claude.ai/artifact/Hb3MdwgE6gqg79R3uu2J5E
- **Local forum:** https://duskdev.test (~/Herd/duskdev, MySQL db duskdev, prefix sky_, admin password in ~/Herd/duskdev-admin.txt). Path repo symlinked; after `npm run build` → `php flarum cache:clear` there.
- **Shots/checks:** ~/github/scopes/gaming-theme/build (`node shots.mjs [filter] [--sky=night]`, `flow.mjs` paint shop + admin, `motion.mjs` reduced motion, `probe.mjs <path> "<js>"`).
- **Tests:** `DB_DRIVER=mysql DB_HOST=127.0.0.1 DB_DATABASE=duskline_test DB_USERNAME=root DB_PASSWORD= DB_PREFIX=dl_ composer test:setup` once, then `vendor/bin/phpunit -c tests/phpunit.integration.xml` (set the same env: without DB_DRIVER it silently runs SQLite).
- **Guard rails:** no GTA/Rockstar names, logos, Pricedown-style font, characters, map shapes, place names or recognisable art, anywhere. The art is our own SVG (js/src/common/sky.ts).
- **Every change goes to the Command Center before release.** Ernest tests on dev first; ship-check + pre-floxum before 1.0. Commits `feat:`/`fix:` to main.

## How it hangs together
- Rules hang off `html[data-duskline]`, stamped by Content\Stamp only when ActiveTheme says yes (Wardrobe picks it, or no Bespoke). The scene is `data-dusk-sky` (never `data-sky`: Skylight owns it). Stamp's head script picks the scene from the visitor's clock before paint; its boundaries must match `sceneAt()` in js/src/common/sky.ts (unit test checks the string).
- Paint shop choices live in localStorage `duskline` (device); the profile sky is the user preference `duskSky`, exposed as the user field `duskSky`.
- Radar: Radar::now() caches one answer for 60 s; the forum field strips faces unless the actor can `searchUsers`.
- Renown is read from attributes it already sends (`renownLevel`, `renownXp`, `renownPrestige`, forum `renown`); the curve in util.ts mirrors Renown's common/curve.ts. Renown's own post badge, card info and profile tab are restyled, never duplicated.

## Traps hit
- 🚨 `app.forum` is NOT loaded while initializers run: never gate an initializer on a forum attribute. Hooks read cfg() when they render; one-time work (clock, phone bar) starts in Page.oninit.
- Flarum 2's profile card is `UserCard` with className `Hero UserHero` (not `UserCard--profile`).
- On phones core hides the side avatar and renders a second one in the post header: XP vars go on the article (elementAttrs) so both get the ring; the pill is desktop-only.
- The avatar editor (own profile/admins) is taller than the avatar: the profile pill is a counter on `.UserCard-avatar`/`.AvatarEditor`, not on the wrapper.
- The Tags page renders IndexSidebar items as a row: the radar is limited to the index/tag routes.
- Users have no server-side color: the radar colours dots with core's stringToColor(username).

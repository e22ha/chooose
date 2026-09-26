# Kiss/Marry/Kill photo game — design spec

Date: 2026-09-26

## Purpose

A static GitHub Pages site that shows three random photos ("a triple")
at a time from a pool of uploaded people-photos, for playing
Kiss/Marry/Kill and similar party games during a stream or a call.
People discuss and decide out loud; the site's only job is drawing
fair, non-repeating triples and optionally labeling the choices.

Non-goals: no accounts, no backend, no persisted results, no
multiplayer sync. A "session" lives entirely in one browser tab and
resets on reload.

## Repo layout

```
/photos/                        photo files (jpg/png/webp), user-managed
/manifest.json                  generated: [{ "file": "...", "name": "..." }]
/index.html
/style.css
/app.js
/.github/workflows/build-manifest.yml
README.md
```

GitHub Pages serves directly from `main` branch root — no build step
for the game itself.

## Photo pipeline

- User drops image files into `/photos/` and pushes (or edits via the
  GitHub web UI).
- A GitHub Action (`build-manifest.yml`) triggers on push to
  `photos/**` and via `workflow_dispatch`. It:
  1. Lists files in `photos/` (jpg, jpeg, png, webp, gif — case
     insensitive).
  2. For each file, derives a display name: strip the extension,
     replace `_` and `-` with spaces, collapse repeated whitespace,
     trim. Casing is left exactly as typed in the filename — no
     forced title-casing.
  3. Writes the sorted (by filename) array to `manifest.json` at repo
     root as `[{ "file": "name.jpg", "name": "Display Name" }, ...]`.
  4. Commits and pushes `manifest.json` if it changed, using a bot
     identity (`github-actions[bot]`) and `permissions: contents:
     write`.
- No manual manifest editing is expected; the file is
  machine-generated and should not be hand-edited (a header comment in
  the workflow notes this — JSON itself carries no comment, so the
  README documents it instead).

## Game mechanics

### Deck-based draw (no repeats)

- On load, fetch `manifest.json` into an in-memory pool.
- Shuffle the pool with Fisher–Yates once at session start (and
  whenever it needs reshuffling).
- Maintain a cursor into the shuffled array. "Next triple" takes the
  next 3 entries and advances the cursor by 3.
- When fewer than 3 entries remain before the next draw, reshuffle the
  *entire* pool fresh and reset the cursor to 0 before drawing (so a
  leftover partial group of 1–2 is folded back in rather than shown
  short-handed). This means a person can repeat across reshuffle
  boundaries but never within one full pass of the deck.
- Fewer than 3 photos total in the pool: show a message ("need at
  least 3 photos") instead of attempting a draw.
- Empty manifest: show "add photos to /photos and push" message.

### Label modes (chosen once per session, on a start screen)

Three mutually exclusive modes:

1. **Preset** — a dropdown of built-in triples: `Kiss / Marry / Kill`,
   `Smash / Marry / Pass`, `Date / Friendzone / Ghost`, `Hire / Fire /
   Promote`. Selecting one locks in those 3 label strings for the
   whole session.
2. **Custom** — three free-text inputs for the player's own labels.
   All 3 must be non-empty to start.
3. **No labels** — no label UI at all; only photos + names + "next
   triple" are shown, room decides its own rules verbally.

The chosen mode is stored in memory only (a JS variable), not
persisted across reloads — reloading returns to the start screen.

### Round screen

- Three photo cards in a row, each with the photo and its name
  underneath.
- Broken/missing image (`onerror`): swap to a neutral placeholder box
  but keep showing the name — a bad file never blocks the round.
- If a label mode other than "no labels" is active: the 3 label
  strings render as clickable chips above the cards. Clicking a chip
  arms it; clicking a photo card while a chip is armed pins that label
  under the card's name and disables the chip (each label can be
  used once per triple, matching the game's "one of each" rule).
  Clicking an already-pinned card's label again un-pins it and
  re-enables the chip.
- "Next triple" always draws fresh cards and clears any pinned labels
  from the previous round — nothing is remembered between triples or
  across a reload.
- A small "change mode" link returns to the start screen (loses the
  current pin state, which is fine since nothing is saved).

## Error handling

- `manifest.json` fetch failure (e.g. opened via `file://` without a
  local server) → visible error message telling the user to serve the
  page over http(s) instead of opening the file directly.
- Any image `onerror` → placeholder box, round continues normally.
- Pool `< 3` after filtering unreadable manifest entries → same
  "need at least 3 photos" message as the empty-pool case.

## Testing plan

- Local manual testing: serve the directory with
  `python3 -m http.server`, open `index.html`, and verify:
  - manifest loads and deck draws distinct triples with no repeats
    until exhaustion, then reshuffles
  - all three label modes work (preset, custom, no-labels) and reset
    correctly between triples
  - broken image path falls back to a placeholder without breaking
    the round
  - fewer-than-3-photos and empty-manifest messages appear correctly
- After pushing to GitHub: add 1–2 test photos to `photos/`, push, and
  confirm the Action runs and commits an updated `manifest.json`, and
  that Pages serves the updated site.

There is no automated test suite — this is a small static page with
no backend logic beyond client-side JS, so manual verification via the
steps above is the acceptance check.

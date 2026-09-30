# Authored Content Plan

The packager handles restrained portrait text diagrams. It does not search for visuals, write drafts, call a model or record video. For image-heavy projects, follow the live parser contract directly instead of using this helper as a shortcut.

Shared JSON fields:

- `mode`: `talkinghead` or `whiteboard`.
- `title`, `audience`, `corePoint`, `coverTitle` (explicit newline for two lines), `coverSubtitle`.
- `productMention`: `none` or `natural-example`. This marks whether the script intentionally discusses OneTake; it does not override the application's subscription watermark rules.
- `creatorName` (optional): public creator attribution used on the whiteboard cover and as the talking-head watermark text. Defaults to `OneTake`; use only a name the creator has supplied.
- `publication`: `description` and exactly four distinct `keywords`.
- `sourceNotes`: list of inspected sources, example/claim boundaries and remaining checks.
- `review`: list of actual operator/creator decisions, not claims of proven retention.

Talking-head `segments` (1–12): `id`, `role`, `text`, `seconds` (5–300), optional `quote`, optional `emphasis` (substring of quote), `shot`, optional `verification` (`opinion` by default; `pending`, `own-work`, `source-checked` only when appropriate). Quotes start at segment boundaries to support the current mobile importer. No quote on a segment is valid. The helper does not fabricate English scripts. Mobile packaging uses only actual Chinese script and blank English fields as supported by the current importer.

Whiteboard `pages`: `id`, `name`, `camera` (`camera-full`, `board-pip`, `split`), `text`, `seconds`, `shot`, optional `board`:

- `kicker`, `headline` with explicit newlines, optional `footer`.
- `diagram`: `flow` (vertical steps with arrows), `compare` (two columns), or `branches` (one parent feeding 2–3 children).
- `items`: short text labels, with explicit newlines as needed; for `branches`, also supply `parent`.

The helper adds an editable first-page cover and starts manual recording on `intro`. Auto-follow is opt-in; estimated seconds never mean an instruction to end the recording. In split scenes the helper reserves only the top half for board content. Its preview uses synthetic camera placeholders, never camera access, and is not proof of compositor behavior. Final cover/publication settings in the app still need confirmation; talking-head cover wording and whiteboard publication copy are sidecars because those fields are not both supported by the current project parsers.

Run from this standalone Skill directory:

```sh
node scripts/build-project.cjs content-plan.json output-directory
```

Run standalone structure validation, adding `--mobile` only to talking-head outputs. This is not a substitute for testing the current OneTake importer:

```sh
node scripts/validate-project.cjs /absolute/project.onetake.json --production
```

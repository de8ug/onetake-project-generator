# Authored Content Plan

The packager handles restrained portrait text diagrams and reviewed local source images. It does not search for visuals, write drafts, call a model or record video. For image-heavy projects, follow the live parser contract directly instead of using this helper as a shortcut.

Shared JSON fields:

- `mode`: `talkinghead` or `whiteboard`.
- `title`, `audience`, `corePoint`, `coverTitle` (explicit newline for two lines), `coverSubtitle`.
- `productMention`: `none` or `natural-example`. This marks whether the script intentionally discusses OneTake; it does not override the application's subscription watermark rules.
- `creatorName` (optional): public creator attribution used on the whiteboard cover and as the talking-head watermark text. Defaults to `OneTake`; use only a name the creator has supplied.
- `publication`: `description` and exactly four distinct `keywords`.
- `sourceNotes`: list of inspected sources, example/claim boundaries and remaining checks.
- `review`: list of actual operator/creator decisions, not claims of proven retention.

Talking-head `segments` (1–12): `id`, `role`, `text`, `seconds` (5–300), optional `quote`, optional `emphasis` (substring of quote), `shot`, optional `sourceImage`, optional `verification` (`opinion` by default; `pending`, `own-work`, `source-checked` only when appropriate). Optional `cueAtProgress` (0–1, default 0) and `cueDurationSeconds` (>0 through 60) control the single cue. Mobile maps progress to estimated seconds. No quote on a segment is valid. The helper does not fabricate English scripts. Mobile packaging uses only actual Chinese script and blank English fields as supported by the current importer.

Whiteboard `pages`: `id`, `name`, `camera` (`camera-full`, `board-pip`, `split`), `text`, `seconds`, `shot`, optional `board`:

- `kicker`, `headline` with explicit newlines, optional `footer`.
- `diagram`: `flow` (vertical steps with arrows), `compare` (two columns), or `branches` (one parent feeding 2–3 children).
- `items`: short text labels, with explicit newlines as needed; for `branches`, also supply `parent`.

For a single reviewed source image, a page can use `sourceImage` instead of `board` with `camera: "board-pip"`. The packager adds an editable title and attribution around the embedded image. On a talking-head segment, `sourceImage` becomes a brief B-roll cue; do not place a quote and image on the same segment. In either mode the value is `{ "file": "assets/source.png", "credit": "Original publisher", "sourceUrl": "https://example.com/original" }`; whiteboard images also need `width` and `height` in pixels. Accepted formats: PNG, JPEG, WebP under 3.5 MB. Only use files within the plan's `assets/` directory. Keep the original URL and any rights caveat in `sourceNotes`; embedding in a draft does not grant publication rights. If the source has no useful image, capture only its title and necessary text as a screenshot, after checking for private information.

The first authored whiteboard page must have `id: "intro"`. The helper adds a separate editable 1.5-second first-page cover and starts manual recording on `intro`. Spoken-duration estimates exclude that cover; manual recording does not automatically include it. Auto-follow is opt-in; estimated seconds never mean an instruction to end the recording. In split scenes the helper reserves only the top half for board content. Its preview uses synthetic camera placeholders, never camera access, and is not proof of compositor behavior. Final cover/publication settings in the app still need confirmation; talking-head cover wording and whiteboard publication copy are sidecars because those fields are not both supported by the current project parsers.

Run from this standalone Skill directory:

```sh
node scripts/build-project.cjs content-plan.json output-directory
```

Run standalone structure validation, adding `--mobile` only to talking-head outputs. This is not a substitute for testing the current OneTake importer:

```sh
node scripts/validate-project.cjs /absolute/project.onetake.json --production
```

Optional talking-head segment fields: `promptNotes` (private, <=300), `chapterTitle` (viewer-facing, <=24), `captions` with mode `off`/`key`/`full` and up to 30 lines. Each line accepts `text` <=72, `emphasis` <=24, `translation` <=160, `translationEmphasis` <=48, `dwell` 0.5–2. Emphasis must be a substring of its corresponding language. Limits use UTF-16 units. Do not confuse bilingual caption translation with the spoken script. Optional plan `language` is `zh` (default) or `en`; the packager fills that active script slot. Put the spoken language in caption `text` and the other language in `translation`. Optional plan `prompterMode` is `full` or `outline` (full-script fallback). Publication description <=2000; exactly four nonempty distinct keywords, each <=40.

Existing talking-head v4 JSON can also be passed directly to the builder. It validates and copies the whole file byte-for-byte, preserving unknown settings, assets, bilingual scripts and optional fields; it produces only `project.onetake.json`, with no newly invented guide. Use a new output directory. To revise an export, edit a copy of the original, not a reconstruction from the simplified plan. App import/export may still discard unsupported fields; keep the source JSON. Whiteboard remains v2 web-only and uses its own narration, scenes and publication sidecar; talking-head captions do not imply whiteboard subtitle support.

See [compatibility](compatibility.md) for tested and unverified renderer boundaries.

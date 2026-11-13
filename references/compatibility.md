# Compatibility and evidence (2026-11-14)

The source checkout is the verification target, not a guarantee about the deployed website or an installed phone build.

| Field/workflow | Contract and boundary |
| --- | --- |
| Talking-head | `type: onetake-project`, version 4, `talkingHead.directorPlan.segments`, `brollAssets`, `script`, active language and publication remain intact. Mobile accepts desktop v2–v4, up to 12 segments and 40 assets. |
| Private prompts | `promptNotes` <=300. Current web/mobile accept them; prompter outline falls back to full text. Never video overlays. |
| Chapters | `chapterTitle` <=24. Current mobile import and iOS chapter composition support them. Do not assume equivalent web/Android rendering. |
| Captions | Current iOS 1.1.7 source supports authored bilingual caption preview and native composition. Android keeps legacy rendering; no web caption-render upgrade was verified. |
| Bilingual extension | The skill preserves `translation` <=160 and `translationEmphasis` <=48. The inspected mobile CaptionLine/parser preserves both fields; CaptionOverlay displays the translated line and RecordingComposition.swift composes it with separate emphasis. Older clients without these fields may drop them. Keep the original JSON. This skill check does not certify device installation or a newly recorded export. |
| Cue clock | Desktop `atProgress` in 0–1 becomes mobile `startSeconds = atProgress * estimatedSeconds`. Dwell is a caption weight, not seconds. Script timing is approximate, not transcription. |
| Whiteboard | v2 web scenes/files/director plan; manual page switching by default. Mobile whiteboard and talking-head caption equivalence are unsupported. Publication is a sidecar. |
| Preview | Packager HTML is a static storyboard; it does not simulate captions, chapters, exact cue timing or native video composition. |

No-key means local packaging plus the host agent's existing authoring session; it does not promise free model access or remove app entitlement limits. Final recording requires the creator's camera/microphone permissions, chosen audio, device testing and export review. No actual footage, paid calls, recording, export or public upload is part of generation.

Check the actual importer when available. Structure validation is deliberately stricter about generated emphasis and publication completeness than parsers that normalize malformed input. It does not certify all app settings. Source-preserving pass-through never removes unknown fields, but consumer applications may do so.

Source anchors: `mobile/src/domain/captions.ts`, `mobile/src/domain/talkingHeadProject.ts`, `mobile/src/components/CaptionOverlay.tsx`, `mobile/ios/OneTakeMobile/RecordingComposition.swift`; iOS project marketing version 1.1.7. Android/web bilingual rendering is not inferred from iOS support. The skill does not require source checkout for ordinary use.

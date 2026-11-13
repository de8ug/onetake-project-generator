const assert = require("node:assert/strict");
function bounded(value, max, name) {
  assert(typeof value === "string" && value.length <= max, `${name} must be a string <= ${max} UTF-16 units`);
}
function validateExtras(segment) {
  if (segment.promptNotes !== undefined) bounded(segment.promptNotes, 300, "promptNotes");
  if (segment.chapterTitle !== undefined) bounded(segment.chapterTitle, 24, "chapterTitle");
  if (segment.cueAtProgress !== undefined) assert(Number.isFinite(segment.cueAtProgress) && segment.cueAtProgress >= 0 && segment.cueAtProgress <= 1);
  if (segment.cueDurationSeconds !== undefined) assert(Number.isFinite(segment.cueDurationSeconds) && segment.cueDurationSeconds > 0 && segment.cueDurationSeconds <= 60);
  if (segment.captions === undefined) return;
  const c = segment.captions;
  assert(c && ["off", "key", "full"].includes(c.mode) && Array.isArray(c.lines) && c.lines.length <= 30, "Invalid captions mode/lines");
  for (const line of c.lines) {
    assert(line && typeof line === "object" && !Array.isArray(line));
    bounded(line.text, 72, "text");
    if (line.emphasis !== undefined) { bounded(line.emphasis, 24, "emphasis"); assert(line.text.includes(line.emphasis), "emphasis must occur in text"); }
    if (line.translation !== undefined) bounded(line.translation, 160, "translation");
    if (line.translationEmphasis !== undefined) { bounded(line.translationEmphasis, 48, "translationEmphasis"); assert(typeof line.translation === "string" && line.translation.includes(line.translationEmphasis), "translationEmphasis must occur in translation"); }
    if (line.dwell !== undefined) assert(Number.isFinite(line.dwell) && line.dwell >= 0.5 && line.dwell <= 2, "dwell must be 0.5..2");
  }
}
function validatePublication(pub) {
  assert(pub, "Missing publication"); bounded(pub.description, 2000, "description"); assert(pub.description.trim());
  assert(Array.isArray(pub.keywords) && pub.keywords.length === 4 && new Set(pub.keywords).size === 4, "Expected exactly four distinct keywords");
  for (const keyword of pub.keywords) { bounded(keyword, 40, "keyword"); assert(keyword.trim()); }
}
module.exports = { validateExtras, validatePublication };

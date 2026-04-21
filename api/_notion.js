const NOTION_VERSION = "2022-06-28";

const env = {
  token: process.env.NOTION_TOKEN,
  exerciseLibraryDb: process.env.NOTION_EXERCISE_LIBRARY_DB_ID,
  workoutSessionsDb: process.env.NOTION_WORKOUT_SESSIONS_DB_ID,
  workoutExercisesDb: process.env.NOTION_WORKOUT_EXERCISES_DB_ID,
  exerciseSetsDb: process.env.NOTION_EXERCISE_SETS_DB_ID,
  workoutTemplatesDb: process.env.NOTION_WORKOUT_TEMPLATES_DB_ID,
  templateExercisesDb: process.env.NOTION_TEMPLATE_EXERCISES_DB_ID,
  cycleLogsDb: process.env.NOTION_CYCLE_LOGS_DB_ID,
};

function missingEnv() {
  return ["token","exerciseLibraryDb","workoutSessionsDb","workoutExercisesDb","exerciseSetsDb"]
    .filter((key) => !env[key]);
}

async function notionRequest(path, options = {}) {
  if (!env.token) throw new Error("Missing NOTION_TOKEN");
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || `Notion request failed with ${response.status}`);
    error.status = response.status;
    error.details = result;
    throw error;
  }
  return result;
}

function textOrEmpty(value) { return value === null || value === undefined ? "" : String(value); }
function richText(value) {
  const content = textOrEmpty(value).slice(0, 1900);
  return content ? [{ type: "text", text: { content } }] : [];
}
function titleText(value) { return [{ type: "text", text: { content: textOrEmpty(value).slice(0,1900) || "Untitled" } }]; }
function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function checkbox(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return Boolean(value);
}
function splitMulti(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map((name) => ({ name: String(name).trim() })).filter((x) => x.name);
  return textOrEmpty(value).split(",").map((x) => x.trim()).filter(Boolean).map((name) => ({ name }));
}
function relation(id) { return id ? [{ id }] : []; }
function getTitle(page, propName) {
  return (page.properties?.[propName]?.title || []).map((p) => p.plain_text || p.text?.content || "").join("");
}
function getRichText(page, propName) {
  return (page.properties?.[propName]?.rich_text || []).map((p) => p.plain_text || p.text?.content || "").join("");
}
function getSelect(page, propName) { return page.properties?.[propName]?.select?.name || ""; }
function getMulti(page, propName) { return (page.properties?.[propName]?.multi_select || []).map((x) => x.name); }
function getNumber(page, propName) { return page.properties?.[propName]?.number ?? null; }
function getCheckbox(page, propName) { return page.properties?.[propName]?.checkbox ?? false; }
function getDate(page, propName) { return page.properties?.[propName]?.date?.start || ""; }
function getRelation(page, propName) { return (page.properties?.[propName]?.relation || []).map((x) => x.id); }

module.exports = {
  env, missingEnv, notionRequest, textOrEmpty, richText, titleText, numberOrNull, checkbox, splitMulti, relation,
  getTitle, getRichText, getSelect, getMulti, getNumber, getCheckbox, getDate, getRelation
};

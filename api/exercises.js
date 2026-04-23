const {
  env, missingEnv, notionRequest, richText, titleText, numberOrNull, checkbox, splitMulti,
  getTitle, getRichText, getSelect, getMulti, getNumber, getCheckbox
} = require("./_notion");

function mapExercisePage(page) {
  return {
    id: page.id,
    exercise: getTitle(page, "Exercise"),
    category: getSelect(page, "Category"),
    equipment: getMulti(page, "Equipment"),
    movementPattern: getSelect(page, "Movement Pattern"),
    primaryMuscles: getMulti(page, "Primary Muscles"),
    status: getSelect(page, "Status"),
    riskFlags: getMulti(page, "Risk Flags"),
    defaultSets: getNumber(page, "Default Sets"),
    defaultReps: getRichText(page, "Default Reps"),
    defaultRpe: getNumber(page, "Default RPE"),
    coachNote: getRichText(page, "Coach Note"),
    isCustom: getCheckbox(page, "Is Custom"),
    active: getCheckbox(page, "Active"),
  };
}

async function getExercises() {
  const results = [];
  let cursor;
  do {
    const body = {
      page_size: 100,
      sorts: [{ property: "Exercise", direction: "ascending" }],
      filter: { property: "Active", checkbox: { equals: true } },
    };
    if (cursor) body.start_cursor = cursor;
    const response = await notionRequest(`/databases/${env.exerciseLibraryDb}/query`, { method: "POST", body: JSON.stringify(body) });
    results.push(...response.results.map(mapExercisePage));
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return results;
}

async function createExercise(body) {
  const exerciseName = body.exercise || body.name;
  if (!exerciseName) throw new Error("Exercise name is required.");
  const properties = {
    "Exercise": { title: titleText(exerciseName) },
    "Equipment": { multi_select: splitMulti(body.equipment) },
    "Primary Muscles": { multi_select: splitMulti(body.primaryMuscles) },
    "Status": { select: { name: body.status || "Custom" } },
    "Risk Flags": { multi_select: splitMulti(body.riskFlags) },
    "Default Sets": { number: numberOrNull(body.defaultSets) },
    "Default Reps": { rich_text: richText(body.defaultReps || "") },
    "Default RPE": { number: numberOrNull(body.defaultRpe) },
    "Coach Note": { rich_text: richText(body.coachNote || "") },
    "Is Custom": { checkbox: checkbox(body.isCustom ?? true) },
    "Active": { checkbox: checkbox(body.active ?? true) },
  };
  if (body.category) properties["Category"] = { select: { name: body.category } };
  if (body.movementPattern) properties["Movement Pattern"] = { select: { name: body.movementPattern } };
  const response = await notionRequest("/pages", { method: "POST", body: JSON.stringify({ parent: { database_id: env.exerciseLibraryDb }, properties }) });
  return { id: response.id, url: response.url, exercise: exerciseName };
}

module.exports = async function handler(req, res) {
  const missing = missingEnv();
  if (missing.length) return res.status(500).json({ error: "Missing environment variables", missing });
  try {
    if (req.method === "GET") return res.status(200).json({ exercises: await getExercises() });
    if (req.method === "POST") return res.status(201).json(await createExercise(req.body || {}));
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message, details: error.details });
  }
};

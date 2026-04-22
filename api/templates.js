const { env, notionRequest, titleText, richText, numberOrNull, relation, getTitle, getSelect, getRichText, getNumber, getRelation } = require("./_notion");

function requireTemplateEnv() {
  const missing = [];
  if (!env.workoutTemplatesDb) missing.push("NOTION_WORKOUT_TEMPLATES_DB_ID");
  if (!env.templateExercisesDb) missing.push("NOTION_TEMPLATE_EXERCISES_DB_ID");
  if (missing.length) {
    const error = new Error("Template databases are not configured.");
    error.status = 500;
    error.details = { missing };
    throw error;
  }
}

function mapTemplate(page) {
  return {
    id: page.id,
    name: getTitle(page, "Template Name"),
    type: getSelect(page, "Template Type"),
    focus: getRichText(page, "Notes"),
    active: page.properties?.["Active"]?.checkbox ?? true,
  };
}

function mapTemplateExercise(page) {
  return {
    id: page.id,
    name: getTitle(page, "Template Exercise"),
    order: getNumber(page, "Order"),
    targetSets: getNumber(page, "Target Sets"),
    targetReps: getRichText(page, "Target Reps"),
    notes: getRichText(page, "Exercise Notes"),
    templateIds: getRelation(page, "Workout Template"),
    exerciseIds: getRelation(page, "Exercise"),
  };
}

async function listTemplates() {
  requireTemplateEnv();
  const templatesResp = await notionRequest(`/databases/${env.workoutTemplatesDb}/query`, {
    method: "POST",
    body: JSON.stringify({ page_size: 50, sorts: [{ property: "Sort Order", direction: "ascending" }] }),
  });
  const templates = templatesResp.results.map(mapTemplate);

  const templateExercisesResp = await notionRequest(`/databases/${env.templateExercisesDb}/query`, {
    method: "POST",
    body: JSON.stringify({ page_size: 100, sorts: [{ property: "Order", direction: "ascending" }] }),
  });
  const templateExercises = templateExercisesResp.results.map(mapTemplateExercise);

  return templates.map((template) => ({
    ...template,
    exercises: templateExercises.filter((ex) => ex.templateIds.includes(template.id)),
  }));
}

async function createTemplate(body) {
  requireTemplateEnv();
  const name = body.name || body.type || "Workout Template";
  const template = await notionRequest("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: env.workoutTemplatesDb },
      properties: {
        "Template Name": { title: titleText(name) },
        "Template Type": { select: { name: body.type || "Custom" } },
        "Notes": { rich_text: richText(body.focus || "") },
        "Active": { checkbox: true },
      },
    }),
  });

  let count = 0;
  for (let i = 0; i < (body.exercises || []).length; i++) {
    const ex = body.exercises[i];
    const exerciseRelationId = ex.exerciseId || ex.id;
    const properties = {
      "Template Exercise": { title: titleText(`${name} · ${ex.name || ex.exercise || "Exercise"}`) },
      "Workout Template": { relation: relation(template.id) },
      "Order": { number: i + 1 },
      "Target Sets": { number: numberOrNull(ex.targetSets) },
      "Target Reps": { rich_text: richText(ex.targetReps || "") },
      "Exercise Notes": { rich_text: richText(ex.notes || "") },
    };

    if (exerciseRelationId && !String(exerciseRelationId).startsWith("local-")) {
      properties["Exercise"] = { relation: relation(exerciseRelationId) };
    }

    await notionRequest("/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { database_id: env.templateExercisesDb },
        properties,
      }),
    });
    count++;
  }
  return { id: template.id, url: template.url, name, exerciseCount: count };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") return res.status(200).json({ templates: await listTemplates() });
    if (req.method === "POST") return res.status(201).json(await createTemplate(req.body || {}));
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message, details: error.details });
  }
};

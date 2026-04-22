const { env, missingEnv, notionRequest, richText, titleText, numberOrNull, relation } = require("./_notion");

function safeDate(value) { return value || new Date().toISOString().slice(0, 10); }

async function createWorkoutSession(log) {
  const date = safeDate(log.date);
  const title = `${date} · ${log.type || log.workoutTitle || "Workout"}`;
  return notionRequest("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: env.workoutSessionsDb },
      properties: {
        "Session": { title: titleText(title) },
        "Date": { date: { start: date } },
        "Type": { select: { name: log.type || "Custom Workout" } },
        "Workout Source": { select: { name: log.workoutSource || "Custom" } },
        "Readiness": { number: numberOrNull(log.readiness) },
        "Sleep": { number: numberOrNull(log.sleep) },
        "Energy": { number: numberOrNull(log.energy) },
        "Stress": { number: numberOrNull(log.stress) },
        "Session Notes": { rich_text: richText(log.notes || log.sessionNotes || "") },
      },
      children: [
        { object: "block", type: "heading_2", heading_2: { rich_text: richText("Session Summary") } },
        { object: "block", type: "paragraph", paragraph: { rich_text: richText(`Readiness ${log.readiness ?? ""}/30 · Sleep ${log.sleep ?? ""} · Energy ${log.energy ?? ""} · Stress ${log.stress ?? ""}`) } },
      ],
    }),
  });
}

async function createWorkoutExercise(sessionId, exercise, index) {
  const exerciseName = String(exercise.name || exercise.exercise || "Exercise");
  return notionRequest("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: env.workoutExercisesDb },
      properties: {
        "Workout Exercise": { title: titleText(`${exerciseName} · ${index + 1}`) },
        "Workout Session Link": { relation: relation(sessionId) },
        "Exercise Link": { relation: relation(exercise.exerciseId || exercise.id) },
        "Order": { number: index + 1 },
        "Source": { select: { name: exercise.source || "Added" } },
        "Target Sets": { number: numberOrNull(exercise.targetSets) },
        "Target Reps": { rich_text: richText(exercise.targetReps || "") },
        "Exercise Notes": { rich_text: richText(exercise.notes || "") },
      },
    }),
  });
}

async function createExerciseSet(workoutExerciseId, exerciseName, set, index) {
  return notionRequest("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: env.exerciseSetsDb },
      properties: {
        "Set Entry": { title: titleText(`${exerciseName} · Set ${index + 1}`) },
        "Workout Exercise Link": { relation: relation(workoutExerciseId) },
        "Set Number": { number: numberOrNull(set.setNumber || index + 1) },
        "Weight": { number: numberOrNull(set.weight) },
        "Weight Unit": { select: { name: set.weightUnit || "kg" } },
        "Reps": { number: numberOrNull(set.reps) },
        "Completed": { checkbox: set.completed !== false },
        "Set Notes": { rich_text: richText(set.notes || "") },
      },
    }),
  });
}

module.exports = async function handler(req, res) {
  const missing = missingEnv();
  if (missing.length) return res.status(500).json({ error: "Missing environment variables", missing });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const log = req.body || {};
    const exercises = Array.isArray(log.exercises) ? log.exercises : [];
    const session = log.existingSessionId
      ? { id: log.existingSessionId, url: log.existingSessionUrl || "" }
      : await createWorkoutSession(log);

    if (log.action === "start") {
      return res.status(201).json({
        status: "success",
        sessionId: session.id,
        sessionUrl: session.url,
        workoutExercisesCreated: 0,
        setsCreated: 0,
      });
    }

    let exerciseCount = 0;
    let setCount = 0;
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      if (!exercise.exerciseId && !exercise.id) throw new Error(`Exercise "${exercise.name || exercise.exercise || i + 1}" is missing exerciseId. Select it from the library first.`);
      const workoutExercise = await createWorkoutExercise(session.id, exercise, i);
      exerciseCount++;
      for (let j = 0; j < (exercise.sets || []).length; j++) {
        await createExerciseSet(workoutExercise.id, exercise.name || exercise.exercise || "Exercise", exercise.sets[j], j);
        setCount++;
      }
    }
    return res.status(201).json({ status: "success", sessionId: session.id, sessionUrl: session.url, workoutExercisesCreated: exerciseCount, setsCreated: setCount });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message, details: error.details });
  }
};

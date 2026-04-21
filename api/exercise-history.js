const { env, missingEnv, notionRequest, getTitle, getNumber, getSelect, getRichText, getRelation } = require("./_notion");

function mapWorkoutExercise(page) {
  return {
    id: page.id,
    name: getTitle(page, "Workout Exercise"),
    order: getNumber(page, "Order"),
    source: getSelect(page, "Source"),
    targetSets: getNumber(page, "Target Sets"),
    targetReps: getRichText(page, "Target Reps"),
    notes: getRichText(page, "Exercise Notes"),
    workoutSessionIds: getRelation(page, "Workout Session Link"),
  };
}

function mapSet(page) {
  return {
    id: page.id,
    setEntry: getTitle(page, "Set Entry"),
    setNumber: getNumber(page, "Set Number"),
    weight: getNumber(page, "Weight"),
    weightUnit: getSelect(page, "Weight Unit"),
    reps: getNumber(page, "Reps"),
    rpe: getNumber(page, "RPE"),
    notes: getRichText(page, "Set Notes"),
    workoutExerciseIds: getRelation(page, "Workout Exercise Link"),
  };
}

module.exports = async function handler(req, res) {
  const missing = missingEnv();
  if (missing.length) return res.status(500).json({ error: "Missing environment variables", missing });
  const exerciseId = req.query.exerciseId;
  if (!exerciseId) return res.status(400).json({ error: "exerciseId is required" });

  try {
    const weResp = await notionRequest(`/databases/${env.workoutExercisesDb}/query`, {
      method: "POST",
      body: JSON.stringify({
        page_size: 25,
        filter: { property: "Exercise Link", relation: { contains: exerciseId } },
        sorts: [{ property: "Order", direction: "ascending" }],
      }),
    });

    const workoutExercises = weResp.results.map(mapWorkoutExercise);
    const allSets = [];

    for (const we of workoutExercises) {
      const setResp = await notionRequest(`/databases/${env.exerciseSetsDb}/query`, {
        method: "POST",
        body: JSON.stringify({
          page_size: 100,
          filter: { property: "Workout Exercise Link", relation: { contains: we.id } },
          sorts: [{ property: "Set Number", direction: "ascending" }],
        }),
      });
      allSets.push(...setResp.results.map(mapSet).map((set) => ({ ...set, workoutExerciseId: we.id, workoutExerciseName: we.name })));
    }

    const sortedSets = allSets.sort((a, b) => (b.weight || 0) - (a.weight || 0));
    const lastSet = allSets.length ? allSets[allSets.length - 1] : null;
    const bestSet = sortedSets[0] || null;

    return res.status(200).json({
      workoutExercises,
      sets: allSets,
      summary: {
        entries: workoutExercises.length,
        totalSets: allSets.length,
        lastSet,
        bestSet,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message, details: error.details });
  }
};

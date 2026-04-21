const { env, missingEnv } = require("./_notion");
module.exports = async function handler(req, res) {
  const missing = missingEnv();
  res.status(missing.length ? 500 : 200).json({
    ok: missing.length === 0,
    missing,
    configured: {
      NOTION_TOKEN: Boolean(env.token),
      NOTION_EXERCISE_LIBRARY_DB_ID: Boolean(env.exerciseLibraryDb),
      NOTION_WORKOUT_SESSIONS_DB_ID: Boolean(env.workoutSessionsDb),
      NOTION_WORKOUT_EXERCISES_DB_ID: Boolean(env.workoutExercisesDb),
      NOTION_EXERCISE_SETS_DB_ID: Boolean(env.exerciseSetsDb),
      NOTION_WORKOUT_TEMPLATES_DB_ID: Boolean(env.workoutTemplatesDb),
      NOTION_TEMPLATE_EXERCISES_DB_ID: Boolean(env.templateExercisesDb),
      NOTION_CYCLE_LOGS_DB_ID: Boolean(env.cycleLogsDb),
    },
    note: "Template and Cycle database variables are optional unless you use those features."
  });
};

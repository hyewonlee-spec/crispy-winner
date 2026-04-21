const {
  env,
  missingEnv,
  notionRequest,
  getTitle,
  getSelect,
  getNumber,
  getRichText,
} = require("./_notion");

function getDateDirect(page, propName) {
  return page.properties?.[propName]?.date?.start || "";
}

function mapSession(page) {
  return {
    id: page.id,
    session: getTitle(page, "Session"),
    date: getDateDirect(page, "Date"),
    type: getSelect(page, "Type"),
    workoutSource: getSelect(page, "Workout Source"),
    readiness: getNumber(page, "Readiness"),
    sleep: getNumber(page, "Sleep"),
    energy: getNumber(page, "Energy"),
    stress: getNumber(page, "Stress"),
    backPain: getNumber(page, "Back Pain"),
    nerveSymptoms: getNumber(page, "Nerve Symptoms"),
    anklePain: getNumber(page, "Ankle Pain"),
    ankleStability: getNumber(page, "Ankle Stability"),
    shoulder: getNumber(page, "Shoulder"),
    dogWalk: getNumber(page, "Dog Walk"),
    notes: getRichText(page, "Session Notes"),
  };
}

function average(sessions, key) {
  const values = sessions
    .map((session) => session[key])
    .filter((value) => typeof value === "number" && Number.isFinite(value));

  if (!values.length) return null;

  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

module.exports = async function handler(req, res) {
  const missing = missingEnv();

  if (missing.length) {
    return res.status(500).json({
      error: "Missing environment variables",
      missing,
    });
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed. Use GET.",
    });
  }

  try {
    const response = await notionRequest(`/databases/${env.workoutSessionsDb}/query`, {
      method: "POST",
      body: JSON.stringify({
        page_size: 50,
        sorts: [
          {
            property: "Date",
            direction: "descending",
          },
        ],
      }),
    });

    const sessions = response.results.map(mapSession);

    const workouts = sessions.filter((session) => session.type !== "Readiness only").length;
    const readinessOnly = sessions.filter((session) => session.type === "Readiness only").length;

    return res.status(200).json({
      sessions,
      summary: {
        totalLogs: sessions.length,
        workouts,
        readinessOnly,
        avgReadiness: average(sessions, "readiness"),
        avgSleep: average(sessions, "sleep"),
        avgEnergy: average(sessions, "energy"),
        avgStress: average(sessions, "stress"),
        avgBackPain: average(sessions, "backPain"),
        avgNerveSymptoms: average(sessions, "nerveSymptoms"),
        avgAnklePain: average(sessions, "anklePain"),
        avgAnkleStability: average(sessions, "ankleStability"),
        avgShoulder: average(sessions, "shoulder"),
        avgDogWalk: average(sessions, "dogWalk"),
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Could not load history",
      details: error.details,
    });
  }
};

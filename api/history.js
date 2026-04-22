const { env, missingEnv, notionRequest, getTitle, getSelect, getNumber, getDate, getRichText } = require("./_notion");

function mapSession(page) {
  return {
    id: page.id,
    session: getTitle(page, "Session"),
    date: getDate(page, "Date"),
    type: getSelect(page, "Type"),
    workoutSource: getSelect(page, "Workout Source"),
    readiness: getNumber(page, "Readiness"),
    sleep: getNumber(page, "Sleep"),
    energy: getNumber(page, "Energy"),
    stress: getNumber(page, "Stress"),
    notes: getRichText(page, "Session Notes"),
  };
}
function average(sessions, key) {
  const vals = sessions.map((s) => s[key]).filter((v) => typeof v === "number" && Number.isFinite(v));
  return vals.length ? Math.round((vals.reduce((a,b) => a+b, 0) / vals.length) * 10) / 10 : null;
}
module.exports = async function handler(req, res) {
  const missing = missingEnv();
  if (missing.length) return res.status(500).json({ error: "Missing environment variables", missing });
  try {
    const response = await notionRequest(`/databases/${env.workoutSessionsDb}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 50, sorts: [{ property: "Date", direction: "descending" }] }),
    });
    const sessions = response.results.map(mapSession);
    return res.status(200).json({
      sessions,
      summary: {
        totalLogs: sessions.length,
        workouts: sessions.filter((s) => s.type !== "Readiness only").length,
        readinessOnly: sessions.filter((s) => s.type === "Readiness only").length,
        avgReadiness: average(sessions, "readiness"),
        avgSleep: average(sessions, "sleep"),
        avgEnergy: average(sessions, "energy"),
        avgStress: average(sessions, "stress"),
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message, details: error.details });
  }
};

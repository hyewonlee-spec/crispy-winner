const {
  env,
  notionRequest,
  titleText,
  richText,
  numberOrNull,
  getTitle,
  getDate,
  getSelect,
  getNumber,
  getRichText,
} = require("./_notion");

function requireCycleDb() {
  if (!env.cycleLogsDb) {
    const error = new Error("Cycle Logs database is not configured.");
    error.status = 500;
    error.details = { missing: ["NOTION_CYCLE_LOGS_DB_ID"] };
    throw error;
  }
}

function mapCycleLog(page) {
  return {
    id: page.id,
    title: getTitle(page, "Cycle Log"),
    date: getDate(page, "Date"),
    lastPeriodStart: getDate(page, "Last Period Start"),
    averageCycleLength: getNumber(page, "Average Cycle Length"),
    periodDay: getNumber(page, "Period Day"),
    cyclePhase: getSelect(page, "Cycle Phase"),
    bleedingFlow: getSelect(page, "Bleeding Flow"),
    cramps: getNumber(page, "Cramps / Pelvic Pain"),
    hotFlushes: getNumber(page, "Hot Flushes / Night Sweats"),
    sleepDisruption: getNumber(page, "Sleep Disruption"),
    mood: getNumber(page, "Mood / Irritability"),
    fatigue: getNumber(page, "Fatigue"),
    notes: getRichText(page, "Notes"),
    trainingRecommendation: getSelect(page, "Training Recommendation"),
  };
}

module.exports = async function handler(req, res) {
  try {
    requireCycleDb();

    if (req.method === "GET") {
      const response = await notionRequest(`/databases/${env.cycleLogsDb}/query`, {
        method: "POST",
        body: JSON.stringify({
          page_size: 30,
          sorts: [{ property: "Date", direction: "descending" }],
        }),
      });

      return res.status(200).json({
        logs: response.results.map(mapCycleLog),
      });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const date = body.date || new Date().toISOString().slice(0, 10);
      const title = `${date} · ${body.cyclePhase || "Cycle check"}`;

      const response = await notionRequest("/pages", {
        method: "POST",
        body: JSON.stringify({
          parent: { database_id: env.cycleLogsDb },
          properties: {
            "Cycle Log": { title: titleText(title) },
            "Date": { date: { start: date } },
            "Last Period Start": body.lastPeriodStart ? { date: { start: body.lastPeriodStart } } : { date: null },
            "Average Cycle Length": { number: numberOrNull(body.averageCycleLength) },
            "Period Day": { number: numberOrNull(body.periodDay) },
            "Cycle Phase": body.cyclePhase ? { select: { name: body.cyclePhase } } : undefined,
            "Bleeding Flow": { select: { name: body.bleedingFlow || "None" } },
            "Cramps / Pelvic Pain": { number: numberOrNull(body.cramps) },
            "Hot Flushes / Night Sweats": { number: numberOrNull(body.hotFlushes) },
            "Sleep Disruption": { number: numberOrNull(body.sleepDisruption) },
            "Mood / Irritability": { number: numberOrNull(body.mood) },
            "Fatigue": { number: numberOrNull(body.fatigue) },
            "Notes": { rich_text: richText(body.notes || "") },
            "Training Recommendation": { select: { name: body.trainingRecommendation || "Normal training" } },
          },
        }),
      });

      return res.status(201).json({
        status: "success",
        id: response.id,
        url: response.url,
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message,
      details: error.details,
    });
  }
};

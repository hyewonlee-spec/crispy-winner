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
    periodStartDate: getDate(page, "Period Start Date"),
    periodEndDate: getDate(page, "Period End Date"),
    periodLength: getNumber(page, "Period Length"),
    cycleLength: getNumber(page, "Cycle Length"),
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

function daysBetween(start, end) {
  if (!start || !end) return null;
  const oneDay = 24 * 60 * 60 * 1000;
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  const diff = Math.floor((b - a) / oneDay);
  return Number.isFinite(diff) ? diff : null;
}

function inclusiveDays(start, end) {
  const diff = daysBetween(start, end);
  if (diff === null || diff < 0) return null;
  return diff + 1;
}

async function getLogs() {
  const response = await notionRequest(`/databases/${env.cycleLogsDb}/query`, {
    method: "POST",
    body: JSON.stringify({
      page_size: 100,
      sorts: [{ property: "Period Start Date", direction: "descending" }],
    }),
  });

  return response.results.map(mapCycleLog);
}

module.exports = async function handler(req, res) {
  try {
    requireCycleDb();

    if (req.method === "GET") {
      return res.status(200).json({ logs: await getLogs() });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const date = body.date || new Date().toISOString().slice(0, 10);
      const periodStartDate = body.periodStartDate || "";
      const periodEndDate = body.periodEndDate || "";
      const periodLength = body.periodLength ?? inclusiveDays(periodStartDate, periodEndDate);

      const title = periodStartDate
        ? `${periodStartDate} · ${body.cyclePhase || "Cycle log"}`
        : `${date} · Cycle check`;

      const properties = {
        "Cycle Log": { title: titleText(title) },
        "Date": { date: { start: date } },
        "Period Start Date": periodStartDate ? { date: { start: periodStartDate } } : { date: null },
        "Period End Date": periodEndDate ? { date: { start: periodEndDate } } : { date: null },
        "Period Length": { number: numberOrNull(periodLength) },
        "Cycle Length": { number: numberOrNull(body.cycleLength) },
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
      };

      Object.keys(properties).forEach((key) => {
        if (properties[key] === undefined) delete properties[key];
      });

      const response = await notionRequest("/pages", {
        method: "POST",
        body: JSON.stringify({
          parent: { database_id: env.cycleLogsDb },
          properties,
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

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Dumbbell, HeartPulse, Moon, Activity, AlertTriangle, CheckCircle2, RotateCcw, TrendingUp, NotebookPen, Footprints } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "rehab_strength_tracker_v1";
const SHEET_URL_STORAGE_KEY = "rehab_strength_tracker_sheet_url";

const workoutPlan = {
  1: {
    title: "Lower A",
    subtitle: "Glutes, hamstrings, spine-safe strength",
    focus: "Build posterior-chain strength while protecting L4/L5 and ankle stability.",
    exercises: [
      { name: "Hip thrust machine / barbell hip thrust", target: "4 x 8–10", note: "Main lift. RPE 6–7. Pause at top." },
      { name: "Dumbbell Romanian deadlift", target: "3 x 8–10", note: "Small controlled range. Stop if sciatic symptoms appear." },
      { name: "Seated hamstring curl", target: "3 x 10–12", note: "Slow eccentric. Back-friendly hamstring work." },
      { name: "Leg press", target: "3 x 10–12", note: "No pelvic tuck. Knees track over toes." },
      { name: "Hip abductor", target: "3 x 12–15", note: "Pause open. Glute med support." },
      { name: "Hip adductor", target: "2–3 x 12–15", note: "Smooth controlled reps." },
      { name: "Pallof press", target: "3 x 10/side", note: "Anti-rotation core for back + golf history." },
      { name: "Seated calf isometric press", target: "5 x 10 sec", note: "Pain-free only. No standing calf raises yet." },
    ],
  },
  2: {
    title: "Upper A",
    subtitle: "Back, posture, shoulder stability",
    focus: "Strengthen back and shoulders without provoking the left shoulder.",
    exercises: [
      { name: "Chest-supported dumbbell row", target: "4 x 8–10", note: "Best row choice for spine safety." },
      { name: "Seated cable row, neutral grip", target: "3 x 10–12", note: "Ribs down. Elbows toward hips." },
      { name: "Lat pulldown, shoulder-friendly grip", target: "3 x 10", note: "Avoid narrow grip. Stop if odd shoulder sensation appears." },
      { name: "Incline neutral-grip DB press / machine press", target: "3 x 8–10", note: "Shoulder must feel clean." },
      { name: "Face pull", target: "3 x 12–15", note: "Control, don't yank." },
      { name: "Rear delt fly", target: "3 x 12–15", note: "Light and strict." },
      { name: "Cable external rotation", target: "2 x 12/side", note: "Left side should feel controlled." },
      { name: "Hammer curl", target: "2–3 x 10–12", note: "Elbow-friendly curl choice." },
    ],
  },
  3: {
    title: "Rehab + Cardio",
    subtitle: "Ankle, spine, mobility, fat-loss base",
    focus: "Improve ankle stability, keep cardio consistent, and reduce fatigue load.",
    exercises: [
      { name: "Dog walk / bike / elliptical", target: "25–45 min", note: "Talkable pace. Not a punishment session." },
      { name: "Seated ankle alphabet", target: "1 round/foot", note: "Pain-free range." },
      { name: "Band ankle eversion", target: "2–3 x 12–15", note: "Important for lateral ankle support." },
      { name: "Band ankle inversion", target: "2–3 x 12–15", note: "Slow and controlled." },
      { name: "Seated heel raise partial range", target: "2 x 10–12", note: "Only if pain-free." },
      { name: "Supported single-leg balance", target: "10–20 sec/side", note: "Hold rack lightly. Stop before ugly wobble." },
      { name: "Bird dog", target: "2 x 8/side", note: "Spine stability." },
      { name: "Side plank from knees", target: "2 x 20–30 sec/side", note: "No lumbar sagging." },
    ],
  },
  4: {
    title: "Lower B",
    subtitle: "Machines, control, knee/ankle stability",
    focus: "Build legs while keeping ankle planted and knee tracking controlled.",
    exercises: [
      { name: "Leg press", target: "4 x 10", note: "Controlled range. Reduce depth if knee feels unstable." },
      { name: "Hip thrust / glute bridge machine", target: "3 x 10–12", note: "Slightly lighter than Day 1." },
      { name: "Leg extension", target: "3 x 12", note: "Slow. Watch left knee tracking." },
      { name: "Seated / lying hamstring curl", target: "3 x 12", note: "Supports knee stability." },
      { name: "Cable pull-through", target: "3 x 10–12", note: "Hinge alternative if RDL fatigue is high." },
      { name: "Hip abductor", target: "3 x 15", note: "Glute med for knee/ankle control." },
      { name: "Dead bug", target: "3 x 8/side", note: "Better than leg raises for now." },
    ],
  },
  5: {
    title: "Upper B",
    subtitle: "Push/pull, arms, conditioning",
    focus: "Muscle tone, shoulder resilience, and higher calorie burn.",
    exercises: [
      { name: "Landmine press", target: "3 x 8/side", note: "Shoulder-friendlier than overhead press." },
      { name: "One-arm cable row", target: "3 x 10/side", note: "Good left/right control." },
      { name: "Machine chest press / neutral DB press", target: "3 x 10", note: "Keep shoulder blade controlled." },
      { name: "Wide-neutral pulldown", target: "3 x 10", note: "Avoid narrow grip." },
      { name: "Cable lateral raise", target: "3 x 12", note: "Light. Stop before shoulder gets weird." },
      { name: "Rope triceps pressdown", target: "2–3 x 12", note: "Swap if elbows flare." },
      { name: "Hammer curl", target: "2–3 x 12", note: "Controlled reps." },
      { name: "Farmer carry / sled push", target: "4 rounds", note: "Core, grip, shoulder, fat-loss finisher." },
    ],
  },
};

const initialData = {
  logs: [],
  goals: {
    ankleBalance: false,
    seatedCalfRaise: false,
    standingCalfRaise: false,
    noSharpPain: false,
    noGivingWay: false,
    shoulderCleanPulldown: false,
    noOddShoulder: false,
    noNerveIncrease: false,
  },
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function clampNum(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function ReadinessBadge({ score }) {
  let label = "Green";
  let desc = "Train as planned";
  let icon = <CheckCircle2 className="h-4 w-4" />;
  if (score < 12) {
    label = "Red";
    desc = "Rehab/cardio only";
    icon = <AlertTriangle className="h-4 w-4" />;
  } else if (score < 18) {
    label = "Amber";
    desc = "Reduce load 10–20%";
    icon = <Activity className="h-4 w-4" />;
  }

  return (
    <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Today’s readiness</p>
          <h3 className="text-2xl font-semibold text-slate-900">{label}</h3>
          <p className="text-sm text-slate-600">{desc}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">{icon}</div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-800" style={{ width: `${Math.min(100, (score / 25) * 100)}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">Score: {score}/25</p>
    </div>
  );
}

function Slider({ label, value, setValue, min = 0, max = 10, lowGood = true }) {
  return (
    <label className="block rounded-2xl border bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{value}</span>
      </div>
      <input
        className="w-full accent-slate-800"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(clampNum(e.target.value, min, max))}
      />
      <div className="mt-1 flex justify-between text-[11px] text-slate-400">
        <span>{lowGood ? "low" : "poor"}</span>
        <span>{lowGood ? "high" : "great"}</span>
      </div>
    </label>
  );
}

function App() {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState("today");
  const [selectedDay, setSelectedDay] = useState(1);
  const [today, setToday] = useState(getToday());
  const [sleep, setSleep] = useState(6);
  const [energy, setEnergy] = useState(6);
  const [stress, setStress] = useState(4);
  const [backPain, setBackPain] = useState(0);
  const [nerve, setNerve] = useState(0);
  const [anklePain, setAnklePain] = useState(0);
  const [ankleStability, setAnkleStability] = useState(5);
  const [shoulder, setShoulder] = useState(0);
  const [dogWalk, setDogWalk] = useState(30);
  const [notes, setNotes] = useState("");
  const [completed, setCompleted] = useState({});
  const [sheetUrl, setSheetUrl] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
      const savedSheetUrl = window.localStorage.getItem(SHEET_URL_STORAGE_KEY);
      if (savedSheetUrl) setSheetUrl(savedSheetUrl);
    } catch (error) {
      console.warn("Could not load saved data", error);
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Could not save data", error);
    }
  }, [data]);

  useEffect(() => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      window.localStorage.setItem(SHEET_URL_STORAGE_KEY, sheetUrl);
    } catch (error) {
      console.warn("Could not save Google Sheet URL", error);
    }
  }, [sheetUrl]);

  const readiness = useMemo(() => {
    let score = 25;
    score -= Math.max(0, 7 - sleep) * 1.4;
    score -= Math.max(0, 7 - energy) * 1.2;
    score -= stress * 0.7;
    score -= backPain * 1.2;
    score -= nerve * 1.8;
    score -= anklePain * 1.3;
    score -= Math.max(0, 7 - ankleStability) * 1.1;
    score -= shoulder * 1.1;
    return Math.round(Math.max(0, Math.min(25, score)));
  }, [sleep, energy, stress, backPain, nerve, anklePain, ankleStability, shoulder]);

  const safetyMessage = useMemo(() => {
    if (nerve >= 5 || backPain >= 6) return "Back/nerve warning: switch to rehab/cardio only and consider medical review if symptoms are unusual or worsening.";
    if (anklePain >= 5 || ankleStability <= 3) return "Ankle warning: avoid leg press intensity, lunges, step-ups, calf raises, running and jumping today.";
    if (shoulder >= 5) return "Shoulder warning: avoid pulldowns, pressing, lateral raises and overhead work today.";
    if (readiness < 12) return "Recovery day recommended: dog walk, bike, ankle rehab, gentle core.";
    if (readiness < 18) return "Amber day: train, but reduce weight 10–20% and avoid new exercises.";
    return "Green day: train as planned, but keep 2–3 reps in reserve.";
  }, [readiness, nerve, backPain, anklePain, ankleStability, shoulder]);

  const recentLogs = [...data.logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);

  const weeklyStats = useMemo(() => {
    const last7 = data.logs.filter((log) => {
      const diff = (new Date(getToday()) - new Date(log.date)) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff < 7;
    });
    const avg = (key) => last7.length ? (last7.reduce((sum, log) => sum + Number(log[key] || 0), 0) / last7.length).toFixed(1) : "—";
    return {
      sessions: last7.filter((l) => l.type !== "Check-in only" && l.type !== "Readiness only").length,
      avgReadiness: avg("readiness"),
      avgAnkle: avg("anklePain"),
      avgBack: avg("backPain"),
      avgNerve: avg("nerve"),
      dogWalk: last7.reduce((sum, log) => sum + Number(log.dogWalk || 0), 0),
    };
  }, [data.logs]);

  const buildLogPayload = (type) => {
    const completedExercises = Object.keys(completed)
      .filter((index) => completed[index])
      .map((index) => workoutPlan[selectedDay]?.exercises?.[Number(index)]?.name)
      .filter(Boolean);

    return {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      timestamp: new Date().toISOString(),
      date: today,
      type,
      selectedDay,
      workoutTitle: workoutPlan[selectedDay].title,
      readiness,
      sleep,
      energy,
      stress,
      backPain,
      nerve,
      anklePain,
      ankleStability,
      shoulder,
      dogWalk,
      notes,
      completed,
      completedExercises,
    };
  };

  const sendToGoogleSheet = async (log) => {
    const url = sheetUrl.trim();
    if (!url) return "skipped";

    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(log),
    });

    return "sent";
  };

  const saveLog = async (type = workoutPlan[selectedDay].title) => {
    const log = buildLogPayload(type);
    setData((prev) => ({ ...prev, logs: [log, ...prev.logs.filter((l) => !(l.date === today && l.type === type))] }));

    setSaveStatus("Saving…");
    try {
      const sheetResult = await sendToGoogleSheet(log);
      if (sheetResult === "sent") {
        setSaveStatus(type === "Readiness only" ? "Readiness saved locally. Google Sheet sync request sent." : "Workout saved locally. Google Sheet sync request sent.");
      } else {
        setSaveStatus(type === "Readiness only" ? "Readiness saved locally." : "Workout saved locally.");
      }
    } catch (error) {
      console.warn("Google Sheet sync failed", error);
      setSaveStatus("Saved locally, but Google Sheet sync failed. Check the Apps Script URL.");
    }
  }; 

  const resetToday = () => {
    setSleep(6);
    setEnergy(6);
    setStress(4);
    setBackPain(0);
    setNerve(0);
    setAnklePain(0);
    setAnkleStability(5);
    setShoulder(0);
    setDogWalk(30);
    setNotes("");
    setCompleted({});
    setSaveStatus("");
  };

  const toggleGoal = (key) => {
    setData((prev) => ({ ...prev, goals: { ...prev.goals, [key]: !prev.goals[key] } }));
  };

  const goalItems = [
    ["ankleBalance", "Left single-leg balance: 30 sec"],
    ["seatedCalfRaise", "Pain-free seated calf raise: 15 reps"],
    ["standingCalfRaise", "Pain-free double-leg calf raise: 15 reps"],
    ["noSharpPain", "No sharp ankle pain at end of day"],
    ["noGivingWay", "No ankle giving-way sensation"],
    ["shoulderCleanPulldown", "Pulldown feels clean with neutral/wide grip"],
    ["noOddShoulder", "No lingering odd left shoulder sensation"],
    ["noNerveIncrease", "No increase in left-leg nerve symptoms"],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-stone-100 p-3 text-slate-900">
      <div className="mx-auto max-w-md pb-24">
        <header className="sticky top-0 z-20 -mx-3 mb-4 border-b bg-slate-50/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Rehab Strength</p>
              <h1 className="text-xl font-bold">5-Day Tracker</h1>
            </div>
            <div className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">L4/L5 aware</div>
          </div>
        </header>

        {tab === "today" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-slate-700" />
                  <h2 className="text-lg font-semibold">Before training check-in</h2>
                </div>
                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Date
                  <input className="mt-1 w-full rounded-2xl border px-3 py-2" type="date" value={today} onChange={(e) => setToday(e.target.value)} />
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((day) => (
                    <button
                      key={day}
                      onClick={() => { setSelectedDay(day); setCompleted({}); }}
                      className={`rounded-2xl border px-2 py-3 text-sm font-semibold ${selectedDay === day ? "bg-slate-900 text-white" : "bg-white text-slate-700"}`}
                    >
                      D{day}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <ReadinessBadge score={readiness} />

            <div className="rounded-3xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-slate-700" />
                <div>
                  <h3 className="font-semibold">Coach note</h3>
                  <p className="text-sm text-slate-600">{safetyMessage}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <Slider label="Sleep quality" value={sleep} setValue={setSleep} lowGood={false} />
              <Slider label="Energy" value={energy} setValue={setEnergy} lowGood={false} />
              <Slider label="Stress" value={stress} setValue={setStress} />
              <Slider label="Back pain" value={backPain} setValue={setBackPain} />
              <Slider label="Left leg nerve/numbness intensity" value={nerve} setValue={setNerve} />
              <Slider label="Left ankle pain" value={anklePain} setValue={setAnklePain} />
              <Slider label="Left ankle stability" value={ankleStability} setValue={setAnkleStability} lowGood={false} />
              <Slider label="Left shoulder odd sensation/pain" value={shoulder} setValue={setShoulder} />
            </div>

            <label className="block rounded-2xl border bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-800">Dog walk minutes</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{dogWalk}</span>
              </div>
              <input className="w-full accent-slate-800" type="range" min="0" max="90" step="5" value={dogWalk} onChange={(e) => setDogWalk(clampNum(e.target.value, 0, 90))} />
            </label>

            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-slate-700" />
                  <div>
                    <h2 className="text-lg font-semibold">Day {selectedDay}: {workoutPlan[selectedDay].title}</h2>
                    <p className="text-sm text-slate-500">{workoutPlan[selectedDay].subtitle}</p>
                  </div>
                </div>
                <p className="mb-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{workoutPlan[selectedDay].focus}</p>
                <div className="space-y-2">
                  {workoutPlan[selectedDay].exercises.map((ex, index) => (
                    <button
                      key={ex.name}
                      onClick={() => setCompleted((prev) => ({ ...prev, [index]: !prev[index] }))}
                      className={`w-full rounded-2xl border p-3 text-left transition ${completed[index] ? "bg-slate-900 text-white" : "bg-white text-slate-800"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{ex.name}</p>
                          <p className={`text-sm ${completed[index] ? "text-slate-200" : "text-slate-500"}`}>{ex.target}</p>
                          <p className={`mt-1 text-xs ${completed[index] ? "text-slate-300" : "text-slate-500"}`}>{ex.note}</p>
                        </div>
                        {completed[index] && <CheckCircle2 className="h-5 w-5 shrink-0" />}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <label className="block rounded-3xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <NotebookPen className="h-5 w-5" />
                <span className="font-semibold">Session notes</span>
              </div>
              <textarea
                className="min-h-24 w-full rounded-2xl border p-3 text-sm"
                placeholder="What felt good? What felt unstable? Any next-day concerns to check tomorrow?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <div className="rounded-3xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-start gap-2">
                <TrendingUp className="mt-0.5 h-5 w-5 text-slate-700" />
                <div>
                  <h3 className="font-semibold">Google Sheet sync</h3>
                  <p className="text-sm text-slate-600">Paste your Google Apps Script Web App URL here. Leave blank to save only on this phone/browser.</p>
                </div>
              </div>
              <input
                className="mt-2 w-full rounded-2xl border px-3 py-2 text-sm"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
              />
            </div>

            {saveStatus && (
              <div className="rounded-2xl border bg-slate-900 p-3 text-sm font-medium text-white shadow-sm">
                {saveStatus}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => saveLog()} className="h-12 rounded-2xl bg-slate-900 text-white">Save workout</Button>
              <Button onClick={() => saveLog("Readiness only")} variant="outline" className="h-12 rounded-2xl">Save readiness only</Button>
            </div>
            <p className="-mt-2 text-xs text-slate-500">Save readiness only records your symptoms, sleep, energy, stress, dog walk and notes without counting it as a workout session.</p>
            <Button onClick={resetToday} variant="ghost" className="w-full rounded-2xl"><RotateCcw className="mr-2 h-4 w-4" />Reset today</Button>
          </motion.div>
        )}

        {tab === "progress" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Last 7 days</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Sessions</p><p className="text-2xl font-bold">{weeklyStats.sessions}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Avg readiness</p><p className="text-2xl font-bold">{weeklyStats.avgReadiness}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Avg ankle pain</p><p className="text-2xl font-bold">{weeklyStats.avgAnkle}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Avg back pain</p><p className="text-2xl font-bold">{weeklyStats.avgBack}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Avg nerve symptoms</p><p className="text-2xl font-bold">{weeklyStats.avgNerve}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Dog walk mins</p><p className="text-2xl font-bold">{weeklyStats.dogWalk}</p></div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4">
                <h2 className="mb-3 text-lg font-semibold">Rehab milestones</h2>
                <div className="space-y-2">
                  {goalItems.map(([key, label]) => (
                    <button key={key} onClick={() => toggleGoal(key)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${data.goals[key] ? "bg-slate-900 text-white" : "bg-white"}`}>
                      <CheckCircle2 className={`h-5 w-5 ${data.goals[key] ? "text-white" : "text-slate-300"}`} />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4">
                <h2 className="mb-3 text-lg font-semibold">Recent logs</h2>
                {recentLogs.length === 0 ? (
                  <p className="text-sm text-slate-500">No logs yet. Save your first check-in from the Today tab.</p>
                ) : (
                  <div className="space-y-2">
                    {recentLogs.map((log) => (
                      <div key={log.id} className="rounded-2xl border bg-white p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{log.date}</p>
                            <p className="text-sm text-slate-500">{log.type}</p>
                          </div>
                          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{log.readiness}/25</div>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">Back {log.backPain} · Nerve {log.nerve} · Ankle {log.anklePain} · Shoulder {log.shoulder}</p>
                        {log.notes && <p className="mt-2 rounded-xl bg-slate-50 p-2 text-sm text-slate-600">{log.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {tab === "rules" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2"><HeartPulse className="h-5 w-5" /><h2 className="text-lg font-semibold">Training rules</h2></div>
                <div className="space-y-3 text-sm text-slate-700">
                  <p><strong>Green day:</strong> train as planned. Keep 2–3 reps in reserve.</p>
                  <p><strong>Amber day:</strong> reduce load 10–20%, avoid new exercises, avoid finishers if symptoms rise.</p>
                  <p><strong>Red day:</strong> rehab, gentle cardio, mobility only. No heavy leg press, RDLs, pulldowns, or conditioning.</p>
                  <p><strong>Stop immediately:</strong> sharp pain, worsening numbness, new weakness, foot drop feeling, ankle giving way, or shoulder instability.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2"><Footprints className="h-5 w-5" /><h2 className="text-lg font-semibold">Ankle rules</h2></div>
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                  <li>No jumping, running intervals, high step-ups or walking lunges yet.</li>
                  <li>No standing calf raises until seated/partial range is pain-free.</li>
                  <li>Build toward 30 seconds single-leg balance on the left side.</li>
                  <li>End-of-day sharp pain means the day was too much.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2"><Activity className="h-5 w-5" /><h2 className="text-lg font-semibold">Shoulder rules</h2></div>
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                  <li>Avoid front raises, narrow pulldowns, heavy overhead pressing and dips.</li>
                  <li>Use neutral grips where possible.</li>
                  <li>If the left shoulder feels odd, switch to rows, rear delts and external rotations.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2"><Moon className="h-5 w-5" /><h2 className="text-lg font-semibold">Sleep + recovery</h2></div>
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                  <li>Keep hard sessions earlier where possible.</li>
                  <li>Use the same wake time most days.</li>
                  <li>Morning light within 30 minutes of waking.</li>
                  <li>Cool room, caffeine cutoff, and 10-minute pre-bed downshift.</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <nav className="fixed bottom-3 left-1/2 z-30 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-3xl border bg-white/95 p-2 shadow-lg backdrop-blur">
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => setTab("today")} className={`rounded-2xl px-3 py-3 text-sm font-semibold ${tab === "today" ? "bg-slate-900 text-white" : "text-slate-600"}`}>Today</button>
          <button onClick={() => setTab("progress")} className={`rounded-2xl px-3 py-3 text-sm font-semibold ${tab === "progress" ? "bg-slate-900 text-white" : "text-slate-600"}`}>Progress</button>
          <button onClick={() => setTab("rules")} className={`rounded-2xl px-3 py-3 text-sm font-semibold ${tab === "rules" ? "bg-slate-900 text-white" : "text-slate-600"}`}>Rules</button>
        </div>
      </nav>
    </div>
  );
}

export default App;

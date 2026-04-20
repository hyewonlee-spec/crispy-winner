import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Dumbbell,
  HeartPulse,
  Moon,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  TrendingUp,
  NotebookPen,
  Footprints,
} from "lucide-react";

const STORAGE_KEY = "rehab_strength_tracker_v1";

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

function Card({ children }) {
  return <section className="card">{children}</section>;
}

function Button({ children, onClick, variant = "primary", className = "" }) {
  return (
    <button onClick={onClick} className={`btn ${variant === "outline" ? "btnOutline" : variant === "ghost" ? "btnGhost" : "btnPrimary"} ${className}`}>
      {children}
    </button>
  );
}

function ReadinessBadge({ score }) {
  let label = "Green";
  let desc = "Train as planned";
  let icon = <CheckCircle2 size={18} />;
  if (score < 12) {
    label = "Red";
    desc = "Rehab/cardio only";
    icon = <AlertTriangle size={18} />;
  } else if (score < 18) {
    label = "Amber";
    desc = "Reduce load 10–20%";
    icon = <Activity size={18} />;
  }

  return (
    <div className="readiness">
      <div className="rowBetween">
        <div>
          <p className="muted small">Today’s readiness</p>
          <h3>{label}</h3>
          <p className="muted">{desc}</p>
        </div>
        <div className="iconBubble">{icon}</div>
      </div>
      <div className="bar"><div className="barFill" style={{ width: `${Math.min(100, (score / 25) * 100)}%` }} /></div>
      <p className="muted tiny">Score: {score}/25</p>
    </div>
  );
}

function Slider({ label, value, setValue, min = 0, max = 10, lowGood = true }) {
  return (
    <label className="sliderCard">
      <div className="rowBetween">
        <span className="label">{label}</span>
        <span className="pill">{value}</span>
      </div>
      <input
        className="range"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(clampNum(e.target.value, min, max))}
      />
      <div className="rangeLabels">
        <span>{lowGood ? "low" : "poor"}</span>
        <span>{lowGood ? "high" : "great"}</span>
      </div>
    </label>
  );
}

export default function App() {
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

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch (error) {
      console.warn("Could not load saved data", error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Could not save data", error);
    }
  }, [data]);

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
      sessions: last7.filter((l) => l.type !== "Check-in only").length,
      avgReadiness: avg("readiness"),
      avgAnkle: avg("anklePain"),
      avgBack: avg("backPain"),
      avgNerve: avg("nerve"),
      dogWalk: last7.reduce((sum, log) => sum + Number(log.dogWalk || 0), 0),
    };
  }, [data.logs]);

  const saveLog = (type = workoutPlan[selectedDay].title) => {
    const log = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      date: today,
      type,
      selectedDay,
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
    };
    setData((prev) => ({ ...prev, logs: [log, ...prev.logs.filter((l) => !(l.date === today && l.type === type))] }));
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
    <div className="app">
      <main className="shell">
        <header className="header">
          <div>
            <p className="overline">Rehab Strength</p>
            <h1>5-Day Tracker</h1>
          </div>
          <div className="tag">L4/L5 aware</div>
        </header>

        {tab === "today" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stack">
            <Card>
              <div className="sectionTitle">
                <CalendarDays size={20} />
                <h2>Before training check-in</h2>
              </div>
              <label className="inputLabel">
                Date
                <input className="dateInput" type="date" value={today} onChange={(e) => setToday(e.target.value)} />
              </label>
              <div className="dayGrid">
                {[1, 2, 3, 4, 5].map((day) => (
                  <button
                    key={day}
                    onClick={() => { setSelectedDay(day); setCompleted({}); }}
                    className={`dayButton ${selectedDay === day ? "active" : ""}`}
                  >
                    D{day}
                  </button>
                ))}
              </div>
            </Card>

            <ReadinessBadge score={readiness} />

            <div className="coachNote">
              <AlertTriangle size={20} />
              <div>
                <h3>Coach note</h3>
                <p>{safetyMessage}</p>
              </div>
            </div>

            <div className="stack">
              <Slider label="Sleep quality" value={sleep} setValue={setSleep} lowGood={false} />
              <Slider label="Energy" value={energy} setValue={setEnergy} lowGood={false} />
              <Slider label="Stress" value={stress} setValue={setStress} />
              <Slider label="Back pain" value={backPain} setValue={setBackPain} />
              <Slider label="Left leg nerve/numbness intensity" value={nerve} setValue={setNerve} />
              <Slider label="Left ankle pain" value={anklePain} setValue={setAnklePain} />
              <Slider label="Left ankle stability" value={ankleStability} setValue={setAnkleStability} lowGood={false} />
              <Slider label="Left shoulder odd sensation/pain" value={shoulder} setValue={setShoulder} />
            </div>

            <label className="sliderCard">
              <div className="rowBetween">
                <span className="label">Dog walk minutes</span>
                <span className="pill">{dogWalk}</span>
              </div>
              <input className="range" type="range" min="0" max="90" step="5" value={dogWalk} onChange={(e) => setDogWalk(clampNum(e.target.value, 0, 90))} />
            </label>

            <Card>
              <div className="sectionTitle">
                <Dumbbell size={20} />
                <div>
                  <h2>Day {selectedDay}: {workoutPlan[selectedDay].title}</h2>
                  <p className="muted">{workoutPlan[selectedDay].subtitle}</p>
                </div>
              </div>
              <p className="focus">{workoutPlan[selectedDay].focus}</p>
              <div className="exerciseList">
                {workoutPlan[selectedDay].exercises.map((ex, index) => (
                  <button
                    key={ex.name}
                    onClick={() => setCompleted((prev) => ({ ...prev, [index]: !prev[index] }))}
                    className={`exercise ${completed[index] ? "done" : ""}`}
                  >
                    <div>
                      <p className="exerciseName">{ex.name}</p>
                      <p className="muted">{ex.target}</p>
                      <p className="tiny">{ex.note}</p>
                    </div>
                    {completed[index] && <CheckCircle2 size={20} />}
                  </button>
                ))}
              </div>
            </Card>

            <label className="notesCard">
              <div className="sectionTitle">
                <NotebookPen size={20} />
                <h2>Session notes</h2>
              </div>
              <textarea
                placeholder="What felt good? What felt unstable? Any next-day concerns to check tomorrow?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <div className="twoCol">
              <Button onClick={() => saveLog()}>Save workout</Button>
              <Button onClick={() => saveLog("Check-in only")} variant="outline">Check-in only</Button>
            </div>
            <Button onClick={resetToday} variant="ghost"><RotateCcw size={16} /> Reset today</Button>
          </motion.div>
        )}

        {tab === "progress" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stack">
            <Card>
              <div className="sectionTitle">
                <TrendingUp size={20} />
                <h2>Last 7 days</h2>
              </div>
              <div className="statsGrid">
                <Stat label="Sessions" value={weeklyStats.sessions} />
                <Stat label="Avg readiness" value={weeklyStats.avgReadiness} />
                <Stat label="Avg ankle pain" value={weeklyStats.avgAnkle} />
                <Stat label="Avg back pain" value={weeklyStats.avgBack} />
                <Stat label="Avg nerve symptoms" value={weeklyStats.avgNerve} />
                <Stat label="Dog walk mins" value={weeklyStats.dogWalk} />
              </div>
            </Card>

            <Card>
              <h2>Rehab milestones</h2>
              <div className="exerciseList">
                {goalItems.map(([key, label]) => (
                  <button key={key} onClick={() => toggleGoal(key)} className={`goal ${data.goals[key] ? "done" : ""}`}>
                    <CheckCircle2 size={20} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h2>Recent logs</h2>
              {recentLogs.length === 0 ? (
                <p className="muted">No logs yet. Save your first check-in from the Today tab.</p>
              ) : (
                <div className="exerciseList">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="log">
                      <div className="rowBetween">
                        <div>
                          <p className="exerciseName">{log.date}</p>
                          <p className="muted">{log.type}</p>
                        </div>
                        <span className="pill">{log.readiness}/25</span>
                      </div>
                      <p className="tiny">Back {log.backPain} · Nerve {log.nerve} · Ankle {log.anklePain} · Shoulder {log.shoulder}</p>
                      {log.notes && <p className="logNote">{log.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {tab === "rules" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stack">
            <RuleCard icon={<HeartPulse size={20} />} title="Training rules" items={[
              "Green day: train as planned. Keep 2–3 reps in reserve.",
              "Amber day: reduce load 10–20%, avoid new exercises, avoid finishers if symptoms rise.",
              "Red day: rehab, gentle cardio, mobility only. No heavy leg press, RDLs, pulldowns, or conditioning.",
              "Stop immediately for sharp pain, worsening numbness, new weakness, foot drop feeling, ankle giving way, or shoulder instability.",
            ]} />
            <RuleCard icon={<Footprints size={20} />} title="Ankle rules" items={[
              "No jumping, running intervals, high step-ups or walking lunges yet.",
              "No standing calf raises until seated/partial range is pain-free.",
              "Build toward 30 seconds single-leg balance on the left side.",
              "End-of-day sharp pain means the day was too much.",
            ]} />
            <RuleCard icon={<Activity size={20} />} title="Shoulder rules" items={[
              "Avoid front raises, narrow pulldowns, heavy overhead pressing and dips.",
              "Use neutral grips where possible.",
              "If the left shoulder feels odd, switch to rows, rear delts and external rotations.",
            ]} />
            <RuleCard icon={<Moon size={20} />} title="Sleep + recovery" items={[
              "Keep hard sessions earlier where possible.",
              "Use the same wake time most days.",
              "Morning light within 30 minutes of waking.",
              "Cool room, caffeine cutoff, and 10-minute pre-bed downshift.",
            ]} />
          </motion.div>
        )}
      </main>

      <nav className="bottomNav">
        <button onClick={() => setTab("today")} className={tab === "today" ? "active" : ""}>Today</button>
        <button onClick={() => setTab("progress")} className={tab === "progress" ? "active" : ""}>Progress</button>
        <button onClick={() => setTab("rules")} className={tab === "rules" ? "active" : ""}>Rules</button>
      </nav>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <p className="tiny">{label}</p>
      <p className="statValue">{value}</p>
    </div>
  );
}

function RuleCard({ icon, title, items }) {
  return (
    <Card>
      <div className="sectionTitle">{icon}<h2>{title}</h2></div>
      <ul className="ruleList">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </Card>
  );
}

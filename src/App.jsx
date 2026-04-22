import React, { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, BarChart3, CalendarDays, CalendarPlus, CheckCircle2, ChevronDown, ChevronUp, Dumbbell, History, Library, Loader2, Moon, Plus, RotateCcw, Save, Search, Soup, Sparkles, StretchHorizontal, Trash2 } from "lucide-react";

const STORAGE_KEY = "rehab_strength_tracker_v2_phase4_draft";
const DRAFTS_KEY = "rehab_strength_tracker_v2_phase4_drafts";
const ACTIVE_WORKOUT_KEY = "rehab_strength_tracker_v2_phase9_active_workout";

const recommendedPlans = {
  1: { title: "Lower A", type: "Lower A", focus: "Glutes, hamstrings, spine-safe strength", exercises: ["Hip Thrust", "Dumbbell Romanian Deadlift", "Seated Hamstring Curl", "Leg Press", "Hip Abductor Machine", "Hip Adductor Machine", "Pallof Press", "Seated Heel Raise Partial Range"] },
  2: { title: "Upper A", type: "Upper A", focus: "Back, posture, shoulder stability", exercises: ["Chest-Supported Dumbbell Row", "Seated Cable Row — Neutral Grip", "Wide-Neutral Lat Pulldown", "Machine Chest Press", "Face Pull", "Rear Delt Fly", "Hammer Curl"] },
  3: { title: "Rehab + Cardio", type: "Rehab + Cardio", focus: "Ankle, spine, mobility, cardio", exercises: ["Dog Walk", "Seated Ankle Alphabet", "Band Ankle Eversion", "Band Ankle Inversion", "Supported Single-Leg Balance", "Bird Dog", "Side Plank From Knees"] },
  4: { title: "Lower B", type: "Lower B", focus: "Machines, control, knee/ankle stability", exercises: ["Leg Press", "Glute Bridge Machine", "Leg Extension", "Seated Hamstring Curl", "Cable Pull-Through", "Hip Abductor Machine", "Dead Bug"] },
  5: { title: "Upper B", type: "Upper B", focus: "Push/pull, arms, conditioning", exercises: ["Landmine Press", "One-Arm Cable Row", "Machine Chest Press", "Wide-Neutral Lat Pulldown", "Cable Lateral Raise", "Rope Triceps Pressdown", "Hammer Curl", "Farmer Carry"] },
};

const categoryOptions = ["Lower Body","Upper Pull","Upper Push","Arms","Core / Spine-Safe","Ankle Rehab","Conditioning","Custom"];
const statusOptions = ["Recommended","Caution","Avoid for now","Later phase","Custom"];
const movementOptions = ["Hip Extension","Knee Dominant","Knee Flexion","Hip Abduction","Hip Adduction","Hip Hinge","Knee Extension","Single Leg","Squat","Horizontal Pull","Vertical Pull","Scapular Control","Shoulder Horizontal Abduction","Horizontal Push","Angled Press","Shoulder Abduction","Elbow Extension","Elbow Flexion","Anti-Extension","Spine Stability","Lateral Core","Anti-Rotation","Carry","Ankle Mobility","Ankle Eversion","Ankle Inversion","Dorsiflexion","Calf Raise","Balance","Cardio","Conditioning","Custom"];

function todayIso(){return new Date().toISOString().slice(0,10)}
function uid(){return crypto?.randomUUID?crypto.randomUUID():String(Date.now()+Math.random())}
function num(v,f=0){const n=Number(v);return Number.isFinite(n)?n:f}
function defaultSet(i=1){return {setNumber:i,weight:"",weightUnit:"kg",reps:"",completed:true,notes:""}}
function makeExercise(ex,source="Added"){const targetSets=Math.max(1,num(ex.defaultSets,3));return{localId:uid(),exerciseId:ex.id,name:ex.exercise,source,category:ex.category,status:ex.status,coachNote:ex.coachNote,targetSets,targetReps:ex.defaultReps||"",previous:null,history:null,backDuringExercise:"",nerveDuringExercise:"",ankleDuringExercise:"",shoulderDuringExercise:"",notes:"",collapsed:false,sets:Array.from({length:targetSets},(_,i)=>defaultSet(i+1))}}

function Spinner({on}){return on?<Loader2 size={16} className="spin"/>:null}
function Button({children,onClick,variant="primary",busy=false,disabled=false,full=false}){return <button className={`${variant} ${full?"full":""}`} disabled={busy||disabled} onClick={(e)=>{e.currentTarget.classList.add("ack");setTimeout(()=>e.currentTarget.classList.remove("ack"),260);onClick&&onClick(e)}}>{busy&&<Spinner on/>}{children}</button>}
function Toast({toast,onClose}){return toast.message?<div className={`toast ${toast.kind}`}><span>{toast.message}</span><button onClick={onClose}>×</button></div>:null}
function Slider({label,value,setValue,lowGood=true}){return <label className="slider"><div className="row"><span>{label}</span><b>{value}</b></div><input type="range" min="0" max="10" value={value} onChange={e=>setValue(Number(e.target.value))} onPointerUp={e=>{e.currentTarget.classList.add("ack");setTimeout(()=>e.currentTarget.classList.remove("ack"),260)}}/><div className="rangeLabels"><span>{lowGood?"low":"poor"}</span><span>{lowGood?"high":"great"}</span></div></label>}
function Stat({label,value}){return <div className="stat"><p>{label}</p><strong>{value??"—"}</strong></div>}
function MiniChart({title,data,keyName,max=25}){const points=data.slice(0,10).reverse();const w=300,h=120,pad=16;const vals=points.map((p)=>typeof p[keyName]==="number"?p[keyName]:0);const coords=vals.map((v,i)=>{const x=points.length<=1?w/2:pad+(i*(w-pad*2))/(points.length-1);const y=h-pad-(Math.max(0,Math.min(max,v))/max)*(h-pad*2);return `${x},${y}`});return <div className="chart"><h3>{title}</h3><svg viewBox={`0 0 ${w} ${h}`} className="lineChart" preserveAspectRatio="none"><polyline points={coords.join(" ")} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>{coords.map((c,i)=>{const [x,y]=c.split(",").map(Number);return <circle key={i} cx={x} cy={y} r="4"/>})}</svg><div className="chartLabels">{points.map((p,i)=><small key={i}>{p[keyName]??"—"}</small>)}</div></div>}function WeeklyMonthlyOverview({sessions}){const valid=sessions.filter(s=>s.date);const now=new Date();const inDays=(days)=>valid.filter(s=>{const d=new Date(s.date);return (now-d)/(1000*60*60*24)<=days&&(now-d)>=0});const week=inDays(7);const month=inDays(31);const avg=(arr,key)=>{const vals=arr.map(s=>s[key]).filter(v=>typeof v==="number");return vals.length?Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10:"—"};const countWorkouts=(arr)=>arr.filter(s=>s.type!=="Readiness only").length;return <div className="overviewGrid"><div className="panel miniOverview"><h3>Weekly overview</h3><p><b>{countWorkouts(week)}</b> workouts</p><p>Avg readiness: <b>{avg(week,"readiness")}</b></p><p>Avg sleep: <b>{avg(week,"sleep")}</b></p><p>Avg ankle pain: <b>{avg(week,"anklePain")}</b></p></div><div className="panel miniOverview"><h3>Monthly overview</h3><p><b>{countWorkouts(month)}</b> workouts</p><p>Avg readiness: <b>{avg(month,"readiness")}</b></p><p>Avg sleep: <b>{avg(month,"sleep")}</b></p><p>Avg ankle pain: <b>{avg(month,"anklePain")}</b></p></div></div>}

function dateToIso(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateString, days) {
  if (!dateString) return "";
  const d = new Date(`${dateString}T00:00:00`);
  d.setDate(d.getDate() + Number(days || 0));
  return dateToIso(d);
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

function calculateAverageCycleLength(logs) {
  const starts = (logs || [])
    .map((log) => log.periodStartDate)
    .filter(Boolean)
    .sort();

  if (starts.length >= 2) {
    const lengths = [];
    for (let i = 1; i < starts.length; i += 1) {
      const len = daysBetween(starts[i - 1], starts[i]);
      if (len && len >= 21 && len <= 60) lengths.push(len);
    }
    if (lengths.length) {
      return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
    }
  }

  const storedLengths = (logs || [])
    .map((log) => log.cycleLength)
    .filter((value) => typeof value === "number" && value >= 21 && value <= 60);

  if (storedLengths.length) {
    return Math.round(storedLengths.reduce((a, b) => a + b, 0) / storedLengths.length);
  }

  return 28;
}

function calculateAveragePeriodLength(logs) {
  const lengths = (logs || [])
    .map((log) => log.periodLength)
    .filter((value) => typeof value === "number" && value >= 1 && value <= 14);

  if (lengths.length) {
    return Math.round((lengths.reduce((a, b) => a + b, 0) / lengths.length) * 10) / 10;
  }

  return null;
}

function latestPeriodStart(logs, fallback) {
  const starts = (logs || []).map((log) => log.periodStartDate).filter(Boolean).sort();
  return starts[starts.length - 1] || fallback || "";
}

function calculateCycleDashboard(date, periodStartDate, logs) {
  if (!periodStartDate) {
    return {
      cycleDay: null,
      phase: "Not enough data yet",
      nextPeriodStart: "",
      daysUntilNextPeriod: null,
      ovulationDate: "",
      daysUntilOvulation: null,
      averageCycleLength: calculateAverageCycleLength(logs),
      averagePeriodLength: calculateAveragePeriodLength(logs),
      phaseNote: "Add your current period start date.",
    };
  }

  const averageCycleLength = calculateAverageCycleLength(logs);
  const averagePeriodLength = calculateAveragePeriodLength(logs);
  let cycleDay = daysBetween(periodStartDate, date) + 1;

  while (cycleDay < 1) cycleDay += averageCycleLength;
  while (cycleDay > averageCycleLength) cycleDay -= averageCycleLength;

  const nextPeriodStart = addDays(periodStartDate, averageCycleLength);
  const ovulationDate = addDays(nextPeriodStart, -14);
  const daysUntilNextPeriod = daysBetween(date, nextPeriodStart);
  const daysUntilOvulation = daysBetween(date, ovulationDate);

  let phase = "Luteal";
  const ovulationCycleDay = averageCycleLength - 13;

  if (cycleDay <= Math.max(3, Math.min(7, Math.round(averagePeriodLength || 5)))) {
    phase = "Menstrual";
  } else if (cycleDay < ovulationCycleDay - 1) {
    phase = "Follicular";
  } else if (cycleDay <= ovulationCycleDay + 1) {
    phase = "Ovulation window";
  } else {
    phase = "Luteal";
  }

  return {
    cycleDay,
    phase,
    nextPeriodStart,
    daysUntilNextPeriod,
    ovulationDate,
    daysUntilOvulation,
    averageCycleLength,
    averagePeriodLength,
    phaseNote: `Day ${cycleDay} of ~${averageCycleLength}-day cycle`,
  };
}

function cycleTrainingRecommendation(cycle) {
  const symptomLoad =
    Number(cycle.cramps || 0) +
    Number(cycle.hotFlushes || 0) +
    Number(cycle.sleepDisruption || 0) +
    Number(cycle.mood || 0) +
    Number(cycle.fatigue || 0) +
    Number(cycle.headacheMigraine || 0) +
    Number(cycle.indigestion || 0) +
    Number(cycle.bloating || 0);

  if (
    cycle.bleedingFlow === "Heavy" ||
    cycle.cramps >= 7 ||
    cycle.sleepDisruption >= 7 ||
    cycle.fatigue >= 7 || cycle.headacheMigraine >= 7
  ) {
    return "Recovery / rehab focus";
  }

  if (
    symptomLoad >= 20 ||
    cycle.cramps >= 5 ||
    cycle.hotFlushes >= 5 ||
    cycle.mood >= 6 || cycle.bloating >= 6 || cycle.indigestion >= 6
  ) {
    return "Reduce load 10–20%";
  }

  if (cycle.phase === "Menstrual" && cycle.bleedingFlow !== "None") {
    return "Technique / moderate strength";
  }

  if (
    cycle.phase === "Luteal" &&
    (cycle.sleepDisruption >= 4 || cycle.mood >= 4 || cycle.fatigue >= 4)
  ) {
    return "Moderate intensity + recovery";
  }

  return "Normal training";
}

function cycleCoachText(cycle) {
  const rec = cycleTrainingRecommendation(cycle);

  if (rec === "Recovery / rehab focus") {
    return "Prioritise rehab, walking, mobility, and gentle machine work. Skip max-effort sets today.";
  }

  if (rec === "Reduce load 10–20%") {
    return "Train if you want, but lower load or volume. Keep 3 reps in reserve and avoid new exercises.";
  }

  if (rec === "Moderate intensity + recovery") {
    return "Late-cycle or symptom-heavy day: use stable exercises, longer rests, and stop before form degrades.";
  }

  if (rec === "Technique / moderate strength") {
    return "Menstrual phase: train if symptoms allow. Use warm-up sets to decide whether to keep or reduce load.";
  }

  return "Symptoms look manageable. Train as planned, but let pain/readiness override cycle phase.";
}

function formatAuDate(value) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function formatDays(value) {
  return value === null || value === undefined || value === "" ? "—" : value;
}

export default function App(){
  const [tab,setTab]=useState("today");
  const [exercises,setExercises]=useState([]);
  const [history,setHistory]=useState({sessions:[],summary:null,error:""});
  const [exerciseHistory,setExerciseHistory]=useState(null);
  const [selectedHistoryExercise,setSelectedHistoryExercise]=useState(null);
  const [templates,setTemplates]=useState([]);
  const [drafts,setDrafts]=useState([]);
  const [toast,setToast]=useState({message:"",kind:"info"});
  const [busy,setBusy]=useState({library:false,save:false,custom:false,history:false,exerciseHistory:false,template:false});
  const [query,setQuery]=useState(""); const [categoryFilter,setCategoryFilter]=useState("All"); const [statusFilter,setStatusFilter]=useState("All");
  const [builderMode,setBuilderMode]=useState("recommended");
  const [startPrompt,setStartPrompt]=useState(null);
  const [endPrompt,setEndPrompt]=useState(false);
  const [activeWorkout,setActiveWorkout]=useState(null);
  const [date,setDate]=useState(todayIso()); const [type,setType]=useState("Lower A"); const [workoutSource,setWorkoutSource]=useState("Recommended");
  const [sleep,setSleep]=useState(6),[energy,setEnergy]=useState(6),[stress,setStress]=useState(4),[backPain,setBackPain]=useState(0),[nerve,setNerve]=useState(0),[anklePain,setAnklePain]=useState(0),[ankleStability,setAnkleStability]=useState(5),[shoulder,setShoulder]=useState(0),[dogWalk,setDogWalk]=useState(30);
  const [notes,setNotes]=useState(""); const [workoutExercises,setWorkoutExercises]=useState([]);
  const [custom,setCustom]=useState({exercise:"",category:"Custom",equipment:"",movementPattern:"Custom",primaryMuscles:"",status:"Custom",riskFlags:"",defaultSets:3,defaultReps:"10",coachNote:""});
  const [cycle,setCycle]=useState({date:todayIso(),dailyEntryDate:todayIso(),periodStartDate:"",periodEndDate:"",bleedingFlow:"None",cramps:0,hotFlushes:0,sleepDisruption:0,mood:0,fatigue:0,headacheMigraine:0,saltCravings:0,sugarCravings:0,indigestion:0,bloating:0,notes:""});
  const [periodDateMode,setPeriodDateMode]=useState(null);
  const [pendingPeriodDate,setPendingPeriodDate]=useState(todayIso());
  const [cycleLogs,setCycleLogs]=useState([]);
  const [cycleStatus,setCycleStatus]=useState("");

  function show(message,kind="info"){setToast({message,kind});setTimeout(()=>setToast(t=>t.message===message?{message:"",kind:"info"}:t),3500)}
  function toggleSymptom(key){setCycle(c=>({...c,[key]:Number(c[key]||0)>0?0:6}))}
  function draftPayload(){return{date,type,workoutSource,sleep,energy,stress,backPain,nerve,anklePain,ankleStability,shoulder,dogWalk,notes,exercises:workoutExercises}}
  function applyDraft(d){setDate(d.date||todayIso());setType(d.type||"Custom Workout");setWorkoutSource(d.workoutSource||"Custom");setSleep(d.sleep??6);setEnergy(d.energy??6);setStress(d.stress??4);setBackPain(d.backPain??0);setNerve(d.nerve??0);setAnklePain(d.anklePain??0);setAnkleStability(d.ankleStability??5);setShoulder(d.shoulder??0);setDogWalk(d.dogWalk??30);setNotes(d.notes||"");setWorkoutExercises(d.exercises||[]);}

  useEffect(()=>{try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)applyDraft(JSON.parse(raw));const ds=localStorage.getItem(DRAFTS_KEY);if(ds)setDrafts(JSON.parse(ds));const aw=localStorage.getItem(ACTIVE_WORKOUT_KEY);if(aw)setActiveWorkout(JSON.parse(aw))}catch{} loadExercises(false); loadHistory(false); loadTemplates(false); loadCycleLogs(false)},[]);
  useEffect(()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(draftPayload()))},[date,type,workoutSource,sleep,energy,stress,backPain,nerve,anklePain,ankleStability,shoulder,dogWalk,notes,workoutExercises]);
  useEffect(()=>{localStorage.setItem(DRAFTS_KEY,JSON.stringify(drafts))},[drafts]);
  useEffect(()=>{if(activeWorkout){localStorage.setItem(ACTIVE_WORKOUT_KEY,JSON.stringify(activeWorkout))}else{localStorage.removeItem(ACTIVE_WORKOUT_KEY)}},[activeWorkout]);

  const readiness=useMemo(()=>{let s=25;s-=Math.max(0,7-sleep)*1.4;s-=Math.max(0,7-energy)*1.2;s-=stress*.7;s-=backPain*1.2;s-=nerve*1.8;s-=anklePain*1.3;s-=Math.max(0,7-ankleStability)*1.1;s-=shoulder*1.1;return Math.round(Math.max(0,Math.min(25,s)))},[sleep,energy,stress,backPain,nerve,anklePain,ankleStability,shoulder]);
  const readinessZone=readiness>=18?"Green":readiness>=12?"Amber":"Red";
  const currentCycle=useMemo(()=>{const start=cycle.periodStartDate||latestPeriodStart(cycleLogs,"");const calc=calculateCycleDashboard(date,start,cycleLogs);const merged={...cycle,...calc};return{...merged,periodStartDate:start,trainingRecommendation:cycleTrainingRecommendation(merged),coachText:cycleCoachText(merged)}},[date,cycle,cycleLogs]);
  const coachNote=nerve>=5||backPain>=6?"Red flag day: rehab/cardio only. Avoid loaded hinge, leg press intensity and heavy spinal loading.":anklePain>=5||ankleStability<=3?"Ankle caution: keep exercises planted and controlled. Avoid calf raises, lunges, step-ups, running and jumping.":shoulder>=5?"Shoulder caution: avoid pulldowns, pressing, lateral raises and overhead work today.":readiness<12?"Red day: save readiness only or do rehab/cardio.":readiness<18?"Amber day: reduce load 10–20% and avoid new exercises.":"Green day: train as planned, 2–3 reps in reserve.";
  const filtered=useMemo(()=>exercises.filter(e=>{const q=query.toLowerCase();return(!q||[e.exercise,e.category,e.status,e.coachNote,(e.riskFlags||[]).join(" ")].join(" ").toLowerCase().includes(q))&&(categoryFilter==="All"||e.category===categoryFilter)&&(statusFilter==="All"||e.status===statusFilter)}),[exercises,query,categoryFilter,statusFilter]);
  const totalSets=workoutExercises.reduce((sum,e)=>sum+e.sets.length,0);

  async function loadExercises(msg=true){setBusy(b=>({...b,library:true}));try{const r=await fetch("/api/exercises");const j=await r.json();if(!r.ok)throw new Error(j.error||"Could not load exercises");setExercises(j.exercises||[]);if(msg)show("Exercise library synced.","success")}catch(e){show(`Library sync failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,library:false}))}}
  async function loadHistory(msg=true){setBusy(b=>({...b,history:true}));try{const r=await fetch("/api/history");const j=await r.json();if(!r.ok)throw new Error(j.error||"Could not load history");setHistory({sessions:j.sessions||[],summary:j.summary||null,error:""});if(msg)show("Progress refreshed.","success")}catch(e){setHistory(h=>({...h,error:e.message}));if(msg)show(`Progress failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,history:false}))}}
  async function loadTemplates(msg=true){try{const r=await fetch("/api/templates");const j=await r.json();if(!r.ok)throw new Error(j.error||"Templates unavailable");setTemplates(j.templates||[]);if(msg)show("Templates loaded.","success")}catch(e){if(msg)show(`Templates not ready: ${e.message}`,"error")}}

  async function hydratePrevious(ex){try{const r=await fetch(`/api/exercise-history?exerciseId=${ex.exerciseId}`);const j=await r.json();if(r.ok){const prev=j.summary?.lastSet||j.summary?.bestSet||null;updateWorkoutExercise(ex.localId,{previous:prev,history:j})}}catch{}}
  async function startWorkoutFromPlan(planKey){
    const p=recommendedPlans[planKey];
    if(!p) return;
    setStartPrompt(null);
    setBuilderMode("recommended");
    setType(p.type);
    setWorkoutSource("Recommended");
    const mapped=p.exercises.map(n=>exercises.find(e=>e.exercise===n)).filter(Boolean).map(e=>makeExercise(e,"Recommended"));
    setWorkoutExercises(mapped);
    setBusy(b=>({...b,save:true}));
    try{
      const payload={date,type:p.type,workoutSource:"Recommended",readiness,sleep,energy,stress,backPain,nerve,anklePain,ankleStability,shoulder,dogWalk,notes,exercises:[],action:"start"};
      const r=await fetch("/api/workouts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||"Could not start workout");
      setActiveWorkout({sessionId:j.sessionId,sessionUrl:j.sessionUrl,startTime:new Date().toISOString(),type:p.type,source:"Recommended"});
      setTab("workout");
      show("Workout started.","success");
      mapped.forEach(e=>setTimeout(()=>hydratePrevious(e),100));
    }catch(e){show(`Start failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,save:false}))}
  }
  async function startCurrentWorkout(){
    if(!workoutExercises.length) return show("Add exercises first.","error");
    setBusy(b=>({...b,save:true}));
    try{
      const payload={date,type,workoutSource,readiness,sleep,energy,stress,backPain,nerve,anklePain,ankleStability,shoulder,dogWalk,notes,exercises:[],action:"start"};
      const r=await fetch("/api/workouts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||"Could not start workout");
      setActiveWorkout({sessionId:j.sessionId,sessionUrl:j.sessionUrl,startTime:new Date().toISOString(),type,source:workoutSource});
      setTab("workout"); show("Workout started.","success");
    }catch(e){show(`Start failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,save:false}))}
  }
  async function endTodayWorkout(){
    setEndPrompt(false);
    const payload={date,type,workoutSource,readiness,sleep,energy,stress,backPain,nerve,anklePain,ankleStability,shoulder,dogWalk,notes,exercises:workoutExercises,existingSessionId:activeWorkout?.sessionId,existingSessionUrl:activeWorkout?.sessionUrl};
    setBusy(b=>({...b,save:true})); show("Recording workout…","info");
    try{
      const r=await fetch("/api/workouts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||"Save failed");
      setActiveWorkout(null); await loadHistory(false); localStorage.removeItem(STORAGE_KEY);
      show("Today’s workout has been recorded, WELL DONE!","success");
      window.setTimeout(()=>alert("Today’s workout has been recorded, WELL DONE!"),100);
    }catch(e){show(`Workout end failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,save:false}))}
  }
  function addExercise(ex,source="Added"){if(workoutSource==="Recommended")setWorkoutSource("Modified Recommended");const next=makeExercise(ex,source);setWorkoutExercises(prev=>[...prev,next]);setTab("workout");show(`${ex.exercise} added.`,"success");setTimeout(()=>hydratePrevious(next),100)}
  function applyRecommendedPlan(key){setStartPrompt(key)}
  function buildCustomWorkout(){setBuilderMode("custom");setType("Custom Workout");setWorkoutSource("Custom");setWorkoutExercises([]);setTab("workout");show("Custom workout started.","success")}
  function updateWorkoutExercise(id,patch){setWorkoutExercises(prev=>prev.map(e=>e.localId===id?{...e,...patch}:e))}
  function updateSet(id,i,patch){setWorkoutExercises(prev=>prev.map(e=>e.localId!==id?e:{...e,sets:e.sets.map((s,idx)=>idx===i?{...s,...patch}:s)}))}
  function addSet(id){setWorkoutExercises(prev=>prev.map(e=>e.localId===id?{...e,sets:[...e.sets,defaultSet(e.sets.length+1)]}:e));show("Set added.","success")}
  function duplicateLastSet(id){setWorkoutExercises(prev=>prev.map(e=>{if(e.localId!==id)return e;const last=e.sets[e.sets.length-1]||defaultSet(1);return{...e,sets:[...e.sets,{...last,setNumber:e.sets.length+1}]}}));show("Last set duplicated.","success")}
  function removeSet(id,i){setWorkoutExercises(prev=>prev.map(e=>e.localId!==id?e:{...e,sets:e.sets.filter((_,idx)=>idx!==i).map((s,idx)=>({...s,setNumber:idx+1}))||[defaultSet(1)]}))}
  function removeExercise(id){const ex=workoutExercises.find(e=>e.localId===id);setWorkoutExercises(prev=>prev.filter(e=>e.localId!==id));show(`${ex?.name||"Exercise"} removed.`,"success")}
  function saveDraft(){const name=prompt("Draft name?")||`${type} draft`;setDrafts(prev=>[{id:uid(),name,createdAt:new Date().toISOString(),draft:draftPayload()},...prev]);show("Draft saved.","success")}
  function loadDraft(d){applyDraft(d.draft);setTab("workout");show(`${d.name} loaded.`,"success")}
  function deleteDraft(id){setDrafts(prev=>prev.filter(d=>d.id!==id));show("Draft deleted.","success")}

  async function createCustomExercise(){if(!custom.exercise.trim())return show("Enter exercise name first.","error");setBusy(b=>({...b,custom:true}));try{const r=await fetch("/api/exercises",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...custom,isCustom:true,active:true})});const j=await r.json();if(!r.ok)throw new Error(j.error||"Could not create exercise");await loadExercises(false);show(`Created ${j.exercise}.`,"success");setCustom({exercise:"",category:"Custom",equipment:"",movementPattern:"Custom",primaryMuscles:"",status:"Custom",riskFlags:"",defaultSets:3,defaultReps:"10",coachNote:""})}catch(e){show(`Create failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,custom:false}))}}
  async function loadCycleLogs(msg=true){
    try{
      const r=await fetch("/api/cycle");
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||"Cycle logs unavailable");
      setCycleLogs(j.logs||[]);
      const latest=(j.logs||[])[0];
      if(latest){
        setCycle(c=>({
          ...c,
          periodStartDate:latest.periodStartDate||c.periodStartDate,
          periodEndDate:latest.periodEndDate||c.periodEndDate,
          bleedingFlow:latest.bleedingFlow||c.bleedingFlow,
          cramps:latest.cramps??c.cramps,
          hotFlushes:latest.hotFlushes??c.hotFlushes,
          sleepDisruption:latest.sleepDisruption??c.sleepDisruption,
          mood:latest.mood??c.mood,
          fatigue:latest.fatigue??c.fatigue,
          headacheMigraine:latest.headacheMigraine??c.headacheMigraine,
          saltCravings:latest.saltCravings??c.saltCravings,
          sugarCravings:latest.sugarCravings??c.sugarCravings,
          indigestion:latest.indigestion??c.indigestion,
          bloating:latest.bloating??c.bloating
        }))
      }
      setCycleStatus("");
      if(msg)show("Cycle check refreshed.","success")
    }catch(e){
      setCycleStatus(e.message);
      if(msg)show(`Cycle tracking not ready: ${e.message}`,"error")
    }
  }

  function openPeriodDateBox(mode){
    setPeriodDateMode(mode);
    setPendingPeriodDate(mode==="start" ? (cycle.periodStartDate || todayIso()) : (cycle.periodEndDate || todayIso()));
  }

  function resetPeriodFlow(){
    setCycle(c=>({...c,periodStartDate:"",periodEndDate:"",bleedingFlow:"None"}));
    setPeriodDateMode(null);
    show("Period flow reset.","success");
  }

  function confirmPeriodDate(){
    if(!pendingPeriodDate) return show("Choose a date first.","error");
    if(periodDateMode==="start"){
      setCycle(c=>({...c,periodStartDate:pendingPeriodDate,periodEndDate:"",dailyEntryDate:pendingPeriodDate,bleedingFlow:c.bleedingFlow==="None"?"Medium":c.bleedingFlow}));
      show(`Period start saved: ${pendingPeriodDate}`,"success");
    }
    if(periodDateMode==="end"){
      setCycle(c=>({...c,periodEndDate:pendingPeriodDate,dailyEntryDate:pendingPeriodDate}));
      show(`Period end saved: ${pendingPeriodDate}`,"success");
    }
    setPeriodDateMode(null);
  }

  function markPeriodStarted(useToday=true){
    const chosen = useToday ? todayIso() : cycle.periodStartDate;
    if(!chosen) return show("Choose a period start date first.","error");
    setCycle(c=>({...c,periodStartDate:chosen,dailyEntryDate:c.dailyEntryDate||chosen,bleedingFlow:c.bleedingFlow==="None"?"Medium":c.bleedingFlow}));
    show(`Period start marked: ${chosen}`,"success");
  }

  function markPeriodEnded(useToday=true){
    const chosen = useToday ? todayIso() : cycle.periodEndDate;
    if(!chosen) return show("Choose a period end date first.","error");
    setCycle(c=>({...c,periodEndDate:chosen,dailyEntryDate:c.dailyEntryDate||chosen}));
    show(`Period end marked: ${chosen}`,"success");
  }

  async function saveCycleCheck(){
    const payload={
      ...cycle,
      date,
      periodStartDate:cycle.periodStartDate,
      periodEndDate:cycle.periodEndDate,
      periodLength:inclusiveDays(cycle.periodStartDate,cycle.periodEndDate),
      cycleLength:currentCycle.averageCycleLength,
      cycleDay:currentCycle.cycleDay,
      cyclePhase:currentCycle.phase==="Not enough data yet" ? "" : currentCycle.phase,
      trainingRecommendation:currentCycle.trainingRecommendation
    };

    try{
      const r=await fetch("/api/cycle",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      });
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||"Cycle save failed");
      show("Cycle check saved.","success");
      await loadCycleLogs(false)
    }catch(e){
      show(`Cycle save failed: ${e.message}`,"error")
    }
  }

  async function saveWorkout(readinessOnly=false){const payload={date,type:readinessOnly?"Readiness only":type,workoutSource:readinessOnly?"Readiness only":workoutSource,readiness,sleep,energy,stress,backPain,nerve,anklePain,ankleStability,shoulder,dogWalk,notes,exercises:readinessOnly?[]:workoutExercises};setBusy(b=>({...b,save:true}));show("Saving to Notion…","info");try{const r=await fetch("/api/workouts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const j=await r.json();if(!r.ok)throw new Error(j.error||"Save failed");show(`Saved. ${j.workoutExercisesCreated} exercises, ${j.setsCreated} sets.`,"success");await loadHistory(false);if(!readinessOnly)localStorage.removeItem(STORAGE_KEY)}catch(e){show(`Saved draft locally, Notion failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,save:false}))}}
  async function saveTemplate(){if(!workoutExercises.length)return show("Add exercises before saving a template.","error");setBusy(b=>({...b,template:true}));try{const name=prompt("Template name?")||type;const r=await fetch("/api/templates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,type,focus:notes,exercises:workoutExercises})});const j=await r.json();if(!r.ok)throw new Error(j.error||"Template save failed");show(`Template saved: ${j.name}`,"success");await loadTemplates(false)}catch(e){show(`Template failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,template:false}))}}
  async function showExerciseHistory(ex){setSelectedHistoryExercise(ex);setTab("exerciseHistory");setBusy(b=>({...b,exerciseHistory:true}));try{const r=await fetch(`/api/exercise-history?exerciseId=${ex.id}`);const j=await r.json();if(!r.ok)throw new Error(j.error||"History failed");setExerciseHistory(j)}catch(e){show(`History failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,exerciseHistory:false}))}}

  return <div className={`app ${activeWorkout ? "activeWorkoutMode" : ""}`}><Toast toast={toast} onClose={()=>setToast({message:"",kind:"info"})}/>
      {startPrompt&&<div className="modalShade"><div className="modalBox"><h2>Do you want to start today’s workout?</h2><p>{recommendedPlans[startPrompt]?.title}</p><div className="twoCol"><Button variant="secondary" onClick={()=>setStartPrompt(null)}>Not yet</Button><Button variant="primary" busy={busy.save} onClick={()=>startWorkoutFromPlan(startPrompt)}>Yes</Button></div></div></div>}
      {endPrompt&&<div className="modalShade"><div className="modalBox"><h2>Are you sure?</h2><p>End today’s workout and record it to Notion?</p><div className="twoCol"><Button variant="secondary" onClick={()=>setEndPrompt(false)}>No</Button><Button variant="primary" busy={busy.save} onClick={endTodayWorkout}>Yes</Button></div></div></div>}
      <main className="shell"><header className="header"><div><p className="overline">Rehab Strength v2</p><h1>Rehab Log</h1></div><button className="mini" onClick={()=>loadExercises(true)} disabled={busy.library}><Spinner on={busy.library}/> Sync</button></header>
    {tab==="today"&&<section className="stack"><div className="panel"><div className="sectionTitle"><CalendarDays size={20}/><h2>Readiness Check</h2></div><label className="label dateLabel">Date<input className="input dateInput" type="date" value={date} onChange={e=>setDate(e.target.value)} /></label></div><div className={`readiness panel ${readinessZone.toLowerCase()}`}><div className="row"><div><h2 className="big">{readinessZone}</h2><p className="muted">{readiness}/25</p></div><div className="bubble">{readiness>=18?<CheckCircle2/>:<AlertTriangle/>}</div></div><div className="meter"><span style={{width:`${(readiness/25)*100}%`}}/></div></div><div className="coach"><AlertTriangle size={20}/><p>{coachNote}</p></div><div className="panel cycleTodayCard">
  <div className="sectionTitle"><Sparkles size={20}/><h2>Cycle-aware training</h2></div>
  <div className={`cyclePhase compact ${(currentCycle.phase||"").toLowerCase().replaceAll(" ","-")}`}>
    <h3>{currentCycle.phase}</h3>
    <div className="cycleHeroGrid todayCycleGrid">
      <div><span>Cycle day</span><b>{currentCycle.cycleDay??"—"}</b></div>
      <div><span>Next period</span><b>{formatDays(currentCycle.daysUntilNextPeriod)} days</b></div>
    </div>
    <strong>{currentCycle.trainingRecommendation}</strong>
  </div>
  <button type="button" className="pastelLinkBox" onClick={()=>setTab("cycle")}>Open Cycle tab</button>
</div><Slider label="Sleep quality" value={sleep} setValue={setSleep} lowGood={false}/><Slider label="Energy" value={energy} setValue={setEnergy} lowGood={false}/><Slider label="Stress" value={stress} setValue={setStress}/><Slider label="Back pain" value={backPain} setValue={setBackPain}/><Slider label="Left leg nerve/numbness" value={nerve} setValue={setNerve}/><Slider label="Left ankle pain" value={anklePain} setValue={setAnklePain}/><Slider label="Left ankle stability" value={ankleStability} setValue={setAnkleStability} lowGood={false}/><Slider label="Left shoulder sensation/pain" value={shoulder} setValue={setShoulder}/><Slider label="Dog walk minutes" value={dogWalk} setValue={setDogWalk} lowGood={false}/><div className="panel"><div className="sectionTitle"><Dumbbell size={20}/><h2>Workout</h2></div><div className="builderToggle"><button className={builderMode==="recommended"?"active":""} onClick={()=>setBuilderMode("recommended")}>Recommended</button><button className={builderMode==="custom"?"active":""} onClick={buildCustomWorkout}>DIY</button></div>{builderMode==="recommended"&&<div className="planStack">{Object.entries(recommendedPlans).map(([k,p])=><button key={k} className="plan" onClick={()=>applyRecommendedPlan(k)}><span><b>{p.title}</b><small>{p.focus}</small></span><span>{p.exercises.length}</span></button>)}</div>}</div><textarea className="notes" placeholder="Session/readiness notes…" value={notes} onChange={e=>setNotes(e.target.value)}/><Button variant="secondary" full busy={busy.save} onClick={()=>saveWorkout(true)}><Save size={16}/> Save readiness only</Button></section>}
    {tab==="workout"&&<section className="stack"><div className="panel workoutHeader"><div><input className="workoutNameInput" value={type} onChange={e=>setType(e.target.value)} /><p className="muted">{workoutSource} · {workoutExercises.length} exercises · {totalSets} sets</p></div><Button variant="secondary" onClick={()=>setTab("library")}><Plus size={16}/> Add</Button></div>{workoutExercises.length===0&&<div className="empty"><Dumbbell size={28}/><h2>No exercises yet</h2><p>Add exercises from the library or start with a recommended plan.</p><Button full onClick={()=>setTab("library")}><Plus size={16}/> Add exercise</Button></div>}{workoutExercises.map(ex=><div className="panel exerciseCard" key={ex.localId}><div className="exerciseTop"><button className="collapseBtn" onClick={()=>updateWorkoutExercise(ex.localId,{collapsed:!ex.collapsed})}>{ex.collapsed?<ChevronDown size={18}/>:<ChevronUp size={18}/>}</button><div><h3>{ex.name}</h3><p className="muted">{ex.status} · {ex.category} · {ex.source}</p>{ex.previous&&<p className="previous">Previous: {ex.previous.weight??"—"}{ex.previous.weightUnit||"kg"} × {ex.previous.reps??"—"}</p>}</div><button className="iconBtn" onClick={()=>removeExercise(ex.localId)}><Trash2 size={16}/></button></div>{ex.coachNote&&<p className="note">{ex.coachNote}</p>}{!ex.collapsed&&<><div className="miniGrid"><label className="field"><span>Target sets</span><input inputMode="numeric" value={ex.targetSets} onChange={e=>updateWorkoutExercise(ex.localId,{targetSets:e.target.value})}/></label><label className="field"><span>Target reps</span><input value={ex.targetReps} onChange={e=>updateWorkoutExercise(ex.localId,{targetReps:e.target.value})}/></label></div><div className="setHeader noRpe"><span>Set</span><span>Weight</span><span>Reps</span><span></span></div><div className="sets">{ex.sets.map((s,i)=><div className="setRow noRpe" key={i}><b>{i+1}</b><input placeholder="kg" inputMode="decimal" value={s.weight} onChange={e=>updateSet(ex.localId,i,{weight:e.target.value})}/><input placeholder="reps" inputMode="numeric" value={s.reps} onChange={e=>updateSet(ex.localId,i,{reps:e.target.value})}/><button className="setDelete" onClick={()=>removeSet(ex.localId,i)}>×</button></div>)}</div><div className="twoCol"><Button variant="ghost" onClick={()=>addSet(ex.localId)}><Plus size={16}/> Add set</Button><Button variant="ghost" onClick={()=>duplicateLastSet(ex.localId)}>Copy the last set</Button></div><details className="symptomDetails"><summary>Exercise symptom check</summary><div className="miniGrid">{["Back","Nerve","Ankle","Shoulder"].map(label=>{const key=label.toLowerCase()+"DuringExercise";return <label className="field" key={key}><span>{label}</span><input inputMode="numeric" value={ex[key]} onChange={e=>updateWorkoutExercise(ex.localId,{[key]:e.target.value})}/></label>})}</div></details><textarea className="notes small" placeholder="Exercise notes…" value={ex.notes} onChange={e=>updateWorkoutExercise(ex.localId,{notes:e.target.value})}/></>}</div>)}<div className="twoCol"><Button variant="secondary" full onClick={saveDraft}>Save draft</Button><Button variant="secondary" full busy={busy.template} onClick={saveTemplate}>Save as Notion template</Button></div>{activeWorkout ? <Button variant="primary" full busy={busy.save} disabled={!workoutExercises.length} onClick={()=>setEndPrompt(true)}><Save size={16}/> End Today’s workout</Button> : <Button variant="primary" full busy={busy.save} disabled={!workoutExercises.length} onClick={startCurrentWorkout}><Save size={16}/> Start Today’s workout</Button>}<Button variant="ghost" full onClick={()=>{setWorkoutExercises([]);setNotes("");show("Draft cleared.","success")}}><RotateCcw size={16}/> Clear current draft</Button>{drafts.length>0&&<div className="panel"><h2>Saved drafts</h2><div className="sessionList">{drafts.map(d=><div className="sessionItem" key={d.id}><div className="row"><b>{d.name}</b><button className="linkBtn" onClick={()=>deleteDraft(d.id)}>Delete</button></div><Button variant="secondary" full onClick={()=>loadDraft(d)}>Load draft</Button></div>)}</div></div>}</section>}
    {tab==="library"&&<section className="stack"><div className="panel"><div className="sectionTitle"><Library size={20}/><h2>Exercise Library</h2></div><Button variant="secondary" full onClick={()=>document.getElementById("custom-exercise-form")?.scrollIntoView({behavior:"smooth"})}><Plus size={16}/> Add custom exercise to library</Button><div className="search"><Search size={16}/><input placeholder="Search exercises…" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="twoCol"><select className="input compact" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option>All</option>{categoryOptions.map(x=><option key={x}>{x}</option>)}</select><select className="input compact" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option>{statusOptions.map(x=><option key={x}>{x}</option>)}</select></div></div><div className="exerciseList">{filtered.map(e=><div className={`libraryItem ${e.status?.toLowerCase().replaceAll(" ","-")}`} key={e.id}><button onClick={()=>addExercise(e)}><div><b>{e.exercise}</b><p>{e.category} · {e.status}</p><small>{e.coachNote}</small></div><Plus size={18}/></button><button className="historyBtn" onClick={()=>showExerciseHistory(e)}><History size={16}/> History</button></div>)}</div><div className="panel" id="custom-exercise-form"><div className="sectionTitle"><Plus size={20}/><h2>Create custom exercise</h2></div><input className="input" placeholder="Exercise name" value={custom.exercise} onChange={e=>setCustom({...custom,exercise:e.target.value})}/><div className="twoCol"><select className="input" value={custom.category} onChange={e=>setCustom({...custom,category:e.target.value})}>{categoryOptions.map(x=><option key={x}>{x}</option>)}</select><select className="input" value={custom.status} onChange={e=>setCustom({...custom,status:e.target.value})}>{statusOptions.map(x=><option key={x}>{x}</option>)}</select></div><select className="input" value={custom.movementPattern} onChange={e=>setCustom({...custom,movementPattern:e.target.value})}>{movementOptions.map(x=><option key={x}>{x}</option>)}</select><input className="input" placeholder="Equipment, comma-separated" value={custom.equipment} onChange={e=>setCustom({...custom,equipment:e.target.value})}/><input className="input" placeholder="Primary muscles, comma-separated" value={custom.primaryMuscles} onChange={e=>setCustom({...custom,primaryMuscles:e.target.value})}/><input className="input" placeholder="Risk flags, comma-separated" value={custom.riskFlags} onChange={e=>setCustom({...custom,riskFlags:e.target.value})}/><div className="miniGrid"><label className="field"><span>Default sets</span><input value={custom.defaultSets} onChange={e=>setCustom({...custom,defaultSets:e.target.value})}/></label><label className="field"><span>Default reps</span><input value={custom.defaultReps} onChange={e=>setCustom({...custom,defaultReps:e.target.value})}/></label></div><textarea className="notes small" placeholder="Coach note" value={custom.coachNote} onChange={e=>setCustom({...custom,coachNote:e.target.value})}/><Button full busy={busy.custom} onClick={createCustomExercise}><Plus size={16}/> Save custom exercise</Button></div></section>}
    {tab==="progress"&&<section className="stack"><div className="panel"><div className="sectionTitle"><BarChart3 size={20}/><h2>Progress Dashboard</h2></div><Button variant="secondary" full busy={busy.history} onClick={()=>loadHistory(true)}>Refresh progress</Button>{history.error&&<p className="errorText">{history.error}</p>}</div><div className="statsGrid"><Stat label="Total logs" value={history.summary?.totalLogs}/><Stat label="Workouts" value={history.summary?.workouts}/><Stat label="Avg readiness" value={history.summary?.avgReadiness}/><Stat label="Avg sleep" value={history.summary?.avgSleep}/><Stat label="Avg ankle pain" value={history.summary?.avgAnklePain}/><Stat label="Avg back pain" value={history.summary?.avgBackPain}/></div><WeeklyMonthlyOverview sessions={history.sessions}/><MiniChart title="Readiness trend" data={history.sessions} keyName="readiness" max={25}/><MiniChart title="Ankle pain trend" data={history.sessions} keyName="anklePain" max={10}/><div className="panel"><h2>Recent sessions</h2><div className="sessionList">{history.sessions.slice(0,12).map(s=><div className="sessionItem" key={s.id}><div className="row"><b>{s.date||"No date"}</b><span className="pill">{s.readiness??"—"}/25</span></div><p className="muted">{s.type||"Log"} · Back {s.backPain??"—"} · Nerve {s.nerveSymptoms??"—"} · Ankle {s.anklePain??"—"} · Shoulder {s.shoulder??"—"}</p>{s.notes&&<p className="note">{s.notes}</p>}</div>)}</div></div></section>}
    {tab==="exerciseHistory"&&<section className="stack"><div className="panel"><div className="sectionTitle"><History size={20}/><h2>{selectedHistoryExercise?.exercise||"Exercise"} History</h2></div><Button variant="secondary" full onClick={()=>setTab("library")}>Back to library</Button></div>{busy.exerciseHistory&&<div className="panel"><Spinner on/> Loading history…</div>}{exerciseHistory&&<><div className="statsGrid"><Stat label="Entries" value={exerciseHistory.summary?.entries}/><Stat label="Sets" value={exerciseHistory.summary?.totalSets}/><Stat label="Best weight" value={exerciseHistory.summary?.bestSet?.weight}/><Stat label="Best reps" value={exerciseHistory.summary?.bestSet?.reps}/></div><div className="panel"><h2>Past sets</h2><div className="sessionList">{exerciseHistory.sets.map(s=><div className="sessionItem" key={s.id}><div className="row"><b>{s.setEntry}</b><span className="pill">{s.weight??"—"}{s.weightUnit||"kg"} × {s.reps??"—"}</span></div><p className="muted">RPE {s.rpe??"—"} · {s.workoutExerciseName}</p></div>)}</div></div></>}</section>}
    {tab==="cycle"&&<section className="stack"><div className="panel cyclePanel"><div className="sectionTitle"><Sparkles size={20}/><h2>Cycle-aware training</h2></div><div className={`cyclePhase ${(currentCycle.phase||"").toLowerCase().replaceAll(" ","-")}`}><h2>{currentCycle.phase}</h2><div className="cycleHeroGrid"><div><span>Cycle day</span><b>{currentCycle.cycleDay??"—"}</b></div><div><span>Days until projected period</span><b>{formatDays(currentCycle.daysUntilNextPeriod)}</b></div><div><span>Projected period start</span><b>{formatAuDate(currentCycle.nextPeriodStart)}</b></div><div><span>Estimated ovulation</span><b>{formatAuDate(currentCycle.ovulationDate)}</b></div></div><strong>{currentCycle.trainingRecommendation}</strong></div></div>

    <div className="panel cyclePanel periodStatusPanel">
      <div className="sectionTitle"><CalendarPlus size={20}/><h2>Period dates</h2></div>
      {!cycle.periodStartDate && (
        <div className="periodStateBox waiting">
          
          <h3>No active period recorded</h3>
          <div className="centerControl wide80">
            <Button variant="primary" full onClick={()=>openPeriodDateBox("start")}>Period Started Today</Button>
          </div>
        </div>
      )}

      {cycle.periodStartDate && !cycle.periodEndDate && (
        <div className="periodStateBox activePeriod">
          
          <h3>Day {inclusiveDays(cycle.periodStartDate, date) || currentCycle.cycleDay || "—"}</h3>
          <p>Started: <b>{cycle.periodStartDate}</b></p>
          <div className="centerControl wide80">
            <Button variant="primary" full onClick={()=>openPeriodDateBox("end")}>Period Ended</Button>
          </div>
        </div>
      )}

      {cycle.periodStartDate && cycle.periodEndDate && (
        <div className="periodStateBox endedPeriod">
          
          <h3>{inclusiveDays(cycle.periodStartDate, cycle.periodEndDate) || "—"} days recorded</h3>
          <p>Start: <b>{cycle.periodStartDate}</b></p>
          <p>End: <b>{cycle.periodEndDate}</b></p>
          <div className="centerControl wide80">
            <Button variant="secondary" full onClick={resetPeriodFlow}>OK</Button>
          </div>
        </div>
      )}

      {periodDateMode && (
        <div className="periodDatePopup">
          <h3>{periodDateMode==="start" ? "Choose period start date" : "Choose period end date"}</h3>
          <input type="date" value={pendingPeriodDate} onChange={e=>setPendingPeriodDate(e.target.value)}/>
          <div className="periodPopupActions">
            <button type="button" className="ghost smallButton" onClick={()=>setPeriodDateMode(null)}>Cancel</button>
            <button type="button" className="primary smallButton" onClick={confirmPeriodDate}>Save</button>
          </div>
        </div>
      )}
    </div>

    <div className="panel cyclePanel">
      <div className="sectionTitle"><Activity size={20}/><h2>Daily symptom check-in</h2></div>
      <label className="field centerField halfWidth"><span>Date</span><input type="date" value={cycle.dailyEntryDate} onChange={e=>setCycle({...cycle,dailyEntryDate:e.target.value})}/></label>
      <label className="field"><span>Bleeding flow</span><select value={cycle.bleedingFlow} onChange={e=>setCycle({...cycle,bleedingFlow:e.target.value})}><option>None</option><option>Spotting</option><option>Light</option><option>Medium</option><option>Heavy</option></select></label>
      <div className="symptomButtonGrid">
        <button type="button" className={cycle.headacheMigraine>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("headacheMigraine")}><span>Headache / migraine</span><b>{cycle.headacheMigraine>0?"Yes":"No"}</b></button>
        <button type="button" className={cycle.saltCravings>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("saltCravings")}><span>Salt cravings</span><b>{cycle.saltCravings>0?"Yes":"No"}</b></button>
        <button type="button" className={cycle.sugarCravings>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("sugarCravings")}><span>Sugar cravings</span><b>{cycle.sugarCravings>0?"Yes":"No"}</b></button>
        <button type="button" className={cycle.cramps>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("cramps")}><span>Cramps</span><b>{cycle.cramps>0?"Yes":"No"}</b></button>
        <button type="button" className={cycle.indigestion>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("indigestion")}><span>Indigestion</span><b>{cycle.indigestion>0?"Yes":"No"}</b></button>
        <button type="button" className={cycle.bloating>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("bloating")}><span>Bloating</span><b>{cycle.bloating>0?"Yes":"No"}</b></button>
        <button type="button" className={cycle.hotFlushes>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("hotFlushes")}><span>Hot flushes / night sweats</span><b>{cycle.hotFlushes>0?"Yes":"No"}</b></button>
        <button type="button" className={cycle.sleepDisruption>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("sleepDisruption")}><span>Sleep disruption</span><b>{cycle.sleepDisruption>0?"Yes":"No"}</b></button>
        <button type="button" className={cycle.mood>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("mood")}><span>Mood / irritability</span><b>{cycle.mood>0?"Yes":"No"}</b></button>
        <button type="button" className={cycle.fatigue>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("fatigue")}><span>Fatigue</span><b>{cycle.fatigue>0?"Yes":"No"}</b></button>
      </div>
      <textarea className="notes small" placeholder="Daily cycle notes…" value={cycle.notes} onChange={e=>setCycle({...cycle,notes:e.target.value})}/>
      <div className="centerControl wide80"><Button variant="primary" full onClick={saveCycleCheck}>Save daily check-in</Button></div>
      {cycleStatus&&<p className="errorText">{cycleStatus}</p>}
    </div>

    </section>}{tab==="rules"&&<section className="stack"><div className="panel"><div className="sectionTitle"><Activity size={20}/><h2>Check</h2></div></div>
    <div className="panel"><div className="sectionTitle"><Sparkles size={20}/><h2>Cycle-aware training</h2></div><Button variant="secondary" full onClick={()=>setTab("cycle")}>Open Cycle tab</Button></div><div className="checkGrid"><div className="panel checkCard"><div className="sectionTitle"><Soup size={20}/><h3>Food choice</h3></div><ul><li>Protein at each meal when possible.</li><li>Pair carbs with protein around training for energy and recovery.</li><li>Hydrate before gym; add electrolytes if walking/training in heat.</li><li>Keep a quick fallback meal ready so fatigue does not become snack-chaos goblin time.</li></ul></div><div className="panel checkCard"><div className="sectionTitle"><Moon size={20}/><h3>Sleep hygiene</h3></div><ul><li>Same wake time most days.</li><li>Dim screens/bright lights in the final 30–60 minutes.</li><li>Avoid caffeine late afternoon/evening.</li><li>Keep the room cool, dark and boring in the best way.</li></ul></div><div className="panel checkCard"><div className="sectionTitle"><StretchHorizontal size={20}/><h3>Mobility / stretching</h3></div><ul><li>Before training: gentle dynamic warm-up, not aggressive stretching.</li><li>For ankle: controlled band work and balance before lower-body sessions.</li><li>For back: bird dog/dead bug style activation beats heavy flexion.</li><li>After training: relaxed stretching and breathing to downshift.</li></ul></div><div className="panel checkCard"><div className="sectionTitle"><AlertTriangle size={20}/><h3>Modify today if…</h3></div><ul><li>Nerve symptoms are up from baseline.</li><li>Left ankle feels unstable before warm-up.</li><li>Shoulder feels odd during the first warm-up sets.</li><li>Sleep/energy are poor: reduce load 10–20%.</li></ul></div></div><div className="panel"><h2>API checks</h2><p className="muted"><code>/api/health</code>, <code>/api/exercises</code>, <code>/api/history</code>, <code>/api/exercise-history?exerciseId=...</code></p></div></section>}
  </main><nav className="bottomNav six"><button className={tab==="today"?"active":""} onClick={()=>setTab("today")}>Today</button><button className={tab==="workout"?"active":""} onClick={()=>setTab("workout")}>Workout</button><button className={tab==="library"||tab==="exerciseHistory"?"active":""} onClick={()=>setTab("library")}>Library</button><button className={tab==="progress"?"active":""} onClick={()=>setTab("progress")}>Progress</button><button className={tab==="cycle"?"active":""} onClick={()=>setTab("cycle")}>Cycle</button><button className={tab==="rules"?"active":""} onClick={()=>setTab("rules")}>Check</button></nav></div>
}

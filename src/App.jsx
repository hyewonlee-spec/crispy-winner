import React, { useEffect, useMemo, useState } from "react";
import { installLocalApi } from "./localApi";
import { Activity, AlertTriangle, BarChart3, CalendarDays, CalendarPlus, CheckCircle2, ChevronDown, ChevronUp, Dumbbell, History, Library, Loader2, Moon, Plus, RotateCcw, Save, Search, Soup, Sparkles, StretchHorizontal, Trash2 } from "lucide-react";

const STORAGE_KEY = "muscle_royalty_draft";
const DRAFTS_KEY = "muscle_royalty_drafts";
const TRACK_CYCLE_KEY = "muscle_royalty_track_cycle";
const ACTIVE_WORKOUT_KEY = "muscle_royalty_active_workout";

const recommendedPlans = {
  1: { title: "Lower A", type: "Lower A", focus: "Glutes and hamstrings", exercises: ["Hip Thrust", "Dumbbell Romanian Deadlift", "Seated Hamstring Curl", "Leg Press", "Hip Abductor Machine", "Hip Adductor Machine", "Pallof Press", "Seated Heel Raise Partial Range"] },
  2: { title: "Upper A", type: "Upper A", focus: "Upper body strength", exercises: ["Chest-Supported Dumbbell Row", "Seated Cable Row — Neutral Grip", "Wide-Neutral Lat Pulldown", "Machine Chest Press", "Face Pull", "Rear Delt Fly", "Hammer Curl"] },
  3: { title: "Mobility + Cardio", type: "Mobility + Cardio", focus: "Mobility, core and conditioning", exercises: ["Bike", "Dead Bug", "Bird Dog", "Pallof Press", "Suitcase Carry", "Farmer Carry"] },
  4: { title: "Lower B", type: "Lower B", focus: "Machines and controlled strength", exercises: ["Leg Press", "Glute Bridge Machine", "Leg Extension", "Seated Hamstring Curl", "Cable Pull-Through", "Hip Abductor Machine", "Dead Bug"] },
  5: { title: "Upper B", type: "Upper B", focus: "Push/pull, arms, conditioning", exercises: ["Landmine Press", "One-Arm Cable Row", "Machine Chest Press", "Wide-Neutral Lat Pulldown", "Cable Lateral Raise", "Rope Triceps Pressdown", "Hammer Curl", "Farmer Carry"] },
};

const categoryOptions = ["Lower Body","Upper Pull","Upper Push","Arms","Core","Conditioning","Custom"];
const statusOptions = ["Recommended","Caution","Avoid for now","Later phase","Custom"];
const movementOptions = ["Hip Extension","Knee Dominant","Knee Flexion","Hip Abduction","Hip Adduction","Hip Hinge","Knee Extension","Single Leg","Squat","Horizontal Pull","Vertical Pull","Scapular Control","Horizontal Push","Angled Press","Elbow Extension","Elbow Flexion","Anti-Extension","Lateral Core","Anti-Rotation","Carry","Balance","Cardio","Conditioning","Custom"];

function todayIso(){return new Date().toISOString().slice(0,10)}
function uid(){return crypto?.randomUUID?crypto.randomUUID():String(Date.now()+Math.random())}
function num(v,f=0){const n=Number(v);return Number.isFinite(n)?n:f}
function defaultSet(i=1){return {setNumber:i,weight:"",weightUnit:"kg",reps:"",completed:true,notes:""}}
function makeExercise(ex,source="Added"){const targetSets=Math.max(1,num(ex.defaultSets,3));return{localId:uid(),exerciseId:ex.id,name:ex.exercise,source,category:ex.category,status:ex.status,coachNote:ex.coachNote,targetSets,targetReps:ex.defaultReps||"",previous:null,history:null,notes:"",collapsed:false,sets:Array.from({length:targetSets},(_,i)=>defaultSet(i+1))}}

function Spinner({on}){return on?<Loader2 size={16} className="spin"/>:null}
function Button({children,onClick,variant="primary",busy=false,disabled=false,full=false}){return <button className={`${variant} ${full?"full":""}`} disabled={busy||disabled} onClick={(e)=>{e.currentTarget.classList.add("ack");setTimeout(()=>e.currentTarget.classList.remove("ack"),260);onClick&&onClick(e)}}>{busy&&<Spinner on/>}{children}</button>}
function Toast({toast,onClose}){return toast.message?<div className={`toast ${toast.kind}`}><span>{toast.message}</span><button onClick={onClose}>×</button></div>:null}
function Slider({label,value,setValue,lowGood=true,midLabel=false}){return <label className="slider"><div className="row"><span>{label}</span><b>{value}</b></div><input type="range" min="0" max="10" value={value} onChange={e=>setValue(Number(e.target.value))} onPointerUp={e=>{e.currentTarget.classList.add("ack");setTimeout(()=>e.currentTarget.classList.remove("ack"),260)}}/><div className={midLabel?"rangeLabels three":"rangeLabels"}><span>{lowGood?"low":"poor"}</span>{midLabel&&<span>{midLabel}</span>}<span>{lowGood?"high":"great"}</span></div></label>}
function Stat({label,value}){return <div className="stat"><p>{label}</p><strong>{value??"—"}</strong></div>}
function getSessionDateValue(session){
  if(!session?.date) return null;
  const d=new Date(session.date + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function sessionsInLastDays(sessions,days){
  const now=new Date();
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  return (sessions||[]).filter(s=>{
    const d=getSessionDateValue(s);
    if(!d) return false;
    const diff=(today-d)/(1000*60*60*24);
    return diff>=0 && diff<days;
  });
}

function avgMetric(arr,key){
  const vals=(arr||[]).map(s=>s[key]).filter(v=>typeof v==="number");
  return vals.length?Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10:"—";
}

function ProgressLineChart({title,data,keyName}){
  const now=new Date();
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const days=Array.from({length:21},(_,i)=>{
    const d=new Date(today);
    d.setDate(today.getDate()-(20-i));
    return d;
  });
  const dayKey=(d)=>d.toISOString().slice(0,10);
  const byDay=new Map();

  (data||[]).forEach(s=>{
    if(!s.date || typeof s[keyName] !== "number") return;
    const key=s.date;
    if(!byDay.has(key)) byDay.set(key,[]);
    byDay.get(key).push(s[keyName]);
  });

  const values=days.map(d=>{
    const vals=byDay.get(dayKey(d))||[];
    if(!vals.length) return null;
    return Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10;
  });

  const w=320,h=150,padL=34,padR=12,padT=14,padB=24;
  const xFor=(i)=>padL+(i*(w-padL-padR))/(days.length-1);
  const yFor=(v)=>padT+((10-v)/9)*(h-padT-padB);
  const points=values.map((v,i)=>v===null?null:(xFor(i)+","+yFor(Math.max(1,Math.min(10,v)))));

  const segments=[];
  let current=[];
  points.forEach(point=>{
    if(point){current.push(point)}
    else if(current.length){segments.push(current);current=[]}
  });
  if(current.length)segments.push(current);

  return <div className="chart progressReportChart">
    <h3>{title}</h3>
    <svg viewBox={"0 0 "+w+" "+h} className="lineChart progressLineChart" preserveAspectRatio="none">
      {[1,2,3,4,5,6,7,8,9,10].map(n=><line key={"h-"+n} x1={padL} x2={w-padR} y1={yFor(n)} y2={yFor(n)} className="gridLine horizontal"/>)}
      {days.map((_,i)=><line key={"v-"+i} x1={xFor(i)} x2={xFor(i)} y1={padT} y2={h-padB} className="gridLine vertical"/>)}
      <text x="8" y={yFor(10)+4} className="axisText">10</text>
      <text x="14" y={yFor(1)+4} className="axisText">1</text>
      {segments.map((seg,i)=><polyline key={i} points={seg.join(" ")} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>)}
      {points.map((point,i)=>{
        if(!point)return null;
        const [x,y]=point.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="4"/>
      })}
    </svg>
  </div>
}

function WeeklyMonthlyOverview({sessions}){
  const week=sessionsInLastDays(sessions,7);
  const month=sessionsInLastDays(sessions,28);
  return <div className="overviewGrid">
    <div className="panel miniOverview">
      <h3>Weekly overview</h3>
      <p>Avg energy level: <b>{avgMetric(week,"energy")}</b></p>
      <p>Avg stress level: <b>{avgMetric(week,"stress")}</b></p>
      <p>Avg sleep quality: <b>{avgMetric(week,"sleep")}</b></p>
    </div>
    <div className="panel miniOverview">
      <h3>Monthly overview</h3>
      <p>Avg energy level: <b>{avgMetric(month,"energy")}</b></p>
      <p>Avg stress level: <b>{avgMetric(month,"stress")}</b></p>
      <p>Avg sleep quality: <b>{avgMetric(month,"sleep")}</b></p>
    </div>
  </div>
}

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

  const latestStartLog = (logs || [])
    .filter((log) => log.periodStartDate === periodStartDate)
    .sort((a, b) => String(b.date || b.periodStartDate).localeCompare(String(a.date || a.periodStartDate)))[0];
  const hasOpenPeriod = latestStartLog && !latestStartLog.periodEndDate;

  const averageCycleLength = calculateAverageCycleLength(logs);
  const averagePeriodLength = calculateAveragePeriodLength(logs);
  const rawDaysSinceStart = daysBetween(periodStartDate, date);

  let cycleDay = rawDaysSinceStart === null ? null : ((rawDaysSinceStart % averageCycleLength) + averageCycleLength) % averageCycleLength + 1;

  let nextPeriodStart = addDays(periodStartDate, averageCycleLength);
  while (nextPeriodStart && daysBetween(date, nextPeriodStart) < 0) {
    nextPeriodStart = addDays(nextPeriodStart, averageCycleLength);
  }

  const ovulationDate = addDays(nextPeriodStart, -14);
  const daysUntilNextPeriod = daysBetween(date, nextPeriodStart);
  const daysUntilOvulation = daysBetween(date, ovulationDate);

  let phase = "Luteal";
  const ovulationCycleDay = averageCycleLength - 13;

  if (hasOpenPeriod) {
    phase = "Shark-week";
  } else if (cycleDay <= Math.max(3, Math.min(7, Math.round(averagePeriodLength || 5)))) {
    phase = "Shark-week";
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
    Number(cycle.sleepDisruption || 0) +
    Number(cycle.moodSwings || cycle.mood || 0) +
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
    return "Recovery / low-intensity focus";
  }

  if (
    symptomLoad >= 20 ||
    cycle.cramps >= 5 ||
    cycle.moodSwings >= 5 || cycle.mood >= 6 || cycle.bloating >= 6 || cycle.indigestion >= 6
  ) {
    return "Reduce load 10–20%";
  }

  if (cycle.phase === "Shark-week" && cycle.bleedingFlow !== "None") {
    return "Technique / moderate strength";
  }

  if (
    cycle.phase === "Luteal" &&
    (cycle.sleepDisruption >= 4 || cycle.moodSwings >= 4 || cycle.mood >= 4 || cycle.fatigue >= 4)
  ) {
    return "Moderate intensity + recovery";
  }

  return "Normal training";
}

function cycleCoachText(cycle) {
  const rec = cycleTrainingRecommendation(cycle);

  if (rec === "Recovery / low-intensity focus") {
    return "Prioritise walking, mobility, and gentle machine work. Skip max-effort sets today.";
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

function formatAuLongDate(value) {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

export default function App(){
  useEffect(()=>{installLocalApi()},[]);
  const [tab,setTab]=useState("today");
  const [exercises,setExercises]=useState([]);
  const [history,setHistory]=useState({sessions:[],summary:null,error:""});
  const [exerciseHistory,setExerciseHistory]=useState(null);
  const [selectedHistoryExercise,setSelectedHistoryExercise]=useState(null);
  const [templates,setTemplates]=useState([]);
  const [drafts,setDrafts]=useState([]);
  const [toast,setToast]=useState({message:"",kind:"info"});
  const [busy,setBusy]=useState({library:false,save:false,custom:false,history:false,exerciseHistory:false,template:false});
  const [trackCycle,setTrackCycle]=useState(()=>localStorage.getItem(TRACK_CYCLE_KEY));
  const [query,setQuery]=useState(""); const [categoryFilter,setCategoryFilter]=useState("All"); const [statusFilter,setStatusFilter]=useState("All");
  const [builderMode,setBuilderMode]=useState("recommended");
  const [startPrompt,setStartPrompt]=useState(null);
  const [customWorkoutPrompt,setCustomWorkoutPrompt]=useState(false);
  const [workoutChooserPrompt,setWorkoutChooserPrompt]=useState(false);
  const [dayRecordedToday,setDayRecordedToday]=useState(false);
  const [showTodaySymptoms,setShowTodaySymptoms]=useState(false);
  const [endPrompt,setEndPrompt]=useState(false);
  const [activeWorkout,setActiveWorkout]=useState(null);
  const [date,setDate]=useState(todayIso()); const [type,setType]=useState("Lower A"); const [workoutSource,setWorkoutSource]=useState("Recommended");
  const [sleep,setSleep]=useState(6),[energy,setEnergy]=useState(6),[stress,setStress]=useState(4);
  const [notes,setNotes]=useState(""); const [workoutExercises,setWorkoutExercises]=useState([]);
  const [custom,setCustom]=useState({exercise:"",category:"Custom",equipment:"",movementPattern:"Custom",primaryMuscles:"",status:"Custom",riskFlags:"",defaultSets:3,defaultReps:"10",coachNote:""});
  const [cycle,setCycle]=useState({date:todayIso(),dailyEntryDate:todayIso(),periodStartDate:"",periodEndDate:"",bleedingFlow:[],cramps:0,sleepDisruption:0,moodSwings:0,fatigue:0,headacheMigraine:0,saltCravings:0,sugarCravings:0,indigestion:0,bloating:0,constipation:0,tenderBreasts:0,acne:0,dizziness:0,notes:""});
  const [periodDateMode,setPeriodDateMode]=useState(null);
  const [pendingPeriodDate,setPendingPeriodDate]=useState(todayIso());
  const [showPreviousPeriodBox,setShowPreviousPeriodBox]=useState(false);
  const [previousPeriod,setPreviousPeriod]=useState({start:"",end:""});
  const [cycleLogs,setCycleLogs]=useState([]);
  const [cycleStatus,setCycleStatus]=useState("");

  function show(message,kind="info"){setToast({message,kind});setTimeout(()=>setToast(t=>t.message===message?{message:"",kind:"info"}:t),3500)}
  function chooseCycleTracking(choice){localStorage.setItem(TRACK_CYCLE_KEY,choice);setTrackCycle(choice);if(choice==="yes")loadCycleLogs(false);show(choice==="yes"?"Cycle tracking enabled.":"Cycle tracking hidden.","success")}
  function changeCycleTracking(choice){localStorage.setItem(TRACK_CYCLE_KEY,choice);setTrackCycle(choice);if(choice==="yes")loadCycleLogs(false);show(choice==="yes"?"Cycle tracking enabled.":"Cycle tracking hidden.","success")}
  function toggleSymptom(key){setCycle(c=>({...c,[key]:Number(c[key]||0)>0?0:6}))}
  function toggleFlow(option){
    setCycle(c=>{
      const current=Array.isArray(c.bleedingFlow)?c.bleedingFlow:[];
      const exists=current.includes(option);
      let next=exists?current.filter(item=>item!==option):[...current, option];
      if(next.length>2) next=next.slice(next.length-2);
      return {...c,bleedingFlow:next};
    });
  }
  function draftPayload(){return{date,type,workoutSource,sleep,energy,stress,notes,exercises:workoutExercises}}
  function applyDraft(d){setDate(d.date||todayIso());setType(d.type||"Custom Workout");setWorkoutSource(d.workoutSource||"Custom");setSleep(d.sleep??6);setEnergy(d.energy??6);setStress(d.stress??4);setNotes(d.notes||"");setWorkoutExercises(d.exercises||[]);}

  useEffect(()=>{try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)applyDraft(JSON.parse(raw));const ds=localStorage.getItem(DRAFTS_KEY);if(ds)setDrafts(JSON.parse(ds));const aw=localStorage.getItem(ACTIVE_WORKOUT_KEY);if(aw)setActiveWorkout(JSON.parse(aw))}catch{} loadExercises(false); loadHistory(false); loadTemplates(false); if(localStorage.getItem(TRACK_CYCLE_KEY)==="yes") loadCycleLogs(false)},[]);
  useEffect(()=>{if(trackCycle==="no" && tab==="cycle") setTab("today")},[trackCycle,tab]);
  useEffect(()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(draftPayload()))},[date,type,workoutSource,sleep,energy,stress,notes,workoutExercises]);
  useEffect(()=>{localStorage.setItem(DRAFTS_KEY,JSON.stringify(drafts))},[drafts]);
  useEffect(()=>{if(activeWorkout){localStorage.setItem(ACTIVE_WORKOUT_KEY,JSON.stringify(activeWorkout))}else{localStorage.removeItem(ACTIVE_WORKOUT_KEY)}},[activeWorkout]);

  const readiness=useMemo(()=>Math.round(Math.max(0,Math.min(30, sleep + energy + (10 - stress)))),[sleep,energy,stress]);
  const readinessZone=readiness>=22?"Green":readiness>=14?"Amber":"Red";
  const readinessMeaning=readinessZone==="Green"
    ?"Green means train as planned."
    :readinessZone==="Amber"
      ?"Amber means modify today: reduce load or volume."
      :"Red means recovery or gentle movement only.";
  const currentCycle=useMemo(()=>{const start=cycle.periodStartDate||latestPeriodStart(cycleLogs,"");const calc=calculateCycleDashboard(date,start,cycleLogs);const merged={...cycle,...calc};return{...merged,periodStartDate:start,trainingRecommendation:cycleTrainingRecommendation(merged),coachText:cycleCoachText(merged)}},[date,cycle,cycleLogs]);
  const coachNote=readinessZone==="Green"?"Green day: train as planned.":readinessZone==="Amber"?"Amber day: reduce load or volume and keep the session simple.":"Red day: recovery, light movement, or rest.";
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
      const payload={date,type:p.type,workoutSource:"Recommended",readiness,sleep,energy,stress,notes,exercises:[],action:"start"};
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
      const payload={date,type,workoutSource,readiness,sleep,energy,stress,notes,exercises:[],action:"start"};
      const r=await fetch("/api/workouts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||"Could not start workout");
      setActiveWorkout({sessionId:j.sessionId,sessionUrl:j.sessionUrl,startTime:new Date().toISOString(),type,source:workoutSource});
      setTab("workout"); show("Workout started.","success");
    }catch(e){show(`Start failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,save:false}))}
  }
  async function endTodayWorkout(){
    setEndPrompt(false);
    const payload={date,type,workoutSource,readiness,sleep,energy,stress,notes,exercises:workoutExercises,existingSessionId:activeWorkout?.sessionId,existingSessionUrl:activeWorkout?.sessionUrl};
    setBusy(b=>({...b,save:true})); show("Recording workout…","info");
    try{
      const r=await fetch("/api/workouts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||"Save failed");
      setActiveWorkout(null); setTab("today"); await loadHistory(false); localStorage.removeItem(STORAGE_KEY);
      show("Today’s workout has been recorded, WELL DONE!","success");
      window.setTimeout(()=>alert("Today’s workout has been recorded, WELL DONE!"),100);
    }catch(e){show(`Workout end failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,save:false}))}
  }
  function addExercise(ex,source="Added"){if(workoutSource==="Recommended")setWorkoutSource("Modified Recommended");const next=makeExercise(ex,source);setWorkoutExercises(prev=>[...prev,next]);setTab("workout");show(`${ex.exercise} added.`,"success");setTimeout(()=>hydratePrevious(next),100)}
  function applyRecommendedPlan(key){setStartPrompt(key)}
  function buildCustomWorkout(){setBuilderMode("custom");setCustomWorkoutPrompt(true)}
  async function startCustomWorkout(){
    setCustomWorkoutPrompt(false);
    setBuilderMode("custom");
    setType("Custom Workout");
    setWorkoutSource("Custom");
    setWorkoutExercises([]);
    setBusy(b=>({...b,save:true}));
    try{
      const payload={date,type:"Custom Workout",workoutSource:"Custom",readiness,sleep,energy,stress,notes,exercises:[],action:"start"};
      const r=await fetch("/api/workouts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||"Could not start workout");
      setActiveWorkout({sessionId:j.sessionId,sessionUrl:j.sessionUrl,startTime:new Date().toISOString(),type:"Custom Workout",source:"Custom"});
      setTab("workout");
      show("DIY workout started.","success");
    }catch(e){show(`Start failed: ${e.message}`,"error")}
    finally{setBusy(b=>({...b,save:false}))}
  }
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
          bleedingFlow:Array.isArray(latest.bleedingFlow)?latest.bleedingFlow:(latest.bleedingFlow?String(latest.bleedingFlow).split(",").map(x=>x.trim()).filter(Boolean):c.bleedingFlow),
          cramps:latest.cramps??c.cramps,
          
          sleepDisruption:latest.sleepDisruption??c.sleepDisruption,
          moodSwings:latest.moodSwings??latest.mood??c.moodSwings,
          fatigue:latest.fatigue??c.fatigue,
          headacheMigraine:latest.headacheMigraine??c.headacheMigraine,
          saltCravings:latest.saltCravings??c.saltCravings,
          sugarCravings:latest.sugarCravings??c.sugarCravings,
          indigestion:latest.indigestion??c.indigestion,
          bloating:latest.bloating??c.bloating,
          constipation:latest.constipation??c.constipation,
          tenderBreasts:latest.tenderBreasts??c.tenderBreasts,
          acne:latest.acne??c.acne,
          dizziness:latest.dizziness??c.dizziness
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
    setPendingPeriodDate(mode==="start" ? todayIso() : (cycle.periodEndDate || todayIso()));
  }

  function resetPeriodFlow(){
    setCycle(c=>({...c,periodStartDate:"",periodEndDate:"",bleedingFlow:[]}));
    setPeriodDateMode(null);
    show("Period flow reset.","success");
  }

  function confirmPeriodDate(){
    if(!pendingPeriodDate) return show("Choose a date first.","error");
    if(periodDateMode==="start"){
      setCycle(c=>({...c,periodStartDate:pendingPeriodDate,periodEndDate:"",dailyEntryDate:pendingPeriodDate,bleedingFlow:Array.isArray(c.bleedingFlow)?c.bleedingFlow:[]}));
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
    setCycle(c=>({...c,periodStartDate:chosen,dailyEntryDate:c.dailyEntryDate||chosen,bleedingFlow:Array.isArray(c.bleedingFlow)?c.bleedingFlow:[]}));
    show(`Period start marked: ${chosen}`,"success");
  }

  function markPeriodEnded(useToday=true){
    const chosen = useToday ? todayIso() : cycle.periodEndDate;
    if(!chosen) return show("Choose a period end date first.","error");
    setCycle(c=>({...c,periodEndDate:chosen,dailyEntryDate:c.dailyEntryDate||chosen}));
    show(`Period end marked: ${chosen}`,"success");
  }

  async function savePreviousPeriodDates(){
    if(!previousPeriod.start || !previousPeriod.end) return show("Choose both start and end dates.","error");
    const payload={
      ...cycle,
      date:previousPeriod.end,
      periodStartDate:previousPeriod.start,
      periodEndDate:previousPeriod.end,
      periodLength:inclusiveDays(previousPeriod.start,previousPeriod.end),
      cycleLength:currentCycle.averageCycleLength,
      cycleDay:null,
      cyclePhase:"",
      trainingRecommendation:"Normal training",
      bleedingFlow:[]
    };
    try{
      const r=await fetch("/api/cycle",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||"Previous period save failed");
      setShowPreviousPeriodBox(false); setPreviousPeriod({start:"",end:""});
      await loadCycleLogs(false);
      show("Cycle saved.","success");
    }catch(e){show(`Previous period save failed: ${e.message}`,"error")}
  }

  async function archiveCycleLog(id){
    if(!id) return;
    const ok=window.confirm("Delete this cycle entry?");
    if(!ok) return;
    try{
      const r=await fetch(`/api/cycle?id=${encodeURIComponent(id)}`,{method:"DELETE"});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||"Delete failed");
      show("Cycle entry deleted.","success");
      await loadCycleLogs(false);
    }catch(e){
      show(`Delete failed: ${e.message}`,"error");
    }
  }

  async function saveCycleCheck(){
    const payload={
      ...cycle,
      date:todayIso(),
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
      setCycle(c=>({...c,bleedingFlow:[],headacheMigraine:0,saltCravings:0,sugarCravings:0,cramps:0,indigestion:0,bloating:0,constipation:0,tenderBreasts:0,acne:0,dizziness:0,sleepDisruption:0,moodSwings:0,fatigue:0,notes:""}));
      await loadCycleLogs(false)
    }catch(e){
      show(`Cycle save failed: ${e.message}`,"error")
    }
  }

  async function saveWorkout(readinessOnly=false){const payload={date,type:readinessOnly?"Readiness only":type,workoutSource:readinessOnly?"Readiness only":workoutSource,readiness,sleep,energy,stress,notes,exercises:readinessOnly?[]:workoutExercises};setBusy(b=>({...b,save:true}));show("Saving to Notion…","info");try{const r=await fetch("/api/workouts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const j=await r.json();if(!r.ok)throw new Error(j.error||"Save failed");show(`Saved. ${j.workoutExercisesCreated} exercises, ${j.setsCreated} sets.`,"success");await loadHistory(false);if(!readinessOnly)localStorage.removeItem(STORAGE_KEY)}catch(e){show(`Saved draft locally, Notion failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,save:false}))}}
  async function recordDayAndPromptWorkout(){
    if(dayRecordedToday){
      setWorkoutChooserPrompt(true);
      return;
    }
    await saveWorkout(true);
    setDayRecordedToday(true);
    setWorkoutChooserPrompt(true);
  }
  async function saveTemplate(){if(!workoutExercises.length)return show("Add exercises before saving a template.","error");setBusy(b=>({...b,template:true}));try{const name=prompt("Template name?")||type;const r=await fetch("/api/templates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,type,focus:notes,exercises:workoutExercises})});const j=await r.json();if(!r.ok)throw new Error(j.error||"Template save failed");show(`Template saved: ${j.name}`,"success");await loadTemplates(false)}catch(e){show(`Template failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,template:false}))}}
  async function showExerciseHistory(ex){setSelectedHistoryExercise(ex);setTab("exerciseHistory");setBusy(b=>({...b,exerciseHistory:true}));try{const r=await fetch(`/api/exercise-history?exerciseId=${ex.id}`);const j=await r.json();if(!r.ok)throw new Error(j.error||"History failed");setExerciseHistory(j)}catch(e){show(`History failed: ${e.message}`,"error")}finally{setBusy(b=>({...b,exerciseHistory:false}))}}

  return <div className={`app ${activeWorkout ? "activeWorkoutMode" : ""}`}><Toast toast={toast} onClose={()=>setToast({message:"",kind:"info"})}/>
      {trackCycle===null&&<div className="modalShade"><div className="modalBox menstruationChoiceModal"><h2>Do you want to track menstruation?</h2><p>This controls whether cycle tracking appears in the app.</p><div className="twoCol"><Button variant="secondary" onClick={()=>chooseCycleTracking("no")}>No</Button><Button variant="primary" onClick={()=>chooseCycleTracking("yes")}>Yes</Button></div></div></div>}
      {startPrompt&&<div className="modalShade"><div className="modalBox"><h2>Are you ready to begin your workout?</h2><p>{recommendedPlans[startPrompt]?.title}</p><div className="twoCol"><Button variant="secondary" onClick={()=>setStartPrompt(null)}>Not yet</Button><Button variant="primary" busy={busy.save} onClick={()=>startWorkoutFromPlan(startPrompt)}>Yes</Button></div></div></div>}
      {customWorkoutPrompt&&<div className="modalShade"><div className="modalBox"><h2>Are you ready to begin your workout?</h2><p>Build your own workout</p><div className="twoCol"><Button variant="secondary" onClick={()=>setCustomWorkoutPrompt(false)}>Not yet</Button><Button variant="primary" busy={busy.save} onClick={startCustomWorkout}>Yes</Button></div></div></div>}
      {workoutChooserPrompt&&<div className="modalShade"><div className="modalBox workoutChooserModal"><h2>Let’s begin your workout</h2><div className="chooserActions"><Button variant="secondary" full onClick={()=>{setWorkoutChooserPrompt(false);buildCustomWorkout()}}>Build your own</Button></div><div className="chooserPlanList">{Object.entries(recommendedPlans).map(([k,p])=><button key={k} className="plan" onClick={()=>{setWorkoutChooserPrompt(false);setStartPrompt(k)}}><span><b>{p.title}</b><small>{p.focus}</small></span><span>{p.exercises.length}</span></button>)}</div><Button variant="ghost" full onClick={()=>{setWorkoutChooserPrompt(false);setDayRecordedToday(true)}}>Not yet</Button></div></div>}
      {endPrompt&&<div className="modalShade"><div className="modalBox"><h2>Are you sure?</h2><div className="twoCol"><Button variant="secondary" onClick={()=>setEndPrompt(false)}>No</Button><Button variant="primary" busy={busy.save} onClick={endTodayWorkout}>Yes</Button></div></div></div>}
      <main className="shell"><header className="header"><div><p className="overline">Muscle Royalty</p><h1>Dashboard</h1></div><button className="mini" onClick={()=>loadExercises(true)} disabled={busy.library}><Spinner on={busy.library}/> Sync</button></header>
    {tab==="today"&&<section className="stack dashboardToday">
  <div className="panel readinessCheckPanel">
    <div className="sectionTitle"><CalendarDays size={20}/><h2>Condition checkpoint</h2></div>
    <div className="todayDatePlain">{formatAuLongDate(todayIso())}</div>
    <div className="readinessInputs">
      <Slider label="Sleep quality" value={sleep} setValue={setSleep} lowGood={false} midLabel="Okay"/>
      <Slider label="Energy level" value={energy} setValue={setEnergy} lowGood={false} midLabel="Okay"/>
      <Slider label="Stress level" value={stress} setValue={setStress} midLabel="Okay"/>
    </div>
  </div>

  {trackCycle==="yes"&&<button type="button" className="panel cycleTodayCard cycleTodayButton sharkWatchToday" onClick={()=>{setTab("cycle");setTimeout(()=>document.getElementById("cycle-check-in")?.scrollIntoView({behavior:"smooth",block:"start"}),80)}}>
    <div className="sectionTitle"><Sparkles size={20}/><h2>Shark watch</h2></div>
    <div className={`cyclePhase compact ${(currentCycle.phase||"").toLowerCase().replaceAll(" ","-")}`}>
      <h3>{currentCycle.phase}</h3>
      <strong className="trainingBubble">{currentCycle.trainingRecommendation}</strong>
    </div>
  </button>}



  

  <Button variant="primary" full busy={busy.save} onClick={recordDayAndPromptWorkout}><Save size={16}/> {dayRecordedToday ? "Start workout" : "Record and start workout"}</Button>

  
</section>}
    {tab==="workout"&&<section className="stack">
  <div className="panel workoutHeader">
    <div>
      {workoutSource==="Custom"
        ? <input className="workoutNameInput customWorkoutNameInput" value={type} onChange={e=>setType(e.target.value)} />
        : <h2 className="workoutDisplayTitle">{type}</h2>}
    </div>
  </div>

  {workoutExercises.length===0&&
    <div className="empty">
      <Dumbbell size={28}/>
      <h2>No exercises yet</h2>
      <p>Add exercises from the library or start with a recommended plan.</p>
      <Button full onClick={()=>setTab("library")}><Plus size={16}/> Add exercise</Button>
    </div>
  }

  {workoutExercises.map(ex=>
    <div className="panel exerciseCard" key={ex.localId}>
      <div className="exerciseTop noToggle">
        <div><h3>{ex.name}</h3></div>
        <button className="iconBtn" onClick={()=>removeExercise(ex.localId)}><Trash2 size={16}/></button>
      </div>

      <div className="setHeader noRpe"><span>Set</span><span>Weight</span><span>Reps</span><span></span></div>
      <div className="sets">
        {ex.sets.map((s,i)=>
          <div className="setRow noRpe" key={i}>
            <b>{i+1}</b>
            <input placeholder="kg" inputMode="decimal" value={s.weight} onChange={e=>updateSet(ex.localId,i,{weight:e.target.value})}/>
            <input placeholder="reps" inputMode="numeric" value={s.reps} onChange={e=>updateSet(ex.localId,i,{reps:e.target.value})}/>
            <button className="setDelete" onClick={()=>removeSet(ex.localId,i)}>×</button>
          </div>
        )}
      </div>

      <div className="fullAddSetRow">
        <Button variant="ghost" full onClick={()=>addSet(ex.localId)}><Plus size={16}/> Add set</Button>
      </div>
    </div>
  )}

  <Button className="workoutBottomAddExercise" variant="secondary" full onClick={()=>setTab("library")}><Plus size={16}/> Add exercise</Button>
  <Button variant="secondary" full busy={busy.template} disabled={!workoutExercises.length} onClick={saveTemplate}><Save size={16}/> Save workout</Button>

  {activeWorkout
    ? <Button variant="primary" full busy={busy.save} disabled={!workoutExercises.length} onClick={()=>setEndPrompt(true)}><Save size={16}/> End Today’s workout</Button>
    : <Button variant="primary" full busy={busy.save} disabled={!workoutExercises.length} onClick={startCurrentWorkout}><Save size={16}/> Start Today’s workout</Button>}
</section>}
    {tab==="library"&&<section className="stack"><div className="panel"><div className="sectionTitle"><Library size={20}/><h2>Exercise Library</h2></div><Button variant="secondary" full onClick={()=>document.getElementById("custom-exercise-form")?.scrollIntoView({behavior:"smooth"})}><Plus size={16}/> Add custom exercise to library</Button><div className="search"><Search size={16}/><input placeholder="Search exercises…" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="twoCol"><select className="input compact" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option>All</option>{categoryOptions.map(x=><option key={x}>{x}</option>)}</select><select className="input compact" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option>{statusOptions.map(x=><option key={x}>{x}</option>)}</select></div></div><div className="exerciseList">{filtered.map(e=><div className={`libraryItem ${e.status?.toLowerCase().replaceAll(" ","-")}`} key={e.id}><button onClick={()=>addExercise(e)}><div><b>{e.exercise}</b><p>{e.category} · {e.status}</p><small>{e.coachNote}</small></div><Plus size={18}/></button><button className="historyBtn" onClick={()=>showExerciseHistory(e)}><History size={16}/> History</button></div>)}</div><div className="panel" id="custom-exercise-form"><div className="sectionTitle"><Plus size={20}/><h2>Create custom exercise</h2></div><input className="input" placeholder="Exercise name" value={custom.exercise} onChange={e=>setCustom({...custom,exercise:e.target.value})}/><div className="twoCol"><select className="input" value={custom.category} onChange={e=>setCustom({...custom,category:e.target.value})}>{categoryOptions.map(x=><option key={x}>{x}</option>)}</select><select className="input" value={custom.status} onChange={e=>setCustom({...custom,status:e.target.value})}>{statusOptions.map(x=><option key={x}>{x}</option>)}</select></div><select className="input" value={custom.movementPattern} onChange={e=>setCustom({...custom,movementPattern:e.target.value})}>{movementOptions.map(x=><option key={x}>{x}</option>)}</select><input className="input" placeholder="Equipment, comma-separated" value={custom.equipment} onChange={e=>setCustom({...custom,equipment:e.target.value})}/><input className="input" placeholder="Primary muscles, comma-separated" value={custom.primaryMuscles} onChange={e=>setCustom({...custom,primaryMuscles:e.target.value})}/><div className="miniGrid"><label className="field"><span>Default sets</span><input value={custom.defaultSets} onChange={e=>setCustom({...custom,defaultSets:e.target.value})}/></label><label className="field"><span>Default reps</span><input value={custom.defaultReps} onChange={e=>setCustom({...custom,defaultReps:e.target.value})}/></label></div><textarea className="notes small" placeholder="Coach note" value={custom.coachNote} onChange={e=>setCustom({...custom,coachNote:e.target.value})}/><Button full busy={busy.custom} onClick={createCustomExercise}><Plus size={16}/> Save custom exercise</Button></div></section>}
    {tab==="progress"&&<section className="stack progressReport">
  <div className="panel">
    <div className="sectionTitle"><BarChart3 size={20}/><h2>Progress Report</h2></div>
    <Button variant="secondary" full busy={busy.history} onClick={()=>loadHistory(true)}>Refresh progress</Button>
    {history.error&&<p className="errorText">{history.error}</p>}
  </div>

  <WeeklyMonthlyOverview sessions={history.sessions}/>

  <ProgressLineChart title="Energy level" data={history.sessions} keyName="energy"/>
  <ProgressLineChart title="Stress level" data={history.sessions} keyName="stress"/>
  <ProgressLineChart title="Sleep quality" data={history.sessions} keyName="sleep"/>
</section>}
    {tab==="exerciseHistory"&&<section className="stack"><div className="panel"><div className="sectionTitle"><History size={20}/><h2>{selectedHistoryExercise?.exercise||"Exercise"} History</h2></div><Button variant="secondary" full onClick={()=>setTab("library")}>Back to library</Button></div>{busy.exerciseHistory&&<div className="panel"><Spinner on/> Loading history…</div>}{exerciseHistory&&<><div className="statsGrid"><Stat label="Entries" value={exerciseHistory.summary?.entries}/><Stat label="Sets" value={exerciseHistory.summary?.totalSets}/><Stat label="Best weight" value={exerciseHistory.summary?.bestSet?.weight}/><Stat label="Best reps" value={exerciseHistory.summary?.bestSet?.reps}/></div><div className="panel"><h2>Past sets</h2><div className="sessionList">{exerciseHistory.sets.map(s=><div className="sessionItem" key={s.id}><div className="row"><b>{s.setEntry}</b><span className="pill">{s.weight??"—"}{s.weightUnit||"kg"} × {s.reps??"—"}</span></div><p className="muted">RPE {s.rpe??"—"} · {s.workoutExerciseName}</p></div>)}</div></div></>}</section>}
    {trackCycle==="yes"&&tab==="cycle"&&<section className="stack">
  <div className="panel cycleTodayCard yourCycleCard">
    <div className="sectionTitle"><Sparkles size={20}/><h2>Your cycle</h2></div>
    <div className={"cyclePhase compact yourCyclePhase "+((currentCycle.phase||"").toLowerCase().replaceAll(" ","-"))}>
      <h3>{currentCycle.phase}</h3>
      <div className="cycleHeroGrid todayCycleGrid">
        <div className="nextPeriodBox"><span>Next period is due</span><b>{formatDays(currentCycle.daysUntilNextPeriod)} days</b></div>
      </div>
      <strong className="trainingBubble">{currentCycle.trainingRecommendation}</strong>
    </div>
    <div className="centerControl periodActionButton">
      {!cycle.periodStartDate || cycle.periodEndDate
        ? <Button variant="primary" full onClick={()=>openPeriodDateBox("start")}>Period started</Button>
        : <Button variant="primary" full onClick={()=>openPeriodDateBox("end")}>Period ended</Button>}
    </div>
    {periodDateMode&&(
      <div className="periodDatePopup">
        <h3>{periodDateMode==="start" ? "Confirm period start date" : "Confirm period end date"}</h3>
        <input type="date" value={pendingPeriodDate} onChange={e=>setPendingPeriodDate(e.target.value)}/>
        <div className="periodPopupActions">
          <button type="button" className="ghost smallButton" onClick={()=>setPeriodDateMode(null)}>Cancel</button>
          <button type="button" className="primary smallButton" onClick={confirmPeriodDate}>Save</button>
        </div>
      </div>
    )}
  </div>

  <div className="panel previousCyclesPanel">
    <div className="previousCyclesHeader"><h2>Previous cycles</h2><button type="button" className="plusCycleButton" onClick={()=>setShowPreviousPeriodBox(v=>!v)}>+</button></div>
    {showPreviousPeriodBox&&<div className="previousCycleForm"><div className="previousCycleDates"><label className="field"><span>Start date</span><input type="date" value={previousPeriod.start} onChange={e=>setPreviousPeriod({...previousPeriod,start:e.target.value})}/></label><label className="field"><span>End date</span><input type="date" value={previousPeriod.end} onChange={e=>setPreviousPeriod({...previousPeriod,end:e.target.value})}/></label></div><div className="centerControl savePreviousCycleButton"><Button variant="primary" full onClick={savePreviousPeriodDates}>Save cycle</Button></div></div>}
    <div className="sessionList">
      {cycleLogs.filter(log=>log.periodStartDate).length===0&&<div className="emptyMini">No previous cycles yet.</div>}
      {cycleLogs.filter(log=>log.periodStartDate).slice(0,4).map(log=>
        <div className="sessionItem" key={log.id}>
          <div className="row">
            <b>{formatAuDate(log.periodStartDate)} – {formatAuDate(log.periodEndDate)}</b>
            <button className="linkBtn dangerLink" onClick={()=>archiveCycleLog(log.id)}>Delete</button>
          </div>
          <p className="muted">{log.cyclePhase||"Cycle"} · {log.periodLength??"—"} days</p>
        </div>
      )}
    </div>
  </div>

  <div className="panel cyclePanel" id="cycle-check-in">
    <div className="sectionTitle"><Activity size={20}/><h2>Cycle-aware check-in</h2></div>
    <div className="centeredDatePlain">{formatAuDate(todayIso())}</div>

    <label className="field"><span>Flow</span>
      <div className="flowBubbleGrid twoLineFlow">
        {["Spotting","Light","Medium","Heavy","Clots"].map(option=>
          <button
            type="button"
            key={option}
            className={(Array.isArray(cycle.bleedingFlow)?cycle.bleedingFlow:[]).includes(option)?"flowBubble active":"flowBubble"}
            onClick={()=>toggleFlow(option)}
          >
            {option}
          </button>
        )}
      </div>
    </label>

    <div className="symptomButtonGrid compactSymptoms">
      <button type="button" className={cycle.headacheMigraine>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("headacheMigraine")}><span>Headache / migraine</span><b>{cycle.headacheMigraine>0?"Yes":"No"}</b></button>
      <button type="button" className={cycle.saltCravings>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("saltCravings")}><span>Salt cravings</span><b>{cycle.saltCravings>0?"Yes":"No"}</b></button>
      <button type="button" className={cycle.sugarCravings>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("sugarCravings")}><span>Sugar cravings</span><b>{cycle.sugarCravings>0?"Yes":"No"}</b></button>
      <button type="button" className={cycle.cramps>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("cramps")}><span>Cramps</span><b>{cycle.cramps>0?"Yes":"No"}</b></button>
      <button type="button" className={cycle.indigestion>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("indigestion")}><span>Indigestion</span><b>{cycle.indigestion>0?"Yes":"No"}</b></button>
      <button type="button" className={cycle.bloating>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("bloating")}><span>Bloating</span><b>{cycle.bloating>0?"Yes":"No"}</b></button>
      <button type="button" className={cycle.constipation>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("constipation")}><span>Constipation</span><b>{cycle.constipation>0?"Yes":"No"}</b></button>
      <button type="button" className={cycle.tenderBreasts>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("tenderBreasts")}><span>Tender breasts</span><b>{cycle.tenderBreasts>0?"Yes":"No"}</b></button>
      <button type="button" className={cycle.acne>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("acne")}><span>Acne</span><b>{cycle.acne>0?"Yes":"No"}</b></button>
      <button type="button" className={cycle.dizziness>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("dizziness")}><span>Dizziness</span><b>{cycle.dizziness>0?"Yes":"No"}</b></button>
      <button type="button" className={cycle.sleepDisruption>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("sleepDisruption")}><span>Sleep disruption</span><b>{cycle.sleepDisruption>0?"Yes":"No"}</b></button>
      <button type="button" className={cycle.moodSwings>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("moodSwings")}><span>Mood swings</span><b>{cycle.moodSwings>0?"Yes":"No"}</b></button>
      <button type="button" className={cycle.fatigue>0?"symptomButton active":"symptomButton"} onClick={()=>toggleSymptom("fatigue")}><span>Fatigue</span><b>{cycle.fatigue>0?"Yes":"No"}</b></button>
    </div>

    <textarea className="notes small" placeholder="Daily cycle notes…" value={cycle.notes} onChange={e=>setCycle({...cycle,notes:e.target.value})}/>
    <div className="centerControl saveCheckinButton"><Button variant="primary" full onClick={saveCycleCheck}>Save today’s check-in</Button></div>
    {cycleStatus&&<p className="errorText">{cycleStatus}</p>}
  </div>
</section>}{tab==="rules"&&<section className="stack morePage">
  <div className="panel">
    <div className="sectionTitle"><Sparkles size={20}/><h2>Shark-week setting</h2></div>
    <div className="twoCol">
      <Button variant={trackCycle==="yes"?"primary":"secondary"} onClick={()=>changeCycleTracking("yes")}>Shark-watch</Button>
      <Button variant={trackCycle==="no"?"primary":"secondary"} onClick={()=>changeCycleTracking("no")}>Hide cycle tracking</Button>
    </div>
  </div>

  <div className="panel aboutMeBox">
    <h2>About me</h2>
    <p>I wanted to combine the apps I used, because I have too many.</p>
    <p>And I didn’t want to pay every month for using it. So I did the most ADHD thing possible and created the app. Feel free to follow me on IG @merchantofthewest - I wanted to sell stuff but I got sidetracked.</p>
    <p><strong>Strictly Not for Commercial Use - seriously don’t be the arsehole</strong></p>
  </div>
</section>}
    </main><nav className={`bottomNav ${activeWorkout && trackCycle==="yes" ? "six" : "five"}`}><button className={tab==="today"?"active":""} onClick={()=>setTab("today")}>Today</button>{activeWorkout&&<button className={tab==="workout"?"active":""} onClick={()=>setTab("workout")}>Workout</button>}<button className={tab==="library"||tab==="exerciseHistory"?"active":""} onClick={()=>setTab("library")}>Library</button><button className={tab==="progress"?"active":""} onClick={()=>setTab("progress")}>Progress</button>{trackCycle==="yes"&&<button className={tab==="cycle"?"active":""} onClick={()=>setTab("cycle")}>Cycle</button>}<button className={tab==="rules"?"active":""} onClick={()=>setTab("rules")}>More</button></nav></div>
}

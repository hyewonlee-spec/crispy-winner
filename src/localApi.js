
const DB_NAME = "muscle_royalty_local_db";
const DB_VERSION = 1;
const EXERCISES_STORE = "exercises";
const SESSIONS_STORE = "sessions";
const TEMPLATES_STORE = "templates";
const CYCLE_STORE = "cycleLogs";
const META_STORE = "meta";
const LOCAL_API_INSTALLED_KEY = "__mr_local_api_installed__";

function uid(){ return (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()+Math.random()); }
function todayIso(){ return new Date().toISOString().slice(0,10); }
function num(v){ const n = Number(v); return Number.isFinite(n) ? n : null; }
function clone(v){ return JSON.parse(JSON.stringify(v)); }

const DEFAULT_EXERCISES = [
  {exercise:"Hip Thrust",category:"Lower Body",movementPattern:"Hip Extension",primaryMuscles:["Glutes","Hamstrings"],status:"Recommended",defaultSets:4,defaultReps:"8–10",coachNote:"Main glute strength movement.",equipment:["Barbell","Machine","Bench"],riskFlags:["L4/L5 friendly","Ankle planted"]},
  {exercise:"Dumbbell Romanian Deadlift",category:"Lower Body",movementPattern:"Hip Hinge",primaryMuscles:["Hamstrings","Glutes"],status:"Caution",defaultSets:3,defaultReps:"8–10",coachNote:"Keep range controlled.",equipment:["Dumbbells"],riskFlags:["L4/L5"]},
  {exercise:"Seated Hamstring Curl",category:"Lower Body",movementPattern:"Knee Flexion",primaryMuscles:["Hamstrings"],status:"Recommended",defaultSets:3,defaultReps:"10–12",coachNote:"Slow eccentric.",equipment:["Machine"],riskFlags:["Back friendly"]},
  {exercise:"Leg Press",category:"Lower Body",movementPattern:"Knee Dominant",primaryMuscles:["Quads","Glutes"],status:"Recommended",defaultSets:3,defaultReps:"10–12",coachNote:"Controlled range.",equipment:["Machine"],riskFlags:["Ankle planted"]},
  {exercise:"Hip Abductor Machine",category:"Lower Body",movementPattern:"Hip Abduction",primaryMuscles:["Glute Medius"],status:"Recommended",defaultSets:3,defaultReps:"12–15",coachNote:"Pause briefly open.",equipment:["Machine"],riskFlags:["Knee/ankle control"]},
  {exercise:"Hip Adductor Machine",category:"Lower Body",movementPattern:"Hip Adduction",primaryMuscles:["Adductors"],status:"Recommended",defaultSets:2,defaultReps:"12–15",coachNote:"Controlled reps only.",equipment:["Machine"],riskFlags:["Ankle planted"]},
  {exercise:"Pallof Press",category:"Core",movementPattern:"Anti-Rotation",primaryMuscles:["Core"],status:"Recommended",defaultSets:3,defaultReps:"10/side",coachNote:"Excellent anti-rotation work.",equipment:["Cable","Band"],riskFlags:["L4/L5 friendly"]},
  {exercise:"Seated Heel Raise Partial Range",category:"Lower Body",movementPattern:"Calf Raise",primaryMuscles:["Calves"],status:"Caution",defaultSets:2,defaultReps:"10–12",coachNote:"Only if pain-free.",equipment:["Bodyweight","Machine"],riskFlags:["Ankle pain"]},
  {exercise:"Chest-Supported Dumbbell Row",category:"Upper Pull",movementPattern:"Horizontal Pull",primaryMuscles:["Upper Back","Lats"],status:"Recommended",defaultSets:4,defaultReps:"8–10",coachNote:"Strong row option without loading the lower back.",equipment:["Dumbbells","Bench"],riskFlags:["Back friendly"]},
  {exercise:"Seated Cable Row — Neutral Grip",category:"Upper Pull",movementPattern:"Horizontal Pull",primaryMuscles:["Upper Back","Lats"],status:"Recommended",defaultSets:3,defaultReps:"10–12",coachNote:"Ribs down.",equipment:["Cable"],riskFlags:["Shoulder friendly"]},
  {exercise:"Wide-Neutral Lat Pulldown",category:"Upper Pull",movementPattern:"Vertical Pull",primaryMuscles:["Lats","Upper Back"],status:"Caution",defaultSets:3,defaultReps:"10",coachNote:"Avoid narrow grip.",equipment:["Cable"],riskFlags:["Left shoulder"]},
  {exercise:"Machine Chest Press",category:"Upper Push",movementPattern:"Horizontal Push",primaryMuscles:["Chest","Triceps"],status:"Recommended",defaultSets:3,defaultReps:"10",coachNote:"Use if dumbbell pressing feels unstable.",equipment:["Machine"],riskFlags:["Shoulder controlled"]},
  {exercise:"Face Pull",category:"Upper Pull",movementPattern:"Scapular Control",primaryMuscles:["Rear Delts","Upper Back"],status:"Recommended",defaultSets:3,defaultReps:"12–15",coachNote:"Control the movement.",equipment:["Cable","Band"],riskFlags:["Shoulder rehab"]},
  {exercise:"Rear Delt Fly",category:"Upper Pull",movementPattern:"Horizontal Pull",primaryMuscles:["Rear Delts"],status:"Recommended",defaultSets:3,defaultReps:"12–15",coachNote:"Light and strict.",equipment:["Machine","Dumbbells"],riskFlags:["Shoulder stability"]},
  {exercise:"Hammer Curl",category:"Arms",movementPattern:"Elbow Flexion",primaryMuscles:["Biceps","Brachialis"],status:"Recommended",defaultSets:2,defaultReps:"10–12",coachNote:"Controlled reps.",equipment:["Dumbbells"],riskFlags:["Elbow friendly"]},
  {exercise:"Bike",category:"Conditioning",movementPattern:"Cardio",primaryMuscles:["Cardio"],status:"Recommended",defaultSets:1,defaultReps:"20–30 min",coachNote:"Low-impact option.",equipment:["Bike"],riskFlags:["Low impact"]},
  {exercise:"Dead Bug",category:"Core",movementPattern:"Anti-Extension",primaryMuscles:["Core"],status:"Recommended",defaultSets:3,defaultReps:"8/side",coachNote:"Move slowly.",equipment:["Bodyweight"],riskFlags:["Spine friendly"]},
  {exercise:"Bird Dog",category:"Core",movementPattern:"Spine Stability",primaryMuscles:["Core","Glutes"],status:"Recommended",defaultSets:2,defaultReps:"8/side",coachNote:"Do not arch low back.",equipment:["Bodyweight"],riskFlags:["Spine friendly"]},
  {exercise:"Suitcase Carry",category:"Core",movementPattern:"Carry",primaryMuscles:["Core","Grip"],status:"Recommended",defaultSets:3,defaultReps:"20–30 m/side",coachNote:"Walk tall.",equipment:["Dumbbell","Kettlebell"],riskFlags:["Spine stability"]},
  {exercise:"Farmer Carry",category:"Conditioning",movementPattern:"Carry",primaryMuscles:["Grip","Core"],status:"Recommended",defaultSets:4,defaultReps:"20–30 m",coachNote:"Low-impact finisher.",equipment:["Dumbbells","Kettlebells"],riskFlags:["Spine stability"]},
  {exercise:"Glute Bridge Machine",category:"Lower Body",movementPattern:"Hip Extension",primaryMuscles:["Glutes"],status:"Recommended",defaultSets:3,defaultReps:"10–12",coachNote:"Good alternative to hip thrust.",equipment:["Machine"],riskFlags:["Ankle planted"]},
  {exercise:"Leg Extension",category:"Lower Body",movementPattern:"Knee Extension",primaryMuscles:["Quads"],status:"Caution",defaultSets:3,defaultReps:"12",coachNote:"Slow reps.",equipment:["Machine"],riskFlags:["Monitor knee"]},
  {exercise:"Cable Pull-Through",category:"Lower Body",movementPattern:"Hip Hinge",primaryMuscles:["Glutes","Hamstrings"],status:"Recommended",defaultSets:3,defaultReps:"10–12",coachNote:"Back-friendly hinge option.",equipment:["Cable"],riskFlags:["Controlled"]},
  {exercise:"Landmine Press",category:"Upper Push",movementPattern:"Angled Press",primaryMuscles:["Shoulders","Chest"],status:"Recommended",defaultSets:3,defaultReps:"8/side",coachNote:"Better than overhead press.",equipment:["Landmine","Barbell"],riskFlags:["Shoulder friendly"]},
  {exercise:"One-Arm Cable Row",category:"Upper Pull",movementPattern:"Horizontal Pull",primaryMuscles:["Upper Back","Lats"],status:"Recommended",defaultSets:3,defaultReps:"10/side",coachNote:"Good for left/right control.",equipment:["Cable"],riskFlags:["Shoulder control"]},
  {exercise:"Cable Lateral Raise",category:"Upper Push",movementPattern:"Shoulder Abduction",primaryMuscles:["Side Delts"],status:"Caution",defaultSets:3,defaultReps:"12",coachNote:"Light only.",equipment:["Cable"],riskFlags:["Left shoulder"]},
  {exercise:"Rope Triceps Pressdown",category:"Arms",movementPattern:"Elbow Extension",primaryMuscles:["Triceps"],status:"Recommended",defaultSets:2,defaultReps:"12",coachNote:"Use instead of elbow-flaring extensions.",equipment:["Cable"],riskFlags:["Elbow friendly"]}
].map((e,i)=>({id:"seed-"+(i+1),equipment:e.equipment||[],primaryMuscles:e.primaryMuscles||[],riskFlags:e.riskFlags||[],defaultRpe:6,isCustom:false,active:true,...e}));

function clone(v){ return JSON.parse(JSON.stringify(v)); }

function openDb(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(EXERCISES_STORE)) db.createObjectStore(EXERCISES_STORE, { keyPath: "id" });
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) db.createObjectStore(SESSIONS_STORE, { keyPath: "id" });
      if (!db.objectStoreNames.contains(TEMPLATES_STORE)) db.createObjectStore(TEMPLATES_STORE, { keyPath: "id" });
      if (!db.objectStoreNames.contains(CYCLE_STORE)) db.createObjectStore(CYCLE_STORE, { keyPath: "id" });
      if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE, { keyPath: "key" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function txReadAll(storeName){
  const db = await openDb();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = ()=> resolve(req.result || []);
    req.onerror = ()=> reject(req.error);
  });
}
async function txPut(storeName, value){
  const db = await openDb();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(clone(value));
    tx.oncomplete = ()=> resolve(value);
    tx.onerror = ()=> reject(tx.error);
  });
}
async function txDelete(storeName, key){
  const db = await openDb();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = ()=> resolve(true);
    tx.onerror = ()=> reject(tx.error);
  });
}
async function txClearAndBulkPut(storeName, items){
  const db = await openDb();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.clear();
    items.forEach(item=>store.put(clone(item)));
    tx.oncomplete = ()=> resolve(items);
    tx.onerror = ()=> reject(tx.error);
  });
}
async function metaGet(key){
  const db = await openDb();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(META_STORE, "readonly");
    const req = tx.objectStore(META_STORE).get(key);
    req.onsuccess = ()=> resolve(req.result ? req.result.value : undefined);
    req.onerror = ()=> reject(req.error);
  });
}
async function metaSet(key, value){
  const db = await openDb();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(META_STORE, "readwrite");
    tx.objectStore(META_STORE).put({ key, value });
    tx.oncomplete = ()=> resolve(value);
    tx.onerror = ()=> reject(tx.error);
  });
}

async function ensureSeeded(){
  const seeded = await metaGet("seeded");
  if (seeded) return;
  await txClearAndBulkPut(EXERCISES_STORE, DEFAULT_EXERCISES);
  await metaSet("seeded", true);
}

function makeResponse(body, status=200){
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async ()=>clone(body),
    text: async ()=>JSON.stringify(body)
  };
}
function average(sessions, key) {
  const vals = sessions.map((s) => s[key]).filter((v) => typeof v === "number" && Number.isFinite(v));
  return vals.length ? Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10 : null;
}
function summarizeHistory(sessions){
  return {
    totalLogs: sessions.length,
    workouts: sessions.filter((s)=>s.type !== "Readiness only").length,
    readinessOnly: sessions.filter((s)=>s.type === "Readiness only").length,
    avgReadiness: average(sessions,"readiness"),
    avgSleep: average(sessions,"sleep"),
    avgEnergy: average(sessions,"energy"),
    avgStress: average(sessions,"stress")
  };
}
function flattenExerciseHistory(sessions, exerciseId){
  const workoutExercises = [];
  const sets = [];
  sessions
    .filter(s => Array.isArray(s.exercises))
    .sort((a,b)=> String(a.date||"").localeCompare(String(b.date||"")))
    .forEach((session)=>{
      session.exercises.forEach((ex, idx)=>{
        if (ex.exerciseId !== exerciseId) return;
        const weId = ex.localId || uid();
        workoutExercises.push({
          id: weId,
          name: ex.name || ex.exercise || "Exercise",
          order: idx + 1,
          source: ex.source || "Added",
          targetSets: num(ex.targetSets),
          targetReps: ex.targetReps || "",
          notes: ex.notes || "",
          workoutSessionIds: [session.id]
        });
        (ex.sets || []).forEach((s, i)=>{
          sets.push({
            id: uid(),
            setEntry: (ex.name || "Exercise") + " · Set " + (i+1),
            setNumber: num(s.setNumber ?? i+1),
            weight: num(s.weight),
            weightUnit: s.weightUnit || "kg",
            reps: num(s.reps),
            rpe: num(s.rpe),
            notes: s.notes || "",
            workoutExerciseId: weId,
            workoutExerciseName: ex.name || ex.exercise || "Exercise",
            sessionDate: session.date || ""
          });
        });
      });
    });
  const lastSet = sets.length ? [...sets].sort((a,b)=> String(a.sessionDate).localeCompare(String(b.sessionDate)) || (a.setNumber||0)-(b.setNumber||0)).at(-1) : null;
  const bestSet = sets.length ? [...sets].sort((a,b)=> (b.weight||0)-(a.weight||0) || (b.reps||0)-(a.reps||0))[0] : null;
  return { workoutExercises, sets, summary: { entries: workoutExercises.length, totalSets: sets.length, lastSet, bestSet } };
}
function sortCycleLogs(logs){
  return [...logs].sort((a,b)=>{
    const ka = a.periodStartDate || a.date || "";
    const kb = b.periodStartDate || b.date || "";
    return String(kb).localeCompare(String(ka));
  });
}

async function handleApi(url, options={}){
  await ensureSeeded();
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const u = new URL(url, window.location.origin);
  const path = u.pathname;

  if (path === "/api/exercises" && method === "GET") {
    const exercises = (await txReadAll(EXERCISES_STORE))
      .filter(e => e.active !== false)
      .sort((a,b)=> String(a.exercise||"").localeCompare(String(b.exercise||"")));
    return makeResponse({ exercises });
  }
  if (path === "/api/exercises" && method === "POST") {
    const exerciseName = body.exercise || body.name;
    if (!exerciseName) return makeResponse({ error: "Exercise name is required." }, 400);
    const item = {
      id: uid(),
      exercise: exerciseName,
      category: body.category || "Custom",
      equipment: Array.isArray(body.equipment) ? body.equipment : body.equipment ? [body.equipment] : [],
      movementPattern: body.movementPattern || "Custom",
      primaryMuscles: Array.isArray(body.primaryMuscles) ? body.primaryMuscles : body.primaryMuscles ? [body.primaryMuscles] : [],
      status: body.status || "Custom",
      riskFlags: Array.isArray(body.riskFlags) ? body.riskFlags : body.riskFlags ? [body.riskFlags] : [],
      defaultSets: Number(body.defaultSets || 3),
      defaultReps: body.defaultReps || "10",
      defaultRpe: Number(body.defaultRpe || 6),
      coachNote: body.coachNote || "",
      isCustom: true,
      active: body.active !== false
    };
    await txPut(EXERCISES_STORE, item);
    return makeResponse({ id: item.id, exercise: item.exercise }, 201);
  }
  if (path === "/api/history" && method === "GET") {
    const sessions = (await txReadAll(SESSIONS_STORE)).sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
    return makeResponse({ sessions, summary: summarizeHistory(sessions) });
  }
  if (path === "/api/templates" && method === "GET") {
    const templates = (await txReadAll(TEMPLATES_STORE)).sort((a,b)=> (a.sortOrder||999)-(b.sortOrder||999) || String(a.name||"").localeCompare(String(b.name||"")));
    return makeResponse({ templates });
  }
  if (path === "/api/templates" && method === "POST") {
    const existing = await txReadAll(TEMPLATES_STORE);
    const name = body.name || body.type || "Workout Template";
    const template = {
      id: uid(),
      name,
      type: body.type || "Custom",
      focus: body.focus || "",
      active: true,
      sortOrder: existing.length + 1,
      exercises: (body.exercises || []).map((ex, i) => ({
        id: uid(),
        name: (name + " · " + (ex.name || ex.exercise || "Exercise")),
        order: i + 1,
        targetSets: num(ex.targetSets),
        targetReps: ex.targetReps || "",
        notes: ex.notes || "",
        exerciseIds: ex.exerciseId ? [ex.exerciseId] : [],
        templateIds: []
      }))
    };
    template.exercises = template.exercises.map(ex=>({...ex, templateIds:[template.id]}));
    await txPut(TEMPLATES_STORE, template);
    return makeResponse({ id: template.id, url: "local://template/"+template.id, name: template.name, exerciseCount: template.exercises.length }, 201);
  }
  if (path === "/api/workouts" && method === "POST") {
    if (body.action === "start") {
      return makeResponse({ status:"success", sessionId: body.existingSessionId || uid(), sessionUrl:"", workoutExercisesCreated:0, setsCreated:0 }, 201);
    }
    const id = body.existingSessionId || uid();
    const exercises = Array.isArray(body.exercises) ? body.exercises : [];
    const session = {
      id,
      session: (body.date || todayIso()) + " · " + (body.type || body.workoutTitle || "Workout"),
      date: body.date || todayIso(),
      type: body.type || "Custom Workout",
      workoutSource: body.workoutSource || "Custom",
      readiness: num(body.readiness),
      sleep: num(body.sleep),
      energy: num(body.energy),
      stress: num(body.stress),
      notes: body.notes || body.sessionNotes || "",
      exercises: clone(exercises)
    };
    await txPut(SESSIONS_STORE, session);
    const workoutExercisesCreated = exercises.length;
    const setsCreated = exercises.reduce((sum, ex)=> sum + ((ex.sets || []).length), 0);
    return makeResponse({ status:"success", sessionId:id, sessionUrl:"", workoutExercisesCreated, setsCreated }, 201);
  }
  if (path === "/api/cycle" && method === "GET") {
    return makeResponse({ logs: sortCycleLogs(await txReadAll(CYCLE_STORE)) });
  }
  if (path === "/api/cycle" && method === "POST") {
    const periodStartDate = body.periodStartDate || "";
    const title = periodStartDate ? `${periodStartDate} · ${body.cyclePhase || "Cycle log"}` : `${body.date || todayIso()} · Cycle check`;
    const log = {
      id: uid(),
      title,
      date: body.date || todayIso(),
      periodStartDate: body.periodStartDate || "",
      periodEndDate: body.periodEndDate || "",
      periodLength: body.periodLength ?? null,
      cycleLength: body.cycleLength ?? null,
      cycleDay: body.cycleDay ?? null,
      cyclePhase: body.cyclePhase || "",
      bleedingFlow: Array.isArray(body.bleedingFlow) ? body.bleedingFlow : [],
      cramps: body.cramps ?? null,
      sleepDisruption: body.sleepDisruption ?? null,
      moodSwings: body.moodSwings ?? body.mood ?? null,
      fatigue: body.fatigue ?? null,
      headacheMigraine: body.headacheMigraine ?? null,
      saltCravings: body.saltCravings ?? null,
      sugarCravings: body.sugarCravings ?? null,
      indigestion: body.indigestion ?? null,
      bloating: body.bloating ?? null,
      constipation: body.constipation ?? null,
      tenderBreasts: body.tenderBreasts ?? null,
      acne: body.acne ?? null,
      dizziness: body.dizziness ?? null,
      notes: body.notes || "",
      trainingRecommendation: body.trainingRecommendation || ""
    };
    await txPut(CYCLE_STORE, log);
    return makeResponse({ id: log.id, url: "local://cycle/"+log.id, title: log.title }, 201);
  }
  if (path === "/api/cycle" && method === "DELETE") {
    const id = u.searchParams.get("id");
    if (id) await txDelete(CYCLE_STORE, id);
    return makeResponse({ status:"success", archived:true, id });
  }
  if (path === "/api/exercise-history" && method === "GET") {
    const exerciseId = u.searchParams.get("exerciseId");
    if (!exerciseId) return makeResponse({ error: "exerciseId is required" }, 400);
    const sessions = await txReadAll(SESSIONS_STORE);
    return makeResponse(flattenExerciseHistory(sessions, exerciseId));
  }
  if (path === "/api/health" && method === "GET") {
    return makeResponse({ ok:true, missing:[], configured:{LOCAL_MODE:true, STORAGE:"IndexedDB"}, note:"Local IndexedDB mode is active. Data is stored in this browser." });
  }
  return null;
}

export function installLocalApi(){
  if (typeof window === "undefined") return;
  if (window[LOCAL_API_INSTALLED_KEY]) return;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init={}) => {
    const url = typeof input === "string" ? input : input?.url || "";
    if (url.startsWith("/api/")) {
      const handled = await handleApi(url, init || {});
      if (handled) return handled;
    }
    return originalFetch(input, init);
  };
  window[LOCAL_API_INSTALLED_KEY] = true;
}

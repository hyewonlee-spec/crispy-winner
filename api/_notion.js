const NOTION_VERSION = "2022-06-28";
const env = {
  token: process.env.NOTION_TOKEN,
  exerciseLibraryDb: process.env.NOTION_EXERCISE_LIBRARY_DB_ID,
  workoutSessionsDb: process.env.NOTION_WORKOUT_SESSIONS_DB_ID,
  workoutExercisesDb: process.env.NOTION_WORKOUT_EXERCISES_DB_ID,
  exerciseSetsDb: process.env.NOTION_EXERCISE_SETS_DB_ID,
};
function missingEnv(){return Object.entries(env).filter(([_,v])=>!v).map(([k])=>k)}
async function notionRequest(path, options={}){
  if(!env.token) throw new Error('Missing NOTION_TOKEN');
  const response = await fetch(`https://api.notion.com/v1${path}`, { ...options, headers: { Authorization: `Bearer ${env.token}`, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json', ...(options.headers||{}) }});
  const result = await response.json().catch(()=>({}));
  if(!response.ok){ const e = new Error(result.message || `Notion request failed with ${response.status}`); e.status=response.status; e.details=result; throw e; }
  return result;
}
function textOrEmpty(v){return v===null||v===undefined?'':String(v)}
function richText(v){const content=textOrEmpty(v).slice(0,1900); return content?[{type:'text',text:{content}}]:[]}
function titleText(v){const content=textOrEmpty(v).slice(0,1900)||'Untitled'; return [{type:'text',text:{content}}]}
function numberOrNull(v){ if(v===''||v===null||v===undefined) return null; const n=Number(v); return Number.isFinite(n)?n:null; }
function checkbox(v){ if(typeof v==='boolean') return v; if(typeof v==='string') return v.toLowerCase()==='true'; return Boolean(v); }
function splitMulti(v){ if(Array.isArray(v)) return v.filter(Boolean).map(x=>({name:String(x).trim()})).filter(x=>x.name); return textOrEmpty(v).split(',').map(x=>x.trim()).filter(Boolean).map(name=>({name})); }
function getTitle(p,n){return (p.properties?.[n]?.title||[]).map(x=>x.plain_text||x.text?.content||'').join('')}
function getRichText(p,n){return (p.properties?.[n]?.rich_text||[]).map(x=>x.plain_text||x.text?.content||'').join('')}
function getSelect(p,n){return p.properties?.[n]?.select?.name||''}
function getMulti(p,n){return (p.properties?.[n]?.multi_select||[]).map(x=>x.name)}
function getNumber(p,n){return p.properties?.[n]?.number??null}
function getCheckbox(p,n){return p.properties?.[n]?.checkbox??false}
module.exports={env,missingEnv,notionRequest,textOrEmpty,richText,titleText,numberOrNull,checkbox,splitMulti,getTitle,getRichText,getSelect,getMulti,getNumber,getCheckbox};

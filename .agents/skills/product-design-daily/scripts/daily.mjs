#!/usr/bin/env node
/** Product Design Daily: portable, no-dependency local learning ledger. Node.js 18+. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataset = JSON.parse(fs.readFileSync(path.join(base, 'data', 'curriculum.json'), 'utf8'));
const sessions = dataset.sessions;
const stateDir = process.env.PDD_STATE_DIR
  ? path.resolve(process.env.PDD_STATE_DIR)
  : path.join(os.homedir(), '.product-design-daily');
const stateFile = path.join(stateDir, 'progress.json');

function fail(message) { console.error(JSON.stringify({ok:false, error:message}, null, 2)); process.exit(1); }
function options(argv) {
  const command = argv[0] || 'today';
  const opts = {};
  for (let i=1; i<argv.length; i++) {
    if (!argv[i].startsWith('--')) fail(`未知参数：${argv[i]}`);
    const key = argv[i].slice(2);
    if (!['date','score','note','topic'].includes(key)) fail(`未知选项：--${key}`);
    if (i+1 >= argv.length || argv[i+1].startsWith('--')) fail(`缺少 --${key} 的值`);
    opts[key] = argv[++i];
  }
  return {command, opts};
}
function localToday() {
  const now = new Date();
  return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
}
function checkedDate(v) {
  const d = v || localToday();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(`${d}T00:00:00Z`)) ||
    new Date(`${d}T00:00:00Z`).toISOString().slice(0,10)!==d) fail(`无效日期：${d}`);
  return d;
}
function checkedScore(v) {
  if (!/^[0-4]$/.test(String(v ?? ''))) fail('评分必须是整数 0、1、2、3 或 4');
  return Number(v);
}
function fresh() { return {schema_version:1, started_at:new Date().toISOString(), presented:[], reviews:[]}; }
function load() {
  if (!fs.existsSync(stateFile)) return fresh();
  try {
    const state = JSON.parse(fs.readFileSync(stateFile,'utf8'));
    if (state.schema_version!==1 || !Array.isArray(state.presented) || !Array.isArray(state.reviews))
      fail('进度记录结构不兼容，请先备份并检查 progress.json，禁止自动覆盖');
    if (state.presented.some((x,i)=>x.day!==i+1 || x.id!==sessions[i]?.id))
      fail('进度课程顺序与课程表不一致，禁止自动覆盖。请备份状态并人工迁移');
    return state;
  } catch(e) {
    if(e?.message?.startsWith('进度')) throw e;
    fail(`进度读取失败：${e.message}。不会清除旧文件`);
  }
}
function save(state) {
  fs.mkdirSync(stateDir,{recursive:true});
  const temp = path.join(stateDir,`.progress.${process.pid}.tmp`);
  fs.writeFileSync(temp,JSON.stringify(state,null,2)+'\n','utf8');
  fs.renameSync(temp,stateFile);
}
function last(state) { return state.presented.at(-1); }
function latestScore(entry) { return entry.latest_score ?? entry.score ?? null; }
function dueCandidates(state, currentDay, thisWeek=false) {
  const week = Math.ceil(currentDay/7);
  const picks = [];
  for(const record of state.presented) {
    const lesson = sessions[record.day-1];
    if(!lesson || lesson.kind!=='lesson') continue;
    const score = latestScore(record);
    const due = record.next_review_day ?? null;
    const dueNow = due!==null && due<=currentDay;
    const sameWeek = lesson.week===week;
    const untouched = score===null;
    if(!dueNow && !(thisWeek && sameWeek) && !(untouched && currentDay-record.day>=6)) continue;
    picks.push({topic_id:lesson.id,title:lesson.title,day:record.day,score,
      due_day:due,reason:dueNow?'复习到期':untouched?'尚未评估':'本周知识'});
  }
  picks.sort((a,b) => {
    const weight = x => x.reason==='复习到期'?0:x.reason==='尚未评估'?1:2;
    return weight(a)-weight(b) || (a.score??-1)-(b.score??-1) || b.day-a.day;
  });
  return picks.slice(0,thisWeek?3:1);
}
function snapshot(state, record, repeated, date) {
  if(!record) return {ok:true, done:true, message:'全部 90 次课程已经展示。请完成实战与评估后，再规划下一期课程；不会自动清空进度。', progress:stats(state)};
  const session = sessions[record.day-1];
  return {ok:true, date, repeated, session,
    review_candidates:dueCandidates(state,record.day,session.kind==='review'),
    progress:stats(state),
    instruction: session.kind==='lesson'?'按照教学规范生成当前知识课，练习答案暂不揭晓':
      session.kind==='review'?'结合本周及到期知识安排 2–3 项复盘题':
      '提供可评估任务与交付要求，先不要直接代写最终方案'};
}
function stats(state) {
  const scored = state.presented.filter(x=>x.score!==null);
  const reviewed = state.reviews.length;
  const completed = state.presented.length;
  return {presented:completed,total:90,remaining:90-completed,
    evaluated:scored.length,unevaluated:completed-scored.length,
    average_initial_score:scored.length?Number((scored.reduce((a,x)=>a+x.score,0)/scored.length).toFixed(2)):null,
    review_attempts:reviewed, last_lesson:last(state)?.id??null, state_file:stateFile};
}
function serve(date, force=false) {
  const state=load(), prev=last(state);
  if(!force && prev) {
    if(date===prev.date) return snapshot(state,prev,true,date);
    if(date<prev.date) {
      const historic=[...state.presented].reverse().find(x=>x.date===date);
      if(historic) return snapshot(state,historic,true,date);
      fail('提供的日期早于最近一次学习日，且当天没有旧记录；不能倒退课程序号');
    }
  }
  if(prev && date<prev.date) fail('不能以早于最近学习日的日期强制推进课程');
  if(prev?.day===90) return {ok:true,done:true,message:'90 次已全部展示。不要自动重置。',progress:stats(state)};
  const day=state.presented.length+1, item=sessions[day-1];
  if(!item) fail('课程表缺失下一节，请运行 validate.mjs');
  const record={day,id:item.id,date,status:'presented',score:null,latest_score:null,
    feedback:'',next_review_day:null};
  state.presented.push(record);
  save(state);
  return snapshot(state,record,false,date);
}
function answer(date, opts) {
  const state=load(), record=opts.topic
    ? state.presented.find(x=>x.id===String(opts.topic).trim().toUpperCase())
    : last(state);
  if(!record) fail('未找到待评估课程，先执行 today 或检查 --topic');
  if(date<record.date) fail('答题记录日期不能早于该课程首次展示日期');
  const score=checkedScore(opts.score);
  if(record.score!==null) fail('这节课已记录过首次评分；修改前请人工核对，复习请使用 review 命令');
  record.score=score; record.latest_score=score; record.status='assessed';
  record.feedback=String(opts.note??'').slice(0,1000);
  record.next_review_day=record.day+(score<=2?2:score===3?7:14);
  save(state);
  return {ok:true, action:'answer',lesson_id:record.id,day:record.day,score, next_review_day:record.next_review_day,progress:stats(state)};
}
function review(date, opts) {
  const state=load(),score=checkedScore(opts.score),id=String(opts.topic??'').trim().toUpperCase();
  if(!id) fail('复习需要 --topic，例如 P01');
  const record=state.presented.find(x=>x.id===id);
  if(!record) fail(`尚未展示 ${id}，不能虚构复习记录`);
  if(sessions[record.day-1].kind!=='lesson') fail('复习主题必须是产品、UX 或视觉知识点');
  if(date<record.date) fail('复习日期不能早于主题首次展示日期');
  const atDay=state.presented.length;
  record.latest_score=score;
  record.next_review_day=atDay+(score<=2?2:score===3?7:14);
  state.reviews.push({topic_id:id,score,date,at_day:atDay,note:String(opts.note??'').slice(0,1000)});
  save(state);
  return {ok:true,action:'review',topic_id:id,score,next_review_day:record.next_review_day,progress:stats(state)};
}

const {command,opts} = options(process.argv.slice(2));
try {
  let result;
  if(command==='status') result={ok:true,progress:stats(load()),
    review_candidates:dueCandidates(load(),(last(load())?.day??0)+1,true)};
  else if(command==='today') result=serve(checkedDate(opts.date),false);
  else if(command==='advance') result=serve(checkedDate(opts.date),true);
  else if(command==='answer') result=answer(checkedDate(opts.date),opts);
  else if(command==='review') result=review(checkedDate(opts.date),opts);
  else fail(`未知命令 ${command}；支持 today、advance、status、answer、review`);
  console.log(JSON.stringify(result,null,2));
} catch (error) { fail(error.message); }

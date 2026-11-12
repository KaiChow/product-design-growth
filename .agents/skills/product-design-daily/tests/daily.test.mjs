import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const script=path.join(root,'scripts','daily.mjs');
function env() {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pdd-test-'));
  return {dir, call(...args) {
    const r=spawnSync(process.execPath,[script,...args],{encoding:'utf8',env:{...process.env,PDD_STATE_DIR:dir}});
    return {code:r.status,value:JSON.parse(r.stdout||r.stderr),stderr:r.stderr};
  }};
}
test('同日重跑不推进；漏天也不跳课；手动前进有效',()=>{
  const e=env();
  let a=e.call('today','--date','2026-11-10'); assert.equal(a.value.session.day,1);
  a=e.call('today','--date','2026-11-10'); assert.equal(a.value.session.day,1);assert.equal(a.value.repeated,true);
  a=e.call('today','--date','2026-11-15'); assert.equal(a.value.session.day,2);
  a=e.call('advance','--date','2026-11-15'); assert.equal(a.value.session.day,3);
  a=e.call('today','--date','2026-11-15'); assert.equal(a.value.session.day,3);
  fs.rmSync(e.dir,{recursive:true,force:true});
});
test('不作答不得分；评分与复习是真实独立的记录',()=>{
  const e=env();
  e.call('today','--date','2026-11-10');
  let a=e.call('status'); assert.equal(a.value.progress.unevaluated,1);
  a=e.call('answer','--date','2026-11-10','--score','3','--note','能说明取舍');
  assert.equal(a.value.next_review_day,8);
  a=e.call('status');assert.equal(a.value.progress.evaluated,1);
  a=e.call('answer','--date','2026-11-10','--score','4');assert.equal(a.code,1);
  e.call('today','--date','2026-11-11');
  a=e.call('answer','--date','2026-11-11','--topic','U01','--score','2'); assert.equal(a.value.lesson_id,'U01');
  a=e.call('review','--date','2026-11-11','--topic','P01','--score','4');assert.equal(a.value.progress.review_attempts,1);
  a=e.call('review','--date','2026-11-11','--topic','P99','--score','4');assert.equal(a.code,1);
  fs.rmSync(e.dir,{recursive:true,force:true});
});
test('第 90 次之后不能自动重置',()=>{
  const e=env();
  let a=e.call('today','--date','2026-11-10');
  for(let i=2;i<=90;i++) a=e.call('advance','--date','2026-11-10');
  assert.equal(a.value.session.day,90);
  a=e.call('today','--date','2026-11-11'); assert.equal(a.value.done,true);assert.equal(a.value.progress.presented,90);
  fs.rmSync(e.dir,{recursive:true,force:true});
});

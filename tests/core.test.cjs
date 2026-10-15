const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../assets/content.js');require('../assets/municipal.js');const C=require('../assets/core.js');
test('content has complete unique questions and real source pages',()=>{assert.equal(D.questions.length,94);assert.equal(new Set(D.questions.map(q=>q.id )).size,94);D.questions.forEach(q=>{assert(q.options[q.correct]);assert(q.explanation);assert(D.lessons.some(l=>l.id===q.topic));});assert.deepEqual(D.stations.map(s=>s.checks.length),[12,17,12]);});
test('full correct answers survive random option shuffle',()=>{for(const mode of ['training','exam','municipal']){const s=C.newSession(D,mode,'all',[],1000);s.answers=s.paper.map(q=>q.correct);C.finish(s,61000);assert.equal(s.result.percent,100);assert.equal(s.result.correct,s.paper.length);assert.equal(s.durationMs,60000);assert(C.validResult(C.record(s)));}});
test('no result or speed bonus for an unchecked/empty attempt',()=>{const s=C.newSession(D,'training','all',[],1000);assert.throws(()=>C.record(s));assert.throws(()=>C.finish(s,2000));assert.equal(s.finishedAt,null);C.finish(s,2000,true);assert.equal(s.result.points,0);assert.equal(s.result.percent,0);});
test('municipal paper has 10 knowledge + 3 situations + 2 observation groups with weights',()=>{const p=C.makePaper(D,'municipal');assert.equal(p.filter(q=>q.kind==='knowledge').length,10);assert.equal(new Set(p.filter(q=>q.kind==='case').map(q=>q.group)).size,3);assert.equal(new Set(p.filter(q=>q.kind==='observation').map(q=>q.group)).size,2);assert.equal(p.length,23);assert.equal(C.evaluate(p,p.map(q=>q.correct)).maxPoints,39);});
test('timeout caps duration, counts missing answers, and freezes result',()=>{const s=C.newSession(D,'exam','all',[],1000);s.answers[0]=s.paper[0].correct;C.finish(s,1801000,true);assert.equal(s.durationMs,1200000);assert.equal(s.result.correct,1);const snap=JSON.stringify(s);C.finish(s,2200000,true);assert.equal(JSON.stringify(s),snap);});
test('clock rollback never produces negative time',()=>{const s=C.newSession(D,'training','all',[],10000);s.answers=s.paper.map(q=>q.correct);C.finish(s,1);assert.equal(s.durationMs,0);});
test('topic and retry paper do not include unrelated questions',()=>{assert(C.makePaper(D,'training','burn').every(q=>q.topic==='burn'));assert.deepEqual(C.makePaper(D,'retry','all',['q01']).map(q=>q.id),['q01']);assert.deepEqual(C.makePaper(D,'retry','all',[]),[]);});
test('corrupt/blocked storage does not stop preparation',()=>{assert.deepEqual(C.safeRead({getItem(){return '{bad';}},'x',{}),{});assert.equal(C.safeWrite({setItem(){throw Error('blocked')}},'x',{}),false);});
test('invalid records rejected and score ratios remain consistent',()=>{const s=C.newSession(D,'training','all',[],1000);s.answers=s.paper.map(q=>q.correct);C.finish(s,11000);const r=C.record(s);assert(!C.validResult({...r,durationMs:-1}));assert(!C.validResult({...r,correct:999}));assert(!C.validResult({...r,percent:99}));assert(!C.validResult({...r,schemaVersion:1}));});
test('participant requires both fields, including after whitespace trimming',()=>{for(const p of [{},{name:'Настя'},{team:'Команда'},{name:'   ',team:'Команда'},{name:'Настя',team:'\t\n'},{name:'А'.repeat(41),team:'Команда'}])assert.throws(()=>C.participant(p));assert.deepEqual(C.participant({name:' Настя ',team:' Первые '}),{name:'Настя',team:'Первые'});});
test('attempt keeps start identity when profile changes before finish or export',()=>{const profile={name:'Настя',team:'Первые'};const s=C.identify(C.newSession(D,'exam','all',[],1000),profile);profile.name='Другой участник';profile.team='Другая команда';s.answers=s.paper.map(q=>q.correct);C.finish(s,11000);assert.equal(C.record(s,profile).name,'Настя');assert.equal(C.record(s,profile).team,'Первые');assert(Object.isFrozen(s.participant));});

test('retry includes errors from municipal cases and observations',()=>{
  const selected=['c1-0','o2-2'];
  const paper=C.makePaper(D,'retry','all',selected);
  assert.deepEqual(paper.map(q=>q.id).sort(),selected.slice().sort());
  assert.ok(paper.every(q=>q.context&&q.topic&&q.weight===1));
  const s=C.newSession(D,'retry','all',selected,1000);
  s.answers=s.paper.map(q=>q.correct);
  C.finish(s,2000);
  assert.equal(s.result.correct,2);
});


test('municipal bank covers eight competencies and fixed 3/7 observations',()=>{
 assert.equal(D.municipal.questions.length,30);assert.equal(D.municipal.cases.length,6);assert.equal(D.municipal.observations.length,4);
 for(let i=0;i<50;i++){const p=C.makePaper(D,'municipal');assert.equal(new Set(p.filter(q=>q.kind==='knowledge').map(q=>q.competency)).size,8);assert.deepEqual(Object.values(Object.groupBy(p.filter(q=>q.kind==='observation'),q=>q.group)).map(x=>x.length).sort(),[3,7]);assert.equal(new Set(p.map(q=>q.id)).size,23);}
 const bank=C.questionBank(D);assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);bank.forEach(q=>{assert(q.explanation);assert(q.options[q.correct]);assert(D.lessons.some(l=>l.id===q.topic));});
});
test('short training pairs related questions and weak topics use new questions',()=>{
 const p=C.makePaper(D,'training');assert.equal(p.length,6);for(let i=0;i<6;i+=2)assert.equal(p[i].topic,p[i+1].topic);
 const weak=C.makePaper(D,'training','weak',['mc1-0']);assert(weak.length>0);assert(weak.every(q=>q.topic==='choking'));assert(!weak.some(q=>q.id==='mc1-0'));assert.equal(C.makePaper(D,'training','weak',[]).length,0);
 assert(C.makePaper(D,'retry','all',['mc1-0','mo4-6']).every(q=>q.context));
});

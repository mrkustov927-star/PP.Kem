'use strict';
(function(root){
  const shuffle=(input,random=Math.random)=>{const a=input.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function questionBank(data){return [...data.questions,...data.cases.flatMap(c=>c.checks.map((q,i)=>({...q,id:c.id+'-'+i,topic:c.topic,kind:'case',group:c.title,context:c.story}))),...data.observations.flatMap(o=>o.checks.map((q,i)=>({...q,id:o.id+'-'+i,topic:o.topic,kind:'observation',group:o.title,context:o.frames.join('\n')})))];}
  function makePaper(data,mode,topic='all',wrongIds=[],random=Math.random){
    let pool=data.questions.filter(q=>topic==='all'||q.topic===topic);
    if(mode==='retry')pool=questionBank(data).filter(q=>wrongIds.includes(q.id));
    if(!pool.length)return [];
    const count=mode==='municipal'?10:Math.min(20,pool.length);
    const paper=shuffle(pool,random).slice(0,count).map(q=>({...q,group:q.group||'Знания',weight:1}));
    if(mode==='municipal'){
      shuffle(data.cases,random).slice(0,3).forEach(c=>c.checks.forEach((q,i)=>paper.push({...q,id:c.id+'-'+i,topic:c.topic,kind:'case',weight:3,group:c.title,context:c.story})));
      shuffle(data.observations,random).slice(0,2).forEach(o=>o.checks.forEach((q,i)=>paper.push({...q,id:o.id+'-'+i,topic:o.topic,kind:'observation',weight:2,group:o.title,context:o.frames.join('\n')})));
    }
    return paper.map(q=>{const opts=shuffle(q.options.map((text,index)=>({text,index})),random);return {...q,options:opts.map(o=>o.text),correct:opts.findIndex(o=>o.index===q.correct)};});
  }
  function evaluate(paper,answers){
    let correct=0,points=0,maxPoints=0;const wrong=[],topics={};
    paper.forEach((q,i)=>{const ok=answers[i]===q.correct;maxPoints+=q.weight;topics[q.topic]??={correct:0,total:0};topics[q.topic].total++;if(ok){correct++;points+=q.weight;topics[q.topic].correct++;}else wrong.push(q.id);});
    return {correct,total:paper.length,points,maxPoints,percent:Math.round(100*points/maxPoints)||0,wrong,topics};
  }
  function newSession(data,mode,topic,wrongIds,now=Date.now(),random=Math.random){const paper=makePaper(data,mode,topic,wrongIds,random);return {id:'pp2-'+now+'-'+Math.floor(random()*1e9).toString(36),mode,topic,paper,answers:Array(paper.length).fill(null),startedAt:now,limitMs:mode==='municipal'?25*60*1000:mode==='exam'?20*60*1000:0,finishedAt:null,result:null};}
  function finish(s,now=Date.now(),expired=false){if(s.finishedAt!==null)return s;if(!expired&&s.answers.some(a=>a===null))throw new Error('Ответьте на все вопросы.');s.finishedAt=Math.max(s.startedAt,now);s.durationMs=Math.max(0,Math.min(s.finishedAt-s.startedAt,s.limitMs||Infinity));s.result=evaluate(s.paper,s.answers);s.expired=expired;return s;}
  function validResult(r){return !!r&&r.schemaVersion===2&&typeof r.id==='string'&&r.id.length<100&&['training','exam','municipal','retry'].includes(r.mode)&&Number.isInteger(r.correct)&&Number.isInteger(r.total)&&r.total>0&&r.total<=100&&r.correct>=0&&r.correct<=r.total&&Number.isInteger(r.points)&&Number.isInteger(r.maxPoints)&&r.maxPoints>0&&r.maxPoints<=300&&r.points>=0&&r.points<=r.maxPoints&&Number.isFinite(r.durationMs)&&r.durationMs>=0&&r.durationMs<=86400000&&Number.isInteger(r.percent)&&r.percent===Math.round(100*r.points/r.maxPoints)&&Number.isFinite(r.finishedAt);}
  function participant(input){const name=typeof input?.name==='string'?input.name.trim():'',team=typeof input?.team==='string'?input.team.trim():'';if(!name)throw new Error('Введите имя или псевдоним.');if(!team)throw new Error('Введите название команды.');if(name.length>40||team.length>60)throw new Error('Имя — до 40 символов, команда — до 60.');return {name,team};}
  function identify(s,input){s.participant=Object.freeze(participant(input));return s;}
  function record(s,profile={}){if(!s.result||s.finishedAt===null)throw new Error('Тест ещё не завершён.');const identity=s.participant||profile;return {schemaVersion:2,id:s.id,mode:s.mode,topic:s.topic,name:String(identity.name||'Участник').slice(0,40),team:String(identity.team||'').slice(0,60),...s.result,durationMs:s.durationMs,finishedAt:s.finishedAt,expired:!!s.expired,contentVersion:'2026.10.13'};}
  function safeRead(storage,key,fallback){try{const raw=storage.getItem(key);return raw===null?fallback:JSON.parse(raw);}catch{return fallback;}}
  function safeWrite(storage,key,value){try{storage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function safeText(v,max=100){return typeof v==='string'?v.slice(0,max):'';}
  const api={shuffle,questionBank,makePaper,evaluate,newSession,finish,validResult,participant,identify,record,safeRead,safeWrite,safeText};root.PPCore=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

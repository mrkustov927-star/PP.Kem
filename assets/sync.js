'use strict';
(function(root){
  const fields=['schemaVersion','id','mode','topic','name','team','correct','total','points','maxPoints','percent','wrong','topics','durationMs','finishedAt','expired','contentVersion'];
  const eligible=r=>!!r&&r.autoPublish===true&&r.cloudSent!==true&&root.PPCore.validResult(r)&&typeof r.name==='string'&&!!r.name.trim()&&typeof r.team==='string'&&!!r.team.trim();
  function payload(r,uid,createdAt){if(!root.PPCore.validResult(r))throw Error('invalid-result');root.PPCore.participant(r);const p={};fields.forEach(k=>{if(r[k]!==undefined)p[k]=r[k];});p.uid=uid;p.createdAt=createdAt;return p;}
  async function send(r,transport){const p=payload(r,transport.uid,transport.timestamp());const old=await transport.read(r.id);if(old){if(old.uid!==transport.uid||fields.some(k=>['wrong','topics'].includes(k)?false:old[k]!==p[k]))throw Error('record-conflict');return {alreadySaved:true};}await transport.write(r.id,p);return {alreadySaved:false};}
  const api={eligible,payload,send};root.PPSync=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

/** MU Nations registration endpoint for Vercel Node functions.
 *  Saves each registration to every configured destination:
 *    - Google Sheets (via an Apps Script web app): GOOGLE_SHEETS_WEBHOOK_URL + GOOGLE_SHEETS_SECRET
 *    - Supabase: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *  At least one must be configured, and success is only reported after at least one real write.
 *  Secrets stay server-side. Payment deliberately NOT handled here.
 */
const ALLOWED = new Set(['UNHRC', 'MCC', 'CCEP', 'IPL', 'AIPPM', 'DALAL', 'STARTUP', 'IP']);
const text = (value, max=150) => typeof value === 'string' ? value.trim().slice(0,max) : '';
const emailOK = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length<=180;
const reply = (res, status, data) => { res.setHeader('Cache-Control','no-store'); res.status(status); return res.json(data); };

module.exports = async function handler(req,res) {
  res.setHeader('X-Content-Type-Options','nosniff');
  if (req.method!=='POST') {res.setHeader('Allow','POST');return reply(res,405,{error:'Method not allowed.'});}
  const ct=(req.headers['content-type']||'').toLowerCase();
  if(!ct.includes('application/json'))return reply(res,415,{error:'JSON body required.'});
  const host=(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim();
  const origin=req.headers.origin;
  if(origin){try{if(new URL(origin).host!==host)return reply(res,403,{error:'Cross-site requests not allowed.'});}catch{return reply(res,403,{error:'Invalid request origin.'});}}
  if(Number(req.headers['content-length']||0)>12000)return reply(res,413,{error:'Request too large.'});
  const input=typeof req.body==='object'&&req.body!==null?req.body:{};
  if(text(input.website,200))return reply(res,400,{error:'Invalid submission.'}); // honeypot
  const name=text(input.name,100), email=text(input.email,180).toLowerCase(), institution=text(input.institution,180),committee=text(input.applyingFor,10).toUpperCase();
  const phone=text(input.phone,16), motivation=text(input.motivation,1000), category=text(input.category,20)||'unspecified';
  if(name.length<2||institution.length<2||!emailOK(email)||!ALLOWED.has(committee)||input.consent!==true) return reply(res,400,{error:'Please complete name, email, institution, consent and choose a valid committee.'});
  if(!['school','college','unspecified'].includes(category))return reply(res,400,{error:'Invalid category.'});
  if(typeof input.phone!=='string'||input.phone.trim().length>16||!/^\+?[0-9]{7,15}$/.test(phone))return reply(res,400,{error:'Enter a phone number with 7–15 digits, optionally starting with +.'});
  const sheetUrl=process.env.GOOGLE_SHEETS_WEBHOOK_URL, sheetSecret=process.env.GOOGLE_SHEETS_SECRET;
  const dbUrl=process.env.SUPABASE_URL, dbKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const useSheet=Boolean(sheetUrl&&sheetSecret), useDb=Boolean(dbUrl&&dbKey);
  if(!useSheet&&!useDb)return reply(res,503,{error:'Registration is not yet open. Backend configuration is pending.'});
  const consentedAt=new Date().toISOString();
  const saveSheet=async()=>{
    const r=await fetch(sheetUrl,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({secret:sheetSecret,timestamp:consentedAt,committee,name,email,institution,category,phone,motivation,source:host}),signal:AbortSignal.timeout(10000)});
    const out=await r.json().catch(()=>({}));
    if(!r.ok||out.ok!==true)throw new Error('sheet '+r.status+' '+(out.error||''));
  };
  const saveDb=async()=>{
    const r=await fetch(new URL('/rest/v1/mun_registrations',dbUrl),{method:'POST',headers:{'Content-Type':'application/json','apikey':dbKey,'Authorization':`Bearer ${dbKey}`,'Prefer':'return=minimal'},body:JSON.stringify({name,email,institution,phone:phone||null,motivation:motivation||null,category,committee,consented_at:consentedAt,payment_status:'not_requested'}),signal:AbortSignal.timeout(8000)});
    if(!r.ok)throw new Error('db '+r.status);
  };
  const jobs=[];if(useSheet)jobs.push(['sheet',saveSheet]);if(useDb)jobs.push(['db',saveDb]);
  const results=await Promise.allSettled(jobs.map(([,fn])=>fn()));
  results.forEach((r,i)=>{if(r.status==='rejected')console.error('Registration write failed ('+jobs[i][0]+'):',r.reason&&r.reason.message);});
  if(results.some(r=>r.status==='fulfilled'))return reply(res,201,{ok:true,message:'Registration request received; payment instructions pending.'});
  return reply(res,502,{error:'Unable to save registration. Please retry or contact organisers.'});
};

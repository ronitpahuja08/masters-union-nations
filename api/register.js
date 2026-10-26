/** MU Nations registration endpoint for Vercel Node functions.
 *  Requires server-only SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *  Never exposes service role key or claims success without a DB write.
 *  Payment deliberately NOT handled here.
 */
const ALLOWED = new Set(['MCC', 'AIPPM', 'IP', 'DALAL']);
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
  const phone=text(input.phone,16), category=text(input.category,20)||'unspecified';
  if(name.length<2||institution.length<2||!emailOK(email)||!ALLOWED.has(committee)||input.consent!==true) return reply(res,400,{error:'Please complete name, email, institution, consent and choose a valid committee.'});
  if(!['school','college','unspecified'].includes(category))return reply(res,400,{error:'Invalid category.'});
  if(typeof input.phone!=='string'||input.phone.trim().length>16||!/^\+?[0-9]{7,15}$/.test(phone))return reply(res,400,{error:'Enter a phone number with 7–15 digits, optionally starting with +.'});
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return reply(res,503,{error:'Registration is not yet open. Backend configuration is pending.'});
  try {
    const db=new URL('/rest/v1/mun_registrations',url);
    const upstream=await fetch(db,{method:'POST',headers:{'Content-Type':'application/json','apikey':key,'Authorization':`Bearer ${key}`,'Prefer':'return=minimal'},body:JSON.stringify({name,email,institution,phone,motivation:null,category,committee,consented_at:new Date().toISOString(),payment_status:'not_requested'}),signal:AbortSignal.timeout(8000)});
    if(!upstream.ok){console.error('Registration DB write failed',upstream.status);return reply(res,502,{error:'Unable to save registration. Please retry or contact organisers.'});}
    return reply(res,201,{ok:true,message:'Registration request received; payment instructions pending.'});
  }catch(err){console.error('Registration network error',err.name);return reply(res,503,{error:'Registration service is unavailable. Please retry later.'});}
};

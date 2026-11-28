import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// ---- Settings: the Supabase project behind the app (public keys, safe to ship) ----
const SUPABASE_URL = 'https://vobgvhyqabbzlrisrsmp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BMtPC7NvgSLpA7ovwNWVxA_oitYOoKi';
const VAPID_PUBLIC = 'BBnDkoWsN6_RQAzCaeWgB1H8YnHCtO2kc1YZK3A0l2g0LyrJkb2uG01Fv0rJXG-HXB7kNdUIr4r5rfXkmKy9wDg';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
//@@END_CLIENT

const DEMO = !!window.__DEMO;
const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ls = { get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (_) { } }, del(k) { try { localStorage.removeItem(k); } catch (_) { } } };

// ---- accent colours (light/dark follows the phone, like צעד) ----
const THEMES = {
  rose:     { name: 'ורוד',   l: ['#C2185B', '#FFFFFF', '#F06292', '#AD1457'], d: ['#F27BA4', '#2A0614', '#F48FB1', '#C2185B'] },
  lavender: { name: 'לבנדר',  l: ['#6A4BD1', '#FFFFFF', '#9C86F2', '#4F33B8'], d: ['#A994F7', '#1A0F3D', '#B9A8FA', '#6A4BD1'] },
  peach:    { name: 'אפרסק',  l: ['#C2410C', '#FFFFFF', '#F4895C', '#A3360A'], d: ['#F59A6B', '#2B1205', '#F8B08A', '#C2410C'] },
  sea:      { name: 'ים',     l: ['#137A69', '#FFFFFF', '#35C2A9', '#0E5F52'], d: ['#35C2A9', '#06231D', '#5FD3BE', '#137A69'] },
  red:      { name: 'אדום',   l: ['#C62828', '#FFFFFF', '#EF5350', '#B71C1C'], d: ['#FF7A7A', '#2B0606', '#FF9C9C', '#C62828'] },
  coral:    { name: 'אלמוג',  l: ['#C2452D', '#FFFFFF', '#F2795F', '#9E3320'], d: ['#FF8A70', '#2E0D06', '#FFA893', '#C2452D'] },
  gold:     { name: 'זהב',    l: ['#8A6100', '#FFFFFF', '#E3A92E', '#6E4D00'], d: ['#F2B544', '#2E1F00', '#F7CB72', '#B98314'] },
  mint:     { name: 'מנטה',   l: ['#2E7D32', '#FFFFFF', '#66BB6A', '#1B5E20'], d: ['#7BD88F', '#062B10', '#9EE6AC', '#2E7D32'] },
  sky:      { name: 'שמיים',  l: ['#1565C0', '#FFFFFF', '#5C9CE6', '#0D47A1'], d: ['#7FB3FF', '#061A3A', '#A3C9FF', '#1565C0'] },
  plum:     { name: 'שזיף',   l: ['#7B1FA2', '#FFFFFF', '#B565D9', '#5E1680'], d: ['#D69BF0', '#2A0838', '#E3B8F5', '#7B1FA2'] },
  coffee:   { name: 'קפה',    l: ['#6D4C41', '#FFFFFF', '#A1887F', '#4E342E'], d: ['#D7B8A8', '#2B1A13', '#E5CFC3', '#8D6E63'] },
  slate:    { name: 'גרפיט',  l: ['#37474F', '#FFFFFF', '#78909C', '#263238'], d: ['#B0BEC5', '#14191C', '#CFD8DC', '#546E7A'] }
};
const MODES = [['auto', 'אוטומטי'], ['light', 'בהיר'], ['dark', 'כהה']];
let MODE = ls.get('rak-mode') || 'auto';
function applyTheme(k) {
  const t = THEMES[k] || THEMES.rose, v = ([a, b, c, d]) => `--acc:${a};--accT:${b};--h1:${c};--h2:${d}`;
  let el = document.getElementById('acc-style'); if (!el) { el = document.createElement('style'); el.id = 'acc-style'; document.head.append(el); }
  el.textContent = `:root{${v(t.l)}}@media (prefers-color-scheme:dark){:root:not([data-mode=light]){${v(t.d)}}}:root[data-mode=dark]{${v(t.d)}}`;
  if (MODE === 'auto') document.documentElement.removeAttribute('data-mode'); else document.documentElement.dataset.mode = MODE;
  const dark = MODE === 'dark' || (MODE === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#0F1B26' : '#EEF4F5');
}
const AV = ['#137A69', '#12263A', '#F2B544', '#E8833A', '#C2453A', '#7A5CC4', '#2F80ED', '#7BB89A'];
const avColor = id => { let h = 0; for (const c of String(id || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return AV[h % AV.length]; };
// avatar: own photo → chosen character → first letter
const avatar = (id, name, cls = '') => {
  const m = S.members?.[id] || {}, ch = m.prefs?.av;
  if (m.avatar && /^data:image\//.test(m.avatar)) return `<div class="avatar ${cls}" style="background:var(--line)"><img src="${m.avatar}" alt=""></div>`;
  if (ch && ch.e) return `<div class="avatar emo ${cls}" style="--av:${esc(ch.c || avColor(id))}">${esc(ch.e)}</div>`;
  return `<div class="avatar ${cls}" style="--av:${avColor(id)}">${esc((name || m.name || '?').slice(0, 1))}</div>`;
};
const EMO = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵', '🦄', '🐧', '🐰', '🐹', '🐙', '🦋', '🌸', '🌻', '⭐', '🌙', '☀️', '🍀', '🎧', '🍕'];
// shrink a picked photo to a small square JPEG before saving
async function shrinkPhoto(file) {
  let img;
  try { img = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch (_) { img = await new Promise((res, rej) => { const u = URL.createObjectURL(file), i = new Image(); i.onload = () => { URL.revokeObjectURL(u); res(i); }; i.onerror = rej; i.src = u; }); }
  const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, s = Math.min(w, h), c = document.createElement('canvas'); c.width = c.height = 320;
  c.getContext('2d').drawImage(img, (w - s) / 2, (h - s) / 2, s, s, 0, 0, 320, 320);
  let q = .82, out = c.toDataURL('image/jpeg', q); while (out.length > 140000 && q > .4) { q -= .12; out = c.toDataURL('image/jpeg', q); }
  return out;
}

// ---- logo options (the real app uses LOGO; the demo can switch) ----
const HEART = 'M50 86C20 66 6 50 6 32 6 18 17 8 30 8c9 0 16 5 20 12 4-7 11-12 20-12 13 0 24 10 24 24 0 18-14 34-44 54z';
const HEART2 = 'M50 88C19 67 5 51 5 32 5 17 16 7 30 7c9 0 16 5 20 12 4-7 11-12 20-12 14 0 25 10 25 25 0 19-14 35-45 56z';
const LOGOS = {
  arrow:  { name: 'לב עם חץ', svg: c => { const a = c === '#fff' ? '#ffd66b' : '#e0a400'; return `<g transform="rotate(-8 50 50)"><path d="M10 84 88 22" stroke="${a}" stroke-width="5" stroke-linecap="round"/><path d="M95 16 74 20 85 32z" fill="${a}"/><path d="M14 80 3 77 8 72 18 76zM14 80 17 91 22 86 18 76zM21 75 10 72 15 67 25 71zM21 75 24 86 29 81 25 71z" fill="${a}"/><path d="${HEART2}" transform="translate(17 18) scale(.66)" fill="${c}"/></g>`; } },
  hearts: { name: 'שני לבבות', svg: c => `<path d="${HEART}" transform="translate(-6 10) scale(.78)" fill="${c}" opacity=".55"/><path d="${HEART}" transform="translate(28 6) scale(.78)" fill="${c}"/>` },
  note:   { name: 'פתק עם לב', svg: c => `<path d="M18 14h64v50L64 86H18z" fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round"/><path d="M64 86V64h18" fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round"/><path d="${HEART}" transform="translate(30 30) scale(.4)" fill="${c}"/>` },
  home:   { name: 'בית קטן', svg: c => `<path d="M12 46 50 14l38 32v40H12z" fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round"/><path d="${HEART}" transform="translate(30 42) scale(.4)" fill="${c}"/>` },
  talk:   { name: 'שתי בועות', svg: c => `<path d="M10 18h46v32H30l-12 10V50h-8z" fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round"/><path d="M44 44h46v32h-8v10l-12-10H44z" fill="${c}"/><path d="${HEART}" transform="translate(56 50) scale(.22)" fill="var(--rose)"/>` }
};
let LOGO = 'arrow';
const logo = (size, color) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${LOGOS[LOGO].svg(color || 'currentColor')}</svg>`;

const S = { stage: 'splash', slide: 0, authMode: 'up', err: '', info: '', me: null, couple: null, members: {}, items: [], tab: (location.hash || '#home').slice(1), issueF: 'open', drawn: null, arm: null, push: 'unknown', edit: null, theme: 'rose', ready: false, pref: {}, myName: '', splashBtn: false };
if (THEMES[ls.get('rak-theme')]) S.theme = ls.get('rak-theme');
let channel = null, toastT;
applyTheme(S.theme);

// ---- helpers ----
const pad = n => String(n).padStart(2, '0');
const keyOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const today = () => keyOf(new Date());
const dnum = k => Math.round(Date.parse(k + 'T00:00:00Z') / 864e5);
const realName = id => S.members[id]?.name || 'מישהו';
const nameOf = id => (id && id !== S.me && S.members[S.me]?.prefs?.nickFor) || realName(id);
const nickForMe = () => { const p = Object.keys(S.members).find(i => i !== S.me); return p ? S.members[p]?.prefs?.nickFor || '' : ''; };
const pid = () => Object.keys(S.members).find(i => i !== S.me);
const pName = () => pid() ? nameOf(pid()) : 'בן/בת הזוג';
const gOf = id => (id && S.members[id]?.prefs?.g) || (id === S.me ? S.pref.g : null);
const G = (id, m, f) => { const g = gOf(id); return g === 'm' || m === f ? m : g === 'f' ? f : m + '/' + f; };
const M = (m, f) => G(S.me, m, f), P = (m, f) => G(pid(), m, f);
const qText = k => { const st = S.items.find(i => i.kind === 'answer' && i.data?.day === k && i.data?.qt); return fmtQ(st ? st.data.qt : qFor(k)); };
const fmtQ = t => String(t).replace(/\[([^|\]]*)\|([^\]]*)\]/g, (_, m, f) => M(m, f)).replace(/\{([^|}]*)\|([^}]*)\}/g, (_, m, f) => P(m, f));
const fmt = t => new Date(t).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
const fmtT = t => new Date(t).toLocaleString('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const heD = k => { const [y, m, d] = k.split('-'); return d + '.' + m + '.' + y.slice(2); };
const openHug = () => of('hug').find(x => x.by !== S.me && !x.ack && Date.now() - x.at < 864e5);
const of = kind => S.items.filter(i => i.kind === kind && !i.data?.deleted).map(i => ({ id: i.id, by: i.by, at: Date.parse(i.created_at), ...i.data }));
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

function toast(m) { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); } t.textContent = m; clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 3200); }
async function run(p, ok) { const { error } = await p; if (error) { console.error(error); toast('לא נשמר, בדקו אינטרנט ונסו שוב'); return false; } if (ok) toast(ok); return true; }
const NOKEY = () => { toast('המכשיר הזה עוד לא אושר, אז אי אפשר לשמור'); return false; };
async function add(kind, data) {
  let d; try { d = await sealData(data); } catch (_) { return NOKEY(); }
  const { data: row, error } = await sb.from('items').insert({ couple_id: S.couple.id, kind, data: d }).select().single();
  if (error) { console.error(error); toast('לא נשמר, בדקו אינטרנט ונסו שוב'); return false; }
  if (row && !S.items.some(i => i.id === row.id)) { S.items.unshift({ ...row, data }); S.items.sort((a, b) => b.created_at.localeCompare(a.created_at)); if (S.stage === 'app') render(); }
  return true;
}
async function upd(id, patch, ok) { const it = S.items.find(i => i.id === id); if (!it) return; const data = { ...it.data, ...patch }; let d; try { d = await sealData(data); } catch (_) { return NOKEY(); } it.data = data; render(); return run(sb.from('items').update({ data: d }).eq('id', id), ok); }
async function del(id) {
  const it = S.items.find(i => i.id === id); S.items = S.items.filter(i => i.id !== id); render();
  // mark first so the other phone hides it at once (deletes can't be filtered per couple), then delete for real
  if (it) try { await sb.from('items').update({ data: await sealData({ ...it.data, deleted: true }) }).eq('id', id); } catch (_) { }
  const ok = await run(sb.from('items').delete().eq('id', id));
  if (ok && it?.kind === 'memory') dropPhotos(it.data?.photos);
  return ok;
}
function nextOcc(e) { const t = dnum(today()); if (!e.yearly) return dnum(e.date) - t; const [, m, d] = e.date.split('-'); const y = new Date().getFullYear(); let k = dnum(y + '-' + m + '-' + d) - t; if (k < 0) k = dnum((y + 1) + '-' + m + '-' + d) - t; return k; }
const delBtn = id => S.arm === id ? `<button class="mini" data-act="del" data-id="${esc(id)}">בטוח? למחוק</button>` : `<button class="mini" data-act="arm" data-id="${esc(id)}">מחיקה</button>`;

const ICON = { games: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="16" cy="16" r="1.4" fill="currentColor"/>', home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>', notes: '<path d="M5 4h14v11l-5 5H5zM14 20v-5h5"/>', together: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', q: '<path d="M9 9a3 3 0 116 0c0 2-3 2-3 5M12 18v.5"/><circle cx="12" cy="12" r="10"/>', talk: '<path d="M4 5h16v11H9l-5 4z"/>', me: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>', jar: '<path d="M7 3h10v3a5 5 0 01-1 3l-1 1v9a1 1 0 01-1 1h-4a1 1 0 01-1-1v-9L8 9a5 5 0 01-1-3z"/>', cam: '<path d="M4 7h4l2-3h4l2 3h4v12H4z"/><circle cx="12" cy="13" r="3.5"/>', bell: '<path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>', brush: '<path d="M14 4l6 6-9 9H5v-6z"/>', link: '<path d="M10 14a4 4 0 006 0l3-3a4 4 0 00-6-6l-1 1M14 10a4 4 0 00-6 0l-3 3a4 4 0 006 6l1-1"/>' };
const ico = (k, s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${ICON[k]}</svg>`;
const TABS = [['home', 'בית'], ['notes', 'פתקים'], ['together', 'ביחד'], ['games', 'משחקים'], ['me', 'אני']];
const VIEWS = ['home', 'notes', 'together', 'games', 'talk', 'me', 'q', 'profile', 'premium', 'book'];
if (!VIEWS.includes(S.tab)) S.tab = 'home';
const heart = (n, l) => `<svg viewBox="0 0 300 270" role="img" aria-label="${esc(l)} ${n}"><defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--h1)"/><stop offset="1" style="stop-color:var(--h2)"/></linearGradient></defs><g class="beat"><path d="M150 258C60 196 8 146 8 86 8 44 40 12 82 12c30 0 52 16 68 40 16-24 38-40 68-40 42 0 74 32 74 74 0 60-52 110-142 172z" fill="url(#hg)"/><path d="M60 50c-18 8-28 26-28 44" stroke="#fff" stroke-opacity=".45" stroke-width="10" fill="none" stroke-linecap="round"/><text x="150" y="128" text-anchor="middle" class="n">${n}</text><text x="150" y="162" text-anchor="middle" class="l">${esc(l)}</text></g></svg>`;

// ===== onboarding, built like צעד: splash → hi → sign-up → focus → notifications → pairing =====
const FOCUS = ['💬 יותר מילים טובות', '🍿 זמן איכות ודייטים', '🤝 לדבר על מה שמפריע', '🔍 להכיר יותר לעומק', '🫂 תמיכה בימים קשים', '🎁 להפתיע אחד את השני'];
const dots = n => `<div class="dots" aria-label="שלב ${n} מתוך 4">${[1, 2, 3, 4].map(i => `<i class="${i === n ? 'on' : ''}"></i>`).join('')}</div>`;
const backBtn = to => `<button type="button" class="wide ghost" data-act="goto" data-s="${to}">חזרה</button>`;
// a personal opening screen: the two of you, today's greeting, and how long you've been together
const face = () => { try { return JSON.parse(ls.get('rak-face') || 'null'); } catch (_) { return null; } };
function saveFace() {
  if (!S.me || !S.members[S.me]) return;
  const p = pid(), pick = id => { const m = S.members[id]; return { user_id: id, name: m.name, avatar: m.avatar || null, prefs: { av: m.prefs?.av || null } }; };
  ls.set('rak-face', JSON.stringify({ me: S.me, p, m: { [S.me]: pick(S.me), ...(p ? { [p]: pick(p) } : {}) }, start: S.couple?.start_date || null, pn: p ? pName() : '' }));
}
function faceTop(f, small) {
  const keep = S.members; S.members = { ...f.m, ...keep };
  const h = `<div class="faces ${small ? 'sm' : ''}">${avatar(f.me, '', 'fa')}<span class="fheart">${logo(small ? 40 : 60)}</span>${f.p ? avatar(f.p, '', 'fa') : ''}</div>`;
  S.members = keep; return h;
}
function helloView(f) {
  const days = f.start ? dnum(today()) - dnum(f.start) : null, myN = f.m[f.me]?.name || '';
  return `<div class="onb splash hello ${S.helloOut ? 'out' : ''}">${faceTop(f)}<h1 class="fade">${greet()}${myN ? ', ' + esc(myN) : ''}</h1>
<p class="tag fade">${f.p ? esc(myN) + ' ו' + esc(f.pn) : 'רק שלנו'}${days != null && days >= 0 ? ` · יום ${days.toLocaleString('he-IL')} ביחד` : ''}</p></div>`;
}
function showHello() { const f = face(); if (!f) return; S.hello = true; S.helloOut = false; render(); setTimeout(() => { S.helloOut = true; render(); setTimeout(() => { S.hello = false; S.helloOut = false; render(); }, 450); }, 1700); }
function splashView() {
  const f = !S.splashBtn && !pinSaved() && face();
  if (f) return helloView(f);
  if (false) {
    const days = f.start ? dnum(today()) - dnum(f.start) : null, myN = f.m[f.me]?.name || '';
    return `<div class="onb splash hello">${faceTop(f)}<h1 class="fade">${greet()}${myN ? ', ' + esc(myN) : ''}</h1>
<p class="tag fade">${f.p ? esc(myN) + ' ו' + esc(f.pn) : 'רק שלנו'}${days != null && days >= 0 ? ` · יום ${days.toLocaleString('he-IL')} ביחד` : ''}</p></div>`;
  }
  return `<div class="onb splash"><div class="pop" style="color:var(--acc)">${logo(130)}</div><h1 class="fade">רק שלנו</h1><p class="tag fade">לאהוב. להקשיב. להתקרב.</p>
${S.splashBtn ? `<div class="onbbtns fade"><button class="wide" data-act="goto" data-s="intro">המשך</button></div>` : ''}</div>`;
}
function introView() {
  return `<div class="onb"><h1>היי, אני ברק 👋</h1>
<p class="body">וזאת רק שלנו. בניתי אותה בשבילי ובשביל בת הזוג שלי, כדי שיהיה לנו מקום קטן רק שלנו: לפתקים, לחיבוקים, לדייטים, וגם לדברים שפחות נעים לדבר עליהם.</p>
<div class="howbox"><b>איך זה עובד</b><p>כל אחד נרשם מהטלפון שלו, ומתחברים עם קוד. כל יום יש שאלה קטנה לשניכם, ואפשר להשאיר פתק או לבקש חיבוק. מה שכותבים פה, רק שניכם רואים.</p></div>
<p class="body">בואו נתחיל.</p>
<div class="onbbtns"><button class="wide" data-act="goto" data-s="auth" data-m="up">המשך</button><button class="wide ghost" data-act="goto" data-s="auth" data-m="in">יש לי כבר חשבון</button></div></div>`;
}
// Google sign-in: the web client id from Google Cloud; the button stays hidden until it's filled in
const GOOGLE_WEB_CLIENT = '605016176187-h0h2a1dvgn8teesh85t6mrgmf4a9k482.apps.googleusercontent.com';
const GOOGLE_ON = !!GOOGLE_WEB_CLIENT || DEMO;
const GBTN = `<button type="button" class="wide gbtn" data-act="google"><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>המשך עם Google</button>
<div class="or"><span>או עם אימייל</span></div>`;
function authView() {
  const up = S.authMode === 'up';
  if (!up) return `<div class="onb"><h1>ברוכים השבים</h1><p class="lead">נכנסים עם ${NATIVE ? '' : 'Google או עם '}האימייל והסיסמה שלכם.</p>
${S.err ? `<p class="err">${esc(S.err)}</p>` : ''}${!GOOGLE_ON ? '' : GBTN}
<form data-form="auth"><label for="em">אימייל</label><input id="em" type="email" name="email" autocomplete="username email" inputmode="email" required dir="ltr">
<label for="pw">סיסמה</label><input id="pw" name="password" type="password" autocomplete="current-password" minlength="6" required dir="ltr">
${S.err ? `<p class="err">${esc(S.err)}</p>` : ''}${S.info ? `<p class="info">${esc(S.info)}</p>` : ''}
<div class="onbbtns"><button class="wide">כניסה</button><button type="button" class="wide ghost" data-act="authmode">אין לי חשבון עדיין</button></div></form></div>`;
  return `<div class="onb">${dots(1)}<h1>נעים להכיר</h1><p class="lead">${NATIVE ? 'רק שם, אימייל וסיסמה.' : 'הכי מהיר: עם חשבון Google.'} את בן/בת הזוג מצרפים בסוף.</p>
${!GOOGLE_ON ? '' : GBTN.replace('<div class="or">', '<p class="hint" style="margin-top:-6px">כניסה עם Google היא גם אישור של <a href="privacy.html" data-act="privacy" style="color:var(--acc)">מדיניות הפרטיות</a>.</p><div class="or">')}
<form data-form="auth"><label for="nm">איך קוראים לך?</label><input id="nm" maxlength="30" required autocomplete="given-name"><p class="hint">זה השם שבן/בת הזוג יראו.</p>
<label for="em">אימייל</label><input id="em" type="email" name="email" autocomplete="username email" inputmode="email" required dir="ltr">
<label for="pw">סיסמה</label><input id="pw" name="password" type="password" autocomplete="new-password" minlength="6" required dir="ltr"><p class="hint">לפחות 6 תווים.</p>
<label class="check" style="margin-top:8px"><input id="agree" type="checkbox" required> <span>קראתי את מדיניות הפרטיות, והיא מקובלת עליי</span></label>
<a class="linkbtn" href="privacy.html" data-act="privacy" style="justify-self:start;display:inline-flex;align-items:center;text-decoration:none;font-weight:600">לקריאת המדיניות</a>
${S.err ? `<p class="err">${esc(S.err)}</p>` : ''}${S.info ? `<p class="info">${esc(S.info)}</p>` : ''}
<div class="onbbtns"><button class="wide">המשך</button>${backBtn('intro')}</div></form></div>`;
}
function focusView() {
  const f = S.pref.focus || [];
  const gChips = `<div class="chips"><button type="button" class="chip" data-act="gender" data-v="m" aria-pressed="${S.pref.g === 'm'}">בלשון זכר</button><button type="button" class="chip" data-act="gender" data-v="f" aria-pressed="${S.pref.g === 'f'}">בלשון נקבה</button></div>`;
  return `<div class="onb">${dots(2)}<h1>עוד קצת עליך</h1><p class="lead">ככה האפליקציה תדבר אליכם נכון.</p>
<h3>איך לפנות אליך?</h3>${gChips}
<h3 style="margin-top:8px">על מה תרצו לעבוד ביחד?</h3><p class="hint" style="margin-top:-8px">בחרו עד 3. תמיד אפשר לשנות אחר כך.</p>
<div class="chips">${FOCUS.map(x => `<button type="button" class="chip" data-act="focus" data-v="${esc(x)}" aria-pressed="${f.includes(x)}">${esc(x)}</button>`).join('')}</div>
<label for="fother">משהו אחר? (לא חובה)</label><input id="fother" maxlength="80" placeholder="למשל: להיפגש יותר למרות המרחק" value="${esc(S.pref.other || '')}">
${S.pref.g ? '' : '<p class="hint">כדי להמשיך, בחרו איך לפנות אליכם.</p>'}<div class="onbbtns"><button class="wide" data-act="goto" data-s="notify" ${S.pref.g ? '' : 'disabled'}>המשך</button></div></div>`;
}
function notifyView() {
  const n = S.pref.notify, iosWeb = isIOS && !standalone && !DEMO;
  return `<div class="onb">${dots(3)}<h1>כמעט סיימנו</h1><p class="lead">עוד החלטה קטנה אחת.</p>
<h3 style="margin-top:6px">התראות</h3><p class="hint" style="margin-top:-8px">נודיע לך כשמגיע פתק, בקשת חיבוק או נקודה לשיחה. בלי ספאם.</p>
<div class="chips"><button type="button" class="chip" data-act="notify" data-v="yes" aria-pressed="${n === 'yes'}">🔔 כן, תודיעו לי</button><button type="button" class="chip" data-act="notify" data-v="no" aria-pressed="${n === 'no'}">בלי התראות</button></div>
${NATIVE && n === 'yes' ? `<div class="howbox"><b>כמעט</b><p>בגרסה הזאת של האפליקציה ההתראות עוד לא פעילות. הן יגיעו בעדכון הבא, ונשמור את הבחירה שלך.</p></div>` : ''}
${iosWeb && n === 'yes' ? `<div class="howbox"><b>באייפון צריך עוד צעד אחד</b><p>בספארי לוחצים על כפתור השיתוף ← "הוספה למסך הבית", ופותחים את האפליקציה מהאייקון. ההתראות נדלקות משם, ב"אני".</p></div>` : ''}
<div class="onbbtns"><button class="wide" data-act="notifydone">המשך</button>${backBtn('focus')}</div></div>`;
}
function pairView() {
  const mode = S.pairMode, needName = !S.myName;
  const nameField = id => needName ? `<label for="${id}">איך קוראים לך?</label><input id="${id}" maxlength="30" required>` : '';
  if (!mode) return `<div class="onb">${dots(4)}<h1>מתחברים</h1><p class="lead">מי מכם פותח את המקום המשותף?</p>
<button class="choice" data-act="pairmode" data-m="create"><span class="fi">${ico('home', 24)}</span><span class="t"><b>${M('אני פותח', 'אני פותחת')}</b>אקבל קוד ואשלח לבן/בת הזוג</span></button>
<button class="choice" data-act="pairmode" data-m="join"><span class="fi">${ico('link', 24)}</span><span class="t"><b>קיבלתי קוד</b>מצטרפים למקום שכבר נפתח</span></button>
${S.err ? `<p class="err">${esc(S.err)}</p>` : ''}<div class="onbbtns">${backBtn('notify')}</div>
<details class="card" id="d-acct"><summary>חשבון</summary><button class="mini" data-act="logout">התנתקות</button>${acctTools()}</details></div>`;
  if (mode === 'create') return `<div class="onb">${dots(4)}<h1>פותחים מקום</h1><p class="lead">בסוף תקבלו קוד לשלוח לבן/בת הזוג.</p><form data-form="create">${nameField('cname')}
<label for="cstart">מתי התחלתם? (לא חובה)</label><input id="cstart" type="date"><p class="hint">ככה נספור כמה ימים אתם ביחד.</p>
${S.err ? `<p class="err">${esc(S.err)}</p>` : ''}<div class="onbbtns"><button class="wide">יצירה וקבלת קוד</button><button type="button" class="wide ghost" data-act="pairmode" data-m="">חזרה</button></div></form></div>`;
  return `<div class="onb">${dots(4)}<h1>מצטרפים</h1><p class="lead">את הקוד מקבלים מבן/בת הזוג.</p><form data-form="join">
<label for="jcode">הקוד</label><input id="jcode" maxlength="6" required dir="ltr" autocapitalize="characters" class="codein">${nameField('jname')}
${S.err ? `<p class="err">${esc(S.err)}</p>` : ''}<div class="onbbtns"><button class="wide">הצטרפות</button><button type="button" class="wide ghost" data-act="pairmode" data-m="">חזרה</button></div></form></div>`;
}
function waitView() {
  const msg = encodeURIComponent('פתחתי לנו מקום ב"רק שלנו" ❤️\nנכנסים לקישור, נרשמים, ומכניסים את הקוד: ' + S.couple.code + '\n' + location.origin + location.pathname);
  return `<div class="onb"><div class="mark" style="color:var(--acc)">${logo(64)}</div><h1>שלחו את הקוד</h1><p class="lead">ברגע שהקוד מוזן בטלפון השני, המקום נפתח לשניכם.</p>
<div class="code">${esc(S.couple.code)}</div>
<a class="wide wa" href="https://wa.me/?text=${msg}" target="_blank" rel="noopener">שליחה בוואטסאפ</a>
<button class="wide ghost" data-act="copycode">העתקת הקוד</button>
<button class="wide ghost" data-act="solo">להיכנס בינתיים לבד</button>
<details class="card" id="d-acct" style="margin-top:18px"><summary>חשבון</summary><button class="mini" data-act="logout">התנתקות</button>${acctTools()}</details></div>`;
}

// [question, topic]. [m|f] = form for the reader, {m|f} = form for the partner who "asks"
const QB = [
  // words – kind words, appreciation
  ['מה הדבר הכי קטן שעשיתי השבוע ששימח אותך?', 'words'], ['מה הדבר הכי יפה שאמרתי לך אי פעם?', 'words'], ['איזו מחמאה ממני הכי נשארה לך בראש?', 'words'],
  ['מה היית רוצה לשמוע ממני יותר?', 'words'], ['איזו מילה הכי מתארת אותנו ביחד?', 'words'], ['על מה היית רוצה להגיד לי תודה השבוע?', 'words'],
  ['מה עשיתי לאחרונה שגרם לך להרגיש [מוערך|מוערכת]?', 'words'], ['איזה משפט ממני מרגיע אותך הכי מהר?', 'words'], ['מה [אתה|את] [מעריך|מעריכה] בי ולא אמרת?', 'words'],
  ['מה הכי מצחיק אותך אצלי?', 'words'], ['איזה הרגל שלי [אתה|את] הכי [אוהב|אוהבת]?', 'words'], ['מה גורם לך להרגיש [אהוב|אהובה]?', 'words'],
  ['איך [היית מתאר|היית מתארת] אותי במשפט אחד?', 'words'], ['מה הדבר הראשון ששמת לב אליו אצלי?', 'words'], ['על מה [אתה|את] מודה היום?', 'words'],
  ['איזה דבר קטן ממני עושה לך את היום?', 'words'], ['מה למדת ממני מאז שאנחנו ביחד?', 'words'], ['באיזה רגע היית גאה בי?', 'words'],
  ['איזו תכונה שלי היית רוצה שתהיה גם לך?', 'words'], ['מה היית כותב{|ת} עליי בפתק קטן?', 'words'], ['מתי בפעם האחרונה צחקת בגללי?', 'words'],
  ['מה ההודעה הכי מתוקה ששלחתי לך?', 'words'], ['מה [אתה|את] הכי [אוהב|אוהבת] בדרך שבה אני מסתכל{|ת} [עליך|עלייך]?', 'words'],
  // time – quality time & dates
  ['איזה דייט חלומי [היית מתכנן|היית מתכננת] לנו?', 'time'], ['מה היית רוצה שנעשה יחד בחודש הקרוב?', 'time'], ['אם היה לנו יום חופשי מחר, מה היינו עושים?', 'time'],
  ['איזה סרט היינו צריכים לראות יחד?', 'time'], ['מה המקום שהכי היית רוצה לטוס אליו איתי?', 'time'], ['מה המאכל שהיית רוצה שנבשל יחד?', 'time'],
  ['מה היה הבילוי הכי טוב שלנו עד היום?', 'time'], ['איזה תחביב היית רוצה שננסה ביחד?', 'time'], ['ערב מושלם בבית: איך הוא נראה?', 'time'],
  ['איזה מקום בארץ עוד לא היינו בו ביחד?', 'time'], ['מה היית רוצה שנעשה בסוף השבוע הקרוב?', 'time'], ['איזו מסורת קטנה היית רוצה שתהיה לנו?', 'time'],
  ['מה היית רוצה לנסות לראשונה ביחד?', 'time'], ['איזו סדרה היינו צריכים להתחיל ביחד?', 'time'], ['זריחה או שקיעה, ואיפה היית רוצה לראות אותה איתי?', 'time'],
  ['מה הדבר הכי ספונטני שהיית רוצה שנעשה?', 'time'], ['איזה שיר היית רוצה שנרקוד אליו בסלון?', 'time'], ['מה היינו עושים ביום גשום בלי טלפונים?', 'time'],
  ['איזו מסעדה היית רוצה שנחזור אליה?', 'time'], ['מה היית רוצה שנעשה ביום ההולדת הבא שלך?', 'time'], ['איך היה נראה הטיול המושלם שלנו?', 'time'],
  // talk – communication
  ['על מה היית רוצה שנדבר יותר?', 'talk'], ['מה גורם לך להרגיש שאני {מקשיב|מקשיבה}?', 'talk'], ['מה הדרך הכי טובה לפייס אותך?', 'talk'],
  ['מה היית רוצה לשנות בשגרה שלנו?', 'talk'], ['איך [אתה מעדיף|את מעדיפה] שאגיד לך שמשהו מפריע לי?', 'talk'], ['מתי הכי קל לך לדבר על דברים רציניים?', 'talk'],
  ['מה עוזר לך להירגע אחרי ויכוח?', 'talk'], ['על איזה נושא קשה לך לדבר איתי, ולמה?', 'talk'], ['מה היית רוצה שאשאל אותך יותר?', 'talk'],
  ['מה הדבר האחד שהיית רוצה שאבין [עליך|עלייך] טוב יותר?', 'talk'], ['איך [אתה יודע|את יודעת] שאני באמת {מקשיב|מקשיבה}?', 'talk'], ['מה למדנו מהוויכוח האחרון שלנו?', 'talk'],
  ['מה גורם לך להרגיש שאנחנו צוות?', 'talk'], ['יש משהו קטן שהיית רוצה שאעשה אחרת?', 'talk'], ['מה הכי חשוב לך בזוגיות?', 'talk'],
  ['איך היית רוצה שנחליט ביחד על דברים גדולים?', 'talk'], ['מה עוזר לך להרגיש [בטוח|בטוחה] להגיד לי הכול?', 'talk'], ['מתי בפעם האחרונה הרגשת שלא שמעתי אותך?', 'talk'],
  // deep – getting to know each other
  ['מה עוד לא סיפרת לי על הילדות שלך?', 'deep'], ['מה החלום שלך שעוד לא סיפרת עליו?', 'deep'], ['איפה [אתה|את] רואה אותנו בעוד שנה?', 'deep'],
  ['מה למדת עליי שהפתיע אותך?', 'deep'], ['מה השיר שמזכיר לך אותנו?', 'deep'], ['איזה זיכרון שלנו [אתה|את] הכי [אוהב|אוהבת]?', 'deep'],
  ['מי האדם שהכי השפיע [עליך|עלייך] בחיים?', 'deep'], ['מה הפחד הכי גדול שלך היום?', 'deep'], ['איזה רגע בחיים שינה אותך?', 'deep'],
  ['מה היית רוצה להספיק בשנים הקרובות?', 'deep'], ['מה הדבר שהכי חשוב לך שאדע [עליך|עלייך]?', 'deep'], ['איזה ספר או סרט השפיע [עליך|עלייך] במיוחד?', 'deep'],
  ['מה גורם לך להרגיש בבית?', 'deep'], ['מה הזיכרון הכי טוב שלך מהמשפחה?', 'deep'], ['אם היית יכול{|ה} ללמוד כל דבר, מה זה היה?', 'deep'],
  ['מה היית אומר{|ת} לעצמך מלפני חמש שנים?', 'deep'], ['איזו מסורת מהבית שלך היית רוצה שנמשיך?', 'deep'], ['מה מרגש אותך בעתיד שלנו?', 'deep'],
  ['מה הדבר הכי אמיץ שעשית?', 'deep'], ['מה [אתה|את] הכי [אוהב|אוהבת] בעצמך?', 'deep'], ['איזו עבודה הייתה עבודת החלומות שלך?', 'deep'],
  ['מה גורם לך להרגיש הכי חי{|ה}?', 'deep'], ['איזה מקום מהעבר היית רוצה לחזור אליו ליום אחד?', 'deep'], ['מתי הרגשת הכי [קרוב|קרובה] אליי?', 'deep'],
  // support – hard days
  ['מה מעייף אותך בזמן האחרון, ואיך אני {יכול|יכולה} לעזור?', 'support'], ['מה מלחיץ אותך עכשיו?', 'support'], ['מה מרגיע אותך כשקשה?', 'support'],
  ['מה עזר לך השבוע?', 'support'], ['מה [אתה צריך|את צריכה] ממני ביום רע?', 'support'], ['איך [אתה מעדיף|את מעדיפה] שאתמוך בך: מילים, חיבוק או שקט?', 'support'],
  ['מה הדבר שהכי חסר לך כשאנחנו לא ביחד?', 'support'], ['על מה [אתה דואג|את דואגת] בזמן האחרון?', 'support'], ['מה נותן לך כוח כשנגמר הכוח?', 'support'],
  ['איך אני יכול{|ה} להקל [עליך|עלייך] השבוע?', 'support'], ['מה עושה לך יום טוב?', 'support'], ['מה היה הרגע הכי טוב שלך השבוע?', 'support'],
  ['מה היה הרגע הכי קשה שלך השבוע?', 'support'], ['איזה דבר קטן הייתי יכול{|ה} לעשות מחר שיעשה לך טוב?', 'support'], ['מה היית רוצה שאזכור כשקשה לך?', 'support'],
  ['מתי הרגשת לאחרונה שאני שם בשבילך?', 'support'], ['מה הדבר שהכי עוזר לך לישון טוב?', 'support'],
  // surprise – surprising each other
  ['איזו הפתעה הכי שימחה אותך אי פעם?', 'surprise'], ['מה המתנה הכי טובה שקיבלת בחיים?', 'surprise'], ['איזו הפתעה קטנה היית רוצה לקבל ממני?', 'surprise'],
  ['פרחים, מכתב או ארוחה: מה הכי ירגש אותך?', 'surprise'], ['איזה מקום היית שמח{|ה} שאקח אותך אליו בהפתעה?', 'surprise'], ['מה היית רוצה לקבל ליום ההולדת הבא?', 'surprise'],
  ['איזה מאכל היה הכי משמח אותך לקבל פתאום?', 'surprise'], ['מה היית עושה אם היית יכול{|ה} להפתיע אותי מחר?', 'surprise'], ['איזו הפתעה שעשיתי לך הכי זכורה לך?', 'surprise'],
  ['מה דעתך על הפתעות: [אוהב|אוהבת] או [מעדיף|מעדיפה] לדעת מראש?', 'surprise'], ['איזו חוויה היית רוצה לקבל במתנה?', 'surprise'], ['מה השיר שהיית רוצה שאקדיש לך?', 'surprise'],
  ['מה הדבר הכי טעים שאכלנו ביחד?', 'time'], ['איזה ערב שלנו היית רוצה לחזור עליו בדיוק אותו דבר?', 'time'], ['מה היית רוצה שנלמד ביחד השנה?', 'time'],
  ['איזו הפתעה הכי קלה שאני יכול{|ה} לעשות לך השבוע?', 'surprise'], ['מה הדבר הכי רומנטי שמישהו עשה בסרט שהיית רוצה שנעשה?', 'surprise'], ['איזה פתק היית שמח{|ה} למצוא בכיס?', 'surprise'],
  ['מה גורם לך להרגיש שאני בצד שלך?', 'support'], ['איזה שיר עוזר לך כשקשה?', 'support'], ['מה היית רוצה שאגיד לך לפני מבחן או יום חשוב?', 'support'],
  ['מה [אתה|את] הכי [אוהב|אוהבת] לעשות כשאנחנו לבד?', 'time'], ['מה עשיתי פעם שגרם לך להתאהב עוד קצת?', 'words'], ['איזו מילה טובה היית רוצה שאגיד לך כל בוקר?', 'words'],
  ['מה הדבר שהכי סקרן אותך לגביי בהתחלה?', 'deep'], ['איזה הרגל היית רוצה לבנות השנה?', 'deep'], ['מה מעצבן אותך שאני עושה, אבל בקטע חמוד?', 'fun'],
  // fun – light & silly
  ['אם היינו דמויות מסרט, מי היינו?', 'fun'], ['איזו חיה הכי דומה לי, ולמה?', 'fun'], ['מה המאכל הכי מוזר שהיית מוכן{|ה} לנסות איתי?', 'fun'],
  ['אם היה לנו כלב, איך היינו קוראים לו?', 'fun'], ['איזה כוח-על היית רוצה, ומה היית עושה איתו בשבילנו?', 'fun'], ['מה הדבר הכי מביך שקרה לך מולי?', 'fun'],
  ['מי מאיתנו יותר מבולגן?', 'fun'], ['מי מאיתנו היה שורד יותר זמן על אי בודד?', 'fun'], ['איזה שיר הכי מתאר את מצב הרוח שלך היום?', 'fun'],
  ['אם היינו פותחים עסק ביחד, מה הוא היה?', 'fun'], ['מה האימוג׳י שהכי מתאר אותי?', 'fun'], ['איזה כישרון שלך היית רוצה שאכיר יותר?', 'fun'],
  ['מה הדבר הכי מצחיק שקרה לנו ביחד?', 'fun'], ['מתי צחקנו הכי הרבה?', 'fun'], ['מי מאיתנו מבשל טוב יותר? תהיו כנים 😄', 'fun'],
  ['איזו מילה אני אומר{|ת} יותר מדי?', 'fun'], ['אם היינו מחליפים גוף ליום אחד, מה היית עושה ראשון?', 'fun'], ['איזה שם היית נותן{|ת} לזוגיות שלנו?', 'fun'],
  ['איזו עונה הכי מתאימה לנו, ולמה?', 'fun'], ['מה ההרגל הכי מוזר שלך שעוד לא גיליתי?', 'fun'], ['איזה פרסומת הכי נתקעה לך בראש?', 'fun'],
  ['מה היה השם שלנו בתור צמד זמרים?', 'fun'], ['מה היית קונה{|ה} אם היינו זוכים בלוטו?', 'fun'], ['מי מאיתנו היה מנצח במשחק טריוויה?', 'fun']
];
const FOCUS_TOPIC = { '💬 יותר מילים טובות': 'words', '🍿 זמן איכות ודייטים': 'time', '🤝 לדבר על מה שמפריע': 'talk', '🔍 להכיר יותר לעומק': 'deep', '🫂 תמיכה בימים קשים': 'support', '🎁 להפתיע אחד את השני': 'surprise' };
// both partners get the same question: the choice depends only on the date and both people's picks
function coupleTopics() { const t = new Set(); for (const m of Object.values(S.members || {})) for (const f of (m.prefs?.focus || [])) if (FOCUS_TOPIC[f]) t.add(FOCUS_TOPIC[f]); return [...t].sort(); }
function qFor(k) {
  const n = dnum(k), topics = coupleTopics(), pick = list => list[((n * 37) % list.length + list.length) % list.length][0];
  if (topics.length && n % 3 !== 2) { const pref = QB.filter(q => topics.includes(q[1])); if (pref.length) return pick(pref); }
  return pick(QB);
}

// ===== premium =====
const isPremium = () => !!S.couple && (S.couple.premium === true || (S.couple.premium_until && Date.parse(S.couple.premium_until) > Date.now()));
const PREMIUM_FEATURES = [['games', 'משחקים זוגיים', 'זה או זה, מי מכיר את מי, ואתגר שבועי'], ['together', 'תכנון דייטים והפתעות', 'מתכננים, מאשרים, מקבלים תזכורת, ומפתיעים'], ['cam', 'ספר זיכרונות', 'עם תמונות, 6 עיצובים, PDF להדפסה וספר בכריכה'], ['notes', 'כל ההיסטוריה', 'כל השאלות והזיכרונות שלכם, מההתחלה']];
const lockCard = (title, sub) => `<button class="card lock" data-act="tab" data-t="premium"><span class="gi">💎</span><span class="mt"><b>${title}</b><span class="sub">${sub}</span></span><span class="chev">‹</span></button>`;
// ===== the app =====
const greet = () => { const h = new Date().getHours(); return h < 5 ? 'לילה טוב' : h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : h < 21 ? 'ערב טוב' : 'לילה טוב'; };
const daysTogether = () => S.couple?.start_date ? dnum(today()) - dnum(S.couple.start_date) : null;
const LINES = ['דברים קטנים, כל יום, עושים את ההבדל.', 'מילה טובה לוקחת שנייה ונשארת כל היום.', 'לא צריך יום מיוחד כדי להגיד תודה.', 'להקשיב זה גם סוג של חיבוק.', 'ביחד זה לא רק כשנפגשים.', 'מה שנאמר בנחת, נשמע טוב יותר.', 'שאלה אחת ביום מקרבת יותר משנדמה.'];
function welcomeView() {
  const me = S.members[S.me]?.name || '', d = daysTogether(), u = unseen(), hug = openHug();
  const A = of('answer'), myA = A.find(a => a.day === today() && a.by === S.me);
  return `<div class="onb welcome"><div class="pop" style="color:var(--acc)">${logo(110)}</div>
<h1>${greet()}, ${esc(me)}</h1>${d != null ? `<span class="wpill">יום ${d.toLocaleString('he-IL')} ביחד</span>` : ''}
<div class="card wcard">${hug ? `<b class="whot">${esc(pName())} ${P('צריך', 'צריכה')} חיבוק</b>` : u ? `<b class="whot">מחכה לך ${u === 1 ? 'פתק חדש' : u + ' פתקים חדשים'} מ${esc(pName())}</b>` : ''}
<span class="sub">השאלה של היום${myA ? ' · ענית' : ''}</span><p>${esc(qText(today()))}</p></div>
<p class="wline">"${LINES[dnum(today()) % LINES.length]}"</p>
<button class="wide wgo" data-act="welcome">בואו נתחיל ‹</button></div>`;
}

function pushState() {
  if (S.push === 'native') return { txt: 'יגיעו בעדכון הבא של האפליקציה', native: true };
  if (S.push === 'on') return { on: true, txt: 'פועלות' };
  if (isIOS && !standalone && !DEMO) return { txt: 'צריך להוסיף למסך הבית', ios: true };
  if (S.push === 'unsupported') return { txt: 'לא נתמך בדפדפן הזה' };
  if (S.push === 'denied') return { txt: 'חסומות בהגדרות הטלפון' };
  return { txt: 'כבויות', can: true };
}
function pushCard() {
  const p = pushState(); if (p.on || p.native || ls.get('rak-push-hide')) return '';
  if (p.ios) return `<div class="guide"><b>כדי לקבל התראות באייפון</b><ul><li>בספארי לוחצים על כפתור השיתוף.</li><li>בוחרים "הוספה למסך הבית".</li><li>פותחים מהאייקון החדש ומפעילים התראות.</li></ul></div>`;
  if (!p.can) return '';
  return `<div class="card row" style="flex-wrap:nowrap;gap:12px"><span class="fi">${ico('bell')}</span><div style="flex:1"><b>להפעיל התראות?</b><div class="sub">כדי לדעת מיד כשמגיע פתק או חיבוק</div></div><button data-act="push">הפעלה</button></div>`;
}
function unseen() { return of('note').filter(n => n.by !== S.me && !n.seen).length; }
function navHTML() {
  const u = unseen(), h = !!openHug(), gt = games().filter(myTurn).length;
  const cur = S.tab === 'q' ? 'home' : S.tab === 'talk' || S.tab === 'profile' || S.tab === 'premium' ? 'me' : S.tab;
  return TABS.map(([k, l]) => { const b = k === 'notes' && u ? u : k === 'home' && h ? '!' : k === 'games' && gt ? gt : ''; return `<button data-act="tab" data-t="${k}" aria-current="${cur === k}">${ico(k, 24)}${l}${b ? `<span class="dot">${b}</span>` : ''}</button>`; }).join('');
}
const V = {};
// ===== mood: two lanterns on a string of lights =====
const MOODS = [['happy', 'שמחה', '☀️', '#f6c453'], ['love', 'אהבה', '💗', '#f2789f'], ['calm', 'רוגע', '🌿', '#7cc9a6'], ['excited', 'התרגשות', '✨', '#ffa94d'], ['tired', 'עייפות', '😴', '#a3abdc'], ['stress', 'לחץ', '🌪️', '#ff7a59'], ['sad', 'עצב', '🌧️', '#6f93e0'], ['miss', 'געגוע', '🌙', '#c2a3e6']];
const LOWMOOD = ['sad', 'stress', 'tired', 'miss'];
const moodOf = id => of('mood').find(x => x.by === id);
const moodInfo = k => MOODS.find(m => m[0] === k);
const ago = t => { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? 'עכשיו' : m < 60 ? `לפני ${m} דקות` : m < 120 ? 'לפני שעה' : m < 1440 ? `לפני ${Math.round(m / 60)} שעות` : m < 2880 ? 'אתמול' : `לפני ${Math.round(m / 1440)} ימים`; };
function lantern(id, i) {
  const md = moodOf(id), info = md && moodInfo(md.m), c = info ? info[3] : '#59608f', on = !!info && Date.now() - md.at < 2 * 864e5;
  return `<div class="lan ${on ? 'on' : 'off'} l${i}" style="--lc:${c}"><svg viewBox="0 0 80 170" aria-hidden="true"><line x1="40" y1="0" x2="40" y2="${i ? 62 : 38}" stroke="#8d93c9" stroke-width="2"/><g transform="translate(0 ${i ? 24 : 0})">
<circle cx="40" cy="46" r="7" fill="none" stroke="#8d93c9" stroke-width="3"/><path d="M22 60h36l8 12H14z" fill="#4b5191"/><rect x="18" y="72" width="44" height="62" rx="5" fill="${on ? c : '#3a3f72'}"/>
<path d="M30 74v58M40 74v58M50 74v58" stroke="#4b5191" stroke-width="4"/><rect x="16" y="132" width="48" height="9" rx="3" fill="#4b5191"/>${on ? `<circle cx="40" cy="103" r="9" fill="#fff" opacity=".85"/>` : ''}</g></svg></div>`;
}
function moodCard() {
  const pt = pid(), ppl = [S.me, pt].filter(Boolean), low = pt && moodOf(pt) && LOWMOOD.includes(moodOf(pt).m) && Date.now() - moodOf(pt).at < 864e5;
  return `<div class="card moodc"><div class="row" style="justify-content:space-between"><h3 style="margin:0;color:#f1eefc">מצב רוח</h3><span class="mhint">${pt ? '' : 'יופיע גם אצל בן או בת הזוג'}</span></div>
<svg class="lights" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true"><path d="M4 6 Q150 30 296 6" fill="none" stroke="#8d93c9" stroke-width="1.5"/>${[30, 90, 150, 210, 270].map(xx => `<circle cx="${xx}" cy="${6 + 24 * (1 - Math.pow((xx - 150) / 146, 2)) * .82}" r="5" fill="#ffd36b"/>`).join('')}</svg>
<div class="lans">${ppl.map((id, i) => { const md = moodOf(id), info = md && moodInfo(md.m); return `<div class="lcol">${lantern(id, i)}<b>${esc(id === S.me ? realName(S.me) : nameOf(id))}</b><span class="ml" style="color:${info ? info[3] : '#8d93c9'}">${info ? info[2] + ' ' + info[1] : 'עוד לא עודכן'}</span>${md ? `<span class="mt2">${ago(md.at)}</span>` : ''}</div>`; }).join('')}</div>
${low ? `<button class="wide mhug" data-act="moodhug">🤗 לשלוח ל${esc(pName())} חיבוק</button>` : ''}
<button class="wide mbtn" data-act="moodsheet">עדכון מצב הרוח שלי</button>
<div class="mnow"><b>מה קורה עכשיו?</b>${ppl.map(id => { const md = moodOf(id); return `<div class="mrow2"><span>${esc(id === S.me ? 'אני' : nameOf(id))}:</span> ${md?.text ? esc(md.text) : '<span class="mt2">אין עדכון</span>'}</div>`; }).join('')}</div></div>`;
}
function moodSheet() {
  if (S.sheet !== 'mood') return '';
  const cur = S.moodPick || moodOf(S.me)?.m;
  return `<div class="sheetbg" data-act="closesheet"></div><div class="sheet" role="dialog" aria-label="מצב רוח"><i class="grab"></i><b style="font-size:20px">איך ${M('אתה מרגיש', 'את מרגישה')} עכשיו?</b>
<div class="moods">${MOODS.map(([k, l, e, c]) => `<button class="moodb" data-act="moodpick" data-k="${k}" aria-pressed="${cur === k}" style="--mc:${c}"><span>${e}</span>${l}</button>`).join('')}</div>
<label for="moodtxt">מה קורה עכשיו? <span class="sub">(לא חובה)</span></label><input id="moodtxt" maxlength="80" placeholder="במשמרת עד 10, מתגעגע…">
<button class="wide" data-act="moodsave" ${cur ? '' : 'disabled'}>לעדכן</button></div>`;
}
V.home = () => {
  const start = S.couple.start_date, days = start ? dnum(today()) - dnum(start) : null;
  const hug = openHug();
  const last = of('note').find(n => n.by !== S.me);
  const up = of('event').map(e => ({ ...e, k: nextOcc(e) })).filter(e => e.k >= 0).sort((a, b) => a.k - b.k)[0];
  const tk = today(), A = of('answer'), myA = A.find(a => a.day === tk && a.by === S.me), herA = A.find(a => a.day === tk && a.by !== S.me);
  const me = S.members[S.me]?.name || '', u = unseen(), gt = games().filter(myTurn).length;
  return `<header class="hhead">${avatar(S.me, me, 'sm')}<div class="hh"><span class="sub">${greet()}${days != null ? ' · יום ' + days.toLocaleString('he-IL') : ''}</span><b>${esc(me)}</b></div>
<div class="pills"><button class="hp ${u ? 'on' : ''}" data-act="tab" data-t="notes" aria-label="פתקים חדשים">${ico('notes', 20)}<b>${u}</b></button><button class="hp ${gt ? 'on' : ''}" data-act="tab" data-t="games" aria-label="משחקים שמחכים לך">${ico('games', 20)}<b>${gt}</b></button></div></header>
<section class="hero">${days != null ? heart(days.toLocaleString('he-IL'), days === 1 ? 'יום ביחד' : 'ימים ביחד') : heart('♥', 'הוסיפו תאריך ב"אני"')}</section>
${moodCard()}
${(o => o ? (y => `<button class="card otd" data-act="otd">${(o.photos || [])[0] ? `<div class="ph">${phImg(o.photos[0])}</div>` : '<span class="gi">📖</span>'}<span class="mt"><b>היום ${y === 1 ? 'לפני שנה' : `לפני ${y} שנים`}</b><span class="sub">${esc((o.text || '').slice(0, 80))}</span></span><span class="chev">‹</span></button>`)(+today().slice(0, 4) - +o.date.slice(0, 4)) : '')(onThisDay())}
${!pid() ? (() => { const msg = encodeURIComponent('פתחתי לנו מקום ב"רק שלנו" ❤️\nנכנסים, נרשמים, ומכניסים את הקוד: ' + S.couple.code); return `<div class="card" style="border-color:var(--sun);display:grid;gap:10px"><b>עוד לא התחברתם</b><span class="sub">שלחו לבן/בת הזוג את הקוד <b dir="ltr" style="color:var(--acc)">${esc(S.couple.code)}</b>. ברגע שיצטרפו, הכול יתחבר לבד.</span><a class="wide wa" style="min-height:46px;font-size:16px" href="https://wa.me/?text=${msg}" target="_blank" rel="noopener">שליחה בוואטסאפ</a></div>`; })() : ''}
${hug ? `<div class="alert"><h3>${esc(nameOf(hug.by))} ${G(hug.by, 'צריך', 'צריכה')} חיבוק</h3>${hug.text ? `<div>${esc(hug.text)}</div>` : ''}<div class="sub" style="color:#fff">${fmtT(hug.at)}</div><button data-act="hugback" data-id="${esc(hug.id)}">${M('שולח', 'שולחת')} חיבוק בחזרה</button></div>` : ''}
${pushCard()}
${last ? `<button class="plain" data-act="tab" data-t="notes"><div class="sub" style="margin-bottom:6px">הפתק האחרון מ${esc(nameOf(last.by))}${unseen() ? ' · חדש' : ''}</div><div class="note clamp">${esc(last.text)}<div class="meta"><span>${fmtT(last.at)}</span></div></div></button>` : ''}
<button class="card qcard" data-act="tab" data-t="q"><div class="row" style="justify-content:space-between"><b>השאלה של היום</b>${myA ? (herA ? '<span class="pill hot">שניכם עניתם</span>' : '<span class="pill">ענית</span>') : '<span class="pill hot">מחכה לך</span>'}</div><p>${esc(qText(tk))}</p></button>
<div class="card"><form data-form="hug"><h3>קשה לי היום</h3><input id="hugtxt" maxlength="200" placeholder="משפט קצר (לא חובה)"><button>שליחת "${M('צריך', 'צריכה')} חיבוק" ל${esc(pName())}</button></form></div>
${upcomingPlans()[0] ? (p => `<button class="card plan" data-act="openplan" data-id="${esc(p.id)}"><span class="pdate"><b>${+p.date.split('-')[2]}</b>${new Date(p.date + 'T12:00:00').toLocaleDateString('he-IL', { month: 'short' })}</span><span class="pinfo"><span class="sub">הדייט הבא</span><b>${planTitle(p)}</b><span class="sub">${whenTxt(planDays(p))}${p.time ? ' · ' + p.time : ''}</span></span><span class="chev">‹</span></button>`)(upcomingPlans()[0]) : ''}
${up ? `<button class="card ev" data-act="tab" data-t="together"><div><span class="sub">הדבר הבא</span><div>${esc(up.title)}</div></div><b>${up.k === 0 ? 'היום!' : up.k === 1 ? 'מחר' : 'עוד ' + up.k + ' ימים'}</b></button>` : ''}`;
};
V.notes = () => { const N = of('note'); return `<h2>פתקים</h2><div class="card"><form data-form="note"><label for="notetxt">פתק ל${esc(pName())}</label><textarea id="notetxt" maxlength="1000" placeholder="משהו ש${M('אתה אוהב', 'את אוהבת')}, תודה קטנה, סתם בוקר טוב…" required></textarea><button>להדביק פתק</button></form></div>
<div class="list">${N.length ? N.map(n => `<div class="note ${n.by === S.me ? 'mine' : ''}">${esc(n.text)}<div class="meta"><span>${n.by === S.me ? 'ממני' : 'מ' + esc(nameOf(n.by))} · ${fmtT(n.at)}${n.by === S.me && n.seen ? ' · נקרא' : ''}</span><span class="row" style="gap:6px"><button class="mini bkm ${n.book ? 'on' : ''}" data-act="bookmark" data-id="${esc(n.id)}" aria-pressed="${!!n.book}" aria-label="${n.book ? 'להוציא מהספר' : 'להכניס לספר'}">📖${n.book ? ' בספר' : ''}</button>${n.by === S.me ? delBtn(n.id) : ''}</span></div></div>`).join('') : '<p class="sub center">עוד אין פתקים. תהיו הראשונים.</p>'}</div>`; };
// ===== date planning =====
const BUDGET = ['חינם', 'עד 150 ₪', '150–300 ₪', '300 ₪ ומעלה'];
const plans = () => of('plan').filter(p => p.status !== 'cancelled');
const planDays = p => dnum(p.date) - dnum(today());
const planPast = p => { const d = planDays(p); if (d < 0) return true; if (d > 0) return false; if (!p.time) return false; const [h, m] = p.time.split(':').map(Number), n = new Date(); return n.getHours() * 60 + n.getMinutes() > h * 60 + m + 120; };
const upcomingPlans = () => plans().filter(p => p.status !== 'done' && !planPast(p)).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
// a surprise hides the details from whoever isn't planning it
const hidden = p => p.surprise && p.planner && p.planner !== 'both' && p.planner !== S.me && p.status !== 'done' && !planPast(p);
const plannerTxt = p => p.planner === 'both' || !p.planner ? 'מתכננים ביחד' : p.planner === S.me ? M('אני מתכנן', 'אני מתכננת') : esc(nameOf(p.planner)) + ' ' + G(p.planner, 'מתכנן', 'מתכננת');
const whenTxt = d => d === 0 ? 'היום' : d === 1 ? 'מחר' : d === 2 ? 'מחרתיים' : 'בעוד ' + d + ' ימים';
const dayName = k => new Date(k + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long' });
function planTitle(p) { return hidden(p) ? 'הפתעה מ' + esc(nameOf(p.planner)) + ' 🎁' : esc(p.title || 'דייט'); }
function planCard(p) {
  const d = planDays(p), [y, m, dd] = p.date.split('-'), conf = Object.keys(p.confirmed || {});
  const other = S.me === p.by ? pid() : p.by, waiting = !conf.includes(S.me) && p.by !== S.me;
  return `<button class="card plan" data-act="openplan" data-id="${esc(p.id)}"><span class="pdate"><b>${+dd}</b>${new Date(p.date + 'T12:00:00').toLocaleDateString('he-IL', { month: 'short' })}</span>
<span class="pinfo"><b>${planTitle(p)}</b><span class="sub">${dayName(p.date)}${p.time ? ' · ' + p.time : ''}${!hidden(p) && p.place ? ' · ' + esc(p.place) : ''}</span>
<span class="row" style="gap:6px;margin-top:4px">${p.status === 'done' ? '<span class="pill">היה</span>' : `<span class="pill ${d <= 1 ? 'hot' : ''}">${whenTxt(d)}</span>`}${waiting ? `<span class="pill hot">${M('מחכה לאישור שלך', 'מחכה לאישור שלך')}</span>` : conf.length || p.by !== S.me ? '' : `<span class="pill">מחכה ל${esc(pName())}</span>`}${conf.length && !waiting ? '<span class="pill">שניכם בפנים ❤️</span>' : ''}</span></span><span class="chev">‹</span></button>`;
}
function planList() {
  const up = upcomingPlans(), past = plans().filter(p => p.status === 'done' || planPast(p)).sort((a, b) => b.date.localeCompare(a.date));
  const needReview = past.filter(p => !(p.review || {})[S.me] && planDays(p) >= -7);
  return `<div class="row" style="justify-content:space-between"><h3>הדייטים הבאים</h3><button class="linkbtn" data-act="newplan">+ לתכנן דייט</button></div>
${up.length ? `<div class="list">${up.map(planCard).join('')}</div>` : `<div class="card center"><p class="sub" style="margin:0 0 10px">אין דייט מתוכנן. אולי הגיע הזמן?</p><button data-act="newplan">לתכנן דייט</button></div>`}
${needReview.length ? `<div class="list">${needReview.map(p => `<button class="card review" data-act="openplan" data-id="${esc(p.id)}"><b>איך היה ${planTitle(p).replace('הפתעה מ', 'ההפתעה של ')}?</b><span class="sub">${M('ספר', 'ספרי')} במשפט, וזה יישמר בזיכרונות</span></button>`).join('')}</div>` : ''}
${past.length ? `<details id="d-pastplans"><summary>דייטים שהיו (${past.length})</summary><div class="list" style="margin-top:8px">${past.map(planCard).join('')}</div></details>` : ''}`;
}
function planEditor() {
  const e = S.planEdit, p = e.id ? of('plan').find(x => x.id === e.id) || {} : { title: e.title || '', planner: 'both', budget: 1 };
  const f = S.pf || (S.pf = { planner: p.planner || 'both', budget: p.budget ?? 1, surprise: !!p.surprise });
  const chip = (act, v, label, on) => `<button type="button" class="chip" data-act="${act}" data-v="${v}" aria-pressed="${on}">${label}</button>`;
  return `<button class="back" data-act="closeplan">› חזרה</button><h2>${e.id ? 'עריכת דייט' : 'מתכננים דייט'}</h2>
<form data-form="plan" class="card">
<label for="pltitle">מה עושים?</label><input id="pltitle" maxlength="80" required value="${esc(p.title || '')}" placeholder="פיקניק בשקיעה, ערב סרט, מסעדה חדשה…">
<div class="row" style="flex-wrap:nowrap"><div style="flex:1"><label for="pldate">מתי?</label><input id="pldate" type="date" required min="${today()}" value="${esc(p.date || '')}"></div><div style="flex:1"><label for="pltime">שעה</label><input id="pltime" type="time" value="${esc(p.time || '')}"></div></div>
<label for="plplace">איפה? (לא חובה)</label><input id="plplace" maxlength="80" value="${esc(p.place || '')}" placeholder="שם המקום או הכתובת">
<label>תקציב</label><p class="hint" style="margin-top:-6px">בערך, לשניכם ביחד</p><div class="chips">${BUDGET.map((b, i) => chip('pfbudget', i, b, f.budget === i)).join('')}</div>
<label>מי מתכנן?</label><div class="chips">${chip('pfplanner', 'both', 'ביחד', f.planner === 'both')}${chip('pfplanner', S.me, M('אני', 'אני'), f.planner === S.me)}${pid() ? chip('pfplanner', pid(), esc(pName()), f.planner === pid()) : ''}</div>
${f.planner === S.me ? `<div class="mrow" style="padding:8px 0;min-height:0"><span class="mt"><b>זו הפתעה 🎁</b><span class="sub">${esc(pName())} ${P('יראה', 'תראה')} רק את התאריך והשעה</span></span><button type="button" class="switch" role="switch" aria-checked="${f.surprise}" aria-label="הפתעה" data-act="pfsurprise"><i></i></button></div>
${f.surprise ? `<label for="plwear">רמז: מה ללבוש או להביא? (לא חובה)</label><input id="plwear" maxlength="100" value="${esc(p.wear || '')}" placeholder="נעליים נוחות, משהו חגיגי…">` : ''}` : ''}
<div class="onbbtns" style="margin-top:8px"><button class="wide">${e.id ? 'שמירה' : 'לקבוע ❤️'}</button><button type="button" class="wide ghost" data-act="closeplan">ביטול</button></div></form>`;
}
function planDetail() {
  const p = of('plan').find(x => x.id === S.planView); if (!p) { S.planView = null; return planList(); }
  const hide = hidden(p), conf = p.confirmed || {}, iConf = conf[S.me] || p.by === S.me, d = planDays(p), past = p.status === 'done' || planPast(p);
  const canEdit = p.by === S.me || (!hide && p.planner === 'both'), list = p.checklist || [], rv = p.review || {};
  const rows = [['together', 'מתי', `${dayName(p.date)}, ${heD(p.date)}${p.time ? ' · ' + p.time : ''}`]];
  if (!hide) { if (p.place) rows.push(['link', 'איפה', esc(p.place)]); rows.push(['jar', 'תקציב', BUDGET[p.budget ?? 1]]); }
  rows.push(['me', 'מי מתכנן', plannerTxt(p)]);
  const stars = uid => '★'.repeat(rv[uid]?.stars || 0) + '☆'.repeat(5 - (rv[uid]?.stars || 0));
  return `<button class="back" data-act="closeplan">› כל הדייטים</button>
<div class="card phead"><span class="pill ${!past && d <= 1 ? 'hot' : ''}">${past ? 'היה' : whenTxt(d)}</span><h2>${planTitle(p)}</h2>${p.surprise && !hide ? `<span class="sub">🎁 הפתעה: ${esc(pName())} ${P('רואה', 'רואה')} רק את התאריך והשעה</span>` : ''}</div>
${hide ? `<div class="alert"><b>${esc(nameOf(p.planner))} ${G(p.planner, 'מתכנן', 'מתכננת')} לך הפתעה</b><div>כל מה ש${M('אתה צריך', 'את צריכה')} לדעת: להיות ${M('פנוי', 'פנויה')} ${dayName(p.date)}${p.time ? ' ב-' + p.time : ''}.</div>${p.wear ? `<div><b>רמז:</b> ${esc(p.wear)}</div>` : ''}</div>` : ''}
<div class="card group">${rows.map(([i, t, v]) => `<div class="mrow"><span class="fi">${ico(i, 20)}</span><span class="mt"><span class="sub">${t}</span><b>${v}</b></span></div>`).join('')}</div>
${!past && !iConf ? `<button class="wide" data-act="confirmplan" data-id="${esc(p.id)}">אני ${M('בפנים', 'בפנים')} ❤️</button>` : ''}
${!past && iConf && Object.keys(conf).length ? '<p class="center sub" style="margin:0">שניכם בפנים ❤️</p>' : !past && p.by === S.me ? `<p class="center sub" style="margin:0">מחכים ש${esc(pName())} ${P('יאשר', 'תאשר')}</p>` : ''}
${!hide ? `<div class="card"><b>מה צריך להכין</b><div class="list" style="margin:10px 0">${list.length ? list.map((c, i) => `<label class="check"><input type="checkbox" data-act="tick" data-id="${esc(p.id)}" data-i="${i}" ${c.done ? 'checked' : ''}> <span style="${c.done ? 'text-decoration:line-through;color:var(--mut)' : ''}">${esc(c.t)}</span></label>`).join('') : '<p class="hint">למשל: להזמין מקום, לקנות פרחים, לבדוק תחזית.</p>'}</div>
<form data-form="addcheck" data-id="${esc(p.id)}" class="row" style="flex-wrap:nowrap"><input id="chk-${esc(p.id)}" maxlength="60" placeholder="להוסיף משימה" required><button style="min-height:48px">הוספה</button></form></div>` : ''}
${past ? `<div class="card"><b>איך היה?</b>${rv[S.me] ? `<p style="margin:6px 0 0"><span class="stars">${stars(S.me)}</span> ${esc(rv[S.me].text || '')}</p>` : `<form data-form="review" data-id="${esc(p.id)}"><div class="chips" role="radiogroup" aria-label="דירוג">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="chip star" data-act="pstar" data-v="${n}" aria-pressed="${(S.pstar || 0) >= n}">★</button>`).join('')}</div><input id="rv-${esc(p.id)}" maxlength="200" placeholder="משפט אחד על הדייט"><button>${M('שמור', 'שמרי')} בזיכרונות</button></form>`}
${pid() && rv[pid()] ? `<p style="margin:10px 0 0"><span class="sub">${esc(pName())}:</span> <span class="stars">${stars(pid())}</span> ${esc(rv[pid()].text || '')}</p>` : ''}
<button class="ghost wide" style="margin-top:12px" data-act="plan2mem" data-id="${esc(p.id)}">📖 להוסיף לספר עם תמונות</button></div>` : ''}
${canEdit && !past ? `<div class="row"><button class="ghost" data-act="editplan" data-id="${esc(p.id)}" style="flex:1">עריכה</button>${S.arm === 'plan' + p.id ? `<button data-act="cancelplan" data-id="${esc(p.id)}" style="flex:1;background:var(--warn);color:#fff">לבטל את הדייט</button>` : `<button class="ghost" data-act="arm" data-id="plan${esc(p.id)}" style="flex:1">ביטול הדייט</button>`}</div>` : ''}
${!past && !hide ? `<button class="mini" style="justify-self:center" data-act="markdone" data-id="${esc(p.id)}">כבר היה</button>` : ''}`;
}

// ===== games =====
const TOT = [['ים', 'בריכה'], ['קפה', 'תה'], ['בוקר', 'לילה'], ['סרט בבית', 'לצאת'], ['פיצה', 'סושי'], ['חורף', 'קיץ'], ['כלב', 'חתול'], ['הרים', 'ים'], ['מתוק', 'מלוח'], ['ספר', 'סדרה'], ['לתכנן', 'לזרום'], ['הודעה', 'שיחה'], ['טיול בארץ', 'טיסה לחו"ל'], ['ארוחת בוקר', 'ארוחת ערב'], ['ערב שקט', 'מסיבה'], ['שוקולד', 'גלידה'], ['קמפינג', 'מלון'], ['להשכים', 'לישון עד מאוחר'], ['מוזיקה שקטה', 'מוזיקה קצבית'], ['לבשל', 'להזמין'], ['פיקניק', 'מסעדה'], ['אופניים', 'הליכה'], ['זריחה', 'שקיעה'], ['עיר', 'טבע'], ['הפתעה', 'לדעת מראש'], ['משחק קופסה', 'משחק מחשב'], ['חיבוק', 'נשיקה'], ['צחוק', 'שיחה עמוקה'], ['פופקורן', 'במבה'], ['קולנוע', 'הופעה']];
// p: which preposition the question uses about the person (על / ל / את / של)
const GQ = [
  ['המאכל האהוב', 'al', ['פיצה', 'סושי', 'המבורגר', 'פסטה']], ['החופשה שהכי מתאימה', 'le', ['ים ושמש', 'הרים ושלג', 'עיר גדולה', 'טבע ושקט']],
  ['הדבר שהכי מרגיע', 'et', ['מוזיקה', 'מקלחת ארוכה', 'לישון', 'לדבר עם מישהו']], ['הדרך הכי טובה לפנק', 'et', ['אוכל טעים', 'מכתב', 'מתנה קטנה', 'זמן ביחד']],
  ['סוג הסרטים האהוב', 'al', ['קומדיה', 'אקשן', 'רומנטי', 'אימה']], ['הבוקר המושלם', 'shel', ['לישון עד מאוחר', 'קפה ושקט', 'ספורט', 'ארוחת בוקר גדולה']],
  ['מה הכי מעצבן', 'et', ['איחורים', 'בלגן', 'רעש', 'לחכות לתשובה']], ['שפת האהבה', 'shel', ['מילים טובות', 'מגע', 'זמן איכות', 'מתנות']],
  ['המשקה האהוב', 'al', ['קפה', 'תה', 'מיץ', 'שוקו']], ['העונה האהובה', 'al', ['חורף', 'אביב', 'קיץ', 'סתיו']],
  ['החיה שהכי מתאימה', 'le', ['כלב', 'חתול', 'דולפין', 'עצלן']], ['מה הכי חשוב בדייט', 'le', ['האוכל', 'המקום', 'השיחה', 'ההפתעה']],
  ['ערב הבילוי המושלם', 'shel', ['סדרה בבית', 'יציאה עם חברים', 'מסעדה', 'הופעה']], ['הקינוח האהוב', 'al', ['שוקולד', 'גלידה', 'עוגה', 'פירות']],
  ['מה הכי מפחיד', 'et', ['גבהים', 'חרקים', 'חושך', 'לדבר מול קהל']], ['המקום בבית שהכי אהוב', 'al', ['המיטה', 'הספה', 'המטבח', 'המרפסת']],
  ['הצבע האהוב', 'al', ['כחול', 'שחור', 'ירוק', 'אדום']], ['מה הכי משמח ביום רגיל', 'et', ['הודעה טובה', 'אוכל טעים', 'שינה טובה', 'צחוק עם חברים']]
];
const CHALLENGES = ['לכתוב אחד לשני 3 דברים שאתם אוהבים', 'לבשל ארוחה ביחד', 'ערב אחד בלי טלפונים', 'לצלם תמונה משותפת חדשה', 'הליכה של חצי שעה ביחד', 'פתק בוקר טוב 3 ימים ברצף', 'לנסות ביחד משהו שאף אחד מכם לא עשה', 'לספר זיכרון ילדות שהשני לא מכיר', 'להפתיע במשהו קטן שעולה פחות מ-20 ₪', 'פיקניק קטן, אפילו במרפסת', 'לכתוב ביחד 5 חלומות משותפים', 'ערב משחק קופסה', 'לבחור סרט שהשני אוהב', 'להגיד תודה על משהו קטן כל יום', 'ארוחת בוקר מפנקת', 'לרקוד ביחד לשיר אחד בסלון', 'לתכנן ביחד את הדייט הבא', 'לשלוח הודעה קולית מתוקה', 'לעשות ביחד משהו טוב בשביל מישהו אחר', 'לשמוע ביחד את השיר "שלכם"'];
const games = () => of('game');
const pick5 = n => { const a = [...Array(n).keys()]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, 5); };
const weekKey = (d = new Date()) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - day + 3); const y = t.getUTCFullYear(), w = 1 + Math.round((t - new Date(Date.UTC(y, 0, 4))) / 6048e5 - (new Date(Date.UTC(y, 0, 4)).getUTCDay() + 6) % 7 / 7); return y + '-W' + String(w).padStart(2, '0'); };
const weekChallenge = wk => CHALLENGES[(parseInt(wk.slice(0, 4)) * 53 + parseInt(wk.slice(6))) % CHALLENGES.length];
// how a guess question reads: about me ("עליך") or about the partner ("על עדי")
function gq(i, aboutId) {
  const [q, p] = GQ[i], self = aboutId === S.me, n = esc(nameOf(aboutId));
  const w = self ? { al: M('עליך', 'עלייך'), le: 'לך', et: 'אותך', shel: 'שלך' }[p] : { al: 'על ' + n, le: 'ל' + n, et: 'את ' + n, shel: 'של ' + n }[p];
  return q + ' ' + w + '?';
}
const totDone = g => Object.keys(g.picks || {}).length >= 2;
const totMatch = g => { const [a, b] = Object.values(g.picks || {}); return a && b ? a.filter((x, i) => x === b[i]).length : 0; };
const guessDone = g => Array.isArray(g.guesses);
const guessScore = g => guessDone(g) ? g.guesses.filter((x, i) => x === g.answers[i]).length : 0;
const myTurn = g => g.type === 'tot' ? !(g.picks || {})[S.me] : g.type === 'guess' ? g.by !== S.me && !guessDone(g) : false;
const challengeOf = wk => games().find(g => g.type === 'challenge' && g.week === wk);
function streak() {
  let n = 0, d = new Date(); const cur = challengeOf(weekKey(d));
  if (!(cur && Object.keys(cur.done || {}).length >= 2)) d = new Date(d - 7 * 864e5);
  for (;;) { const c = challengeOf(weekKey(d)); if (c && Object.keys(c.done || {}).length >= 2) { n++; d = new Date(d - 7 * 864e5); } else return n; }
}
function playView() {
  const pl = S.play, i = pl.answers.length;
  const head = `<button class="back" data-act="gameexit">› יציאה</button><div class="dots" style="justify-content:center">${[0, 1, 2, 3, 4].map(k => `<i class="${k <= i ? 'on' : ''}" style="width:${k === i ? 40 : 22}px"></i>`).join('')}</div>`;
  if (pl.type === 'tot') {
    const [a, b] = TOT[pl.qs[i]];
    return `${head}<h2 class="center">זה או זה?</h2><p class="sub center" style="margin:-8px 0 0">${i + 1} מתוך 5 · ${M('בחר', 'בחרי')} מה ${M('אתה', 'את')} יותר</p>
<div class="tot"><button class="totb" data-act="gpick" data-v="0">${esc(a)}</button><span class="or2">או</span><button class="totb" data-act="gpick" data-v="1">${esc(b)}</button></div>`;
  }
  const about = pl.mode === 'answer' ? S.me : pl.about, [, , opts] = GQ[pl.qs[i]];
  return `${head}<h2 class="center">${pl.mode === 'answer' ? 'קצת עליך' : 'כמה ' + M('אתה מכיר', 'את מכירה') + ' את ' + esc(nameOf(about)) + '?'}</h2><p class="sub center" style="margin:-8px 0 0">${i + 1} מתוך 5${pl.mode === 'answer' ? ' · ' + esc(pName()) + ' ' + P('ינחש', 'תנחש') + ' אחר כך' : ''}</p>
<div class="card center" style="font-size:20px;line-height:28px;font-weight:800">${gq(pl.qs[i], about)}</div>
<div class="opts">${opts.map((o, k) => `<button class="totb sm" data-act="gpick" data-v="${k}">${esc(o)}</button>`).join('')}</div>`;
}
function resultView(g) {
  const other = pid();
  if (g.type === 'tot') {
    const mine = (g.picks || {})[S.me] || [], his = (g.picks || {})[other] || [], done = totDone(g);
    return `<button class="back" data-act="gameclose">› כל המשחקים</button><div class="card center"><span class="sub">זה או זה</span><h1 style="font-size:44px;line-height:52px">${done ? totMatch(g) + '/5' : '⏳'}</h1><b>${done ? (totMatch(g) >= 4 ? 'אתם על אותו גל 💞' : totMatch(g) >= 2 ? 'קצת דומים, קצת שונים' : 'הפכים נמשכים 😄') : 'מחכים ש' + esc(pName()) + ' ' + P('יבחר', 'תבחר')}</b></div>
<div class="card group">${g.qs.map((q, i) => { const [a, b] = TOT[q], x = mine[i], y = his[i]; return `<div class="mrow" style="min-height:56px"><span class="mt"><b>${esc(a)} / ${esc(b)}</b><span class="sub">אני: ${x == null ? '–' : esc(TOT[q][x])}${done ? ' · ' + esc(pName()) + ': ' + esc(TOT[q][y]) : ''}</span></span>${done ? `<span class="mk ${x === y ? 'ok' : ''}">${x === y ? '✓' : '✗'}</span>` : ''}</div>`; }).join('')}</div>`;
  }
  const about = g.by, guesser = about === S.me ? other : S.me, done = guessDone(g), sc = guessScore(g);
  return `<button class="back" data-act="gameclose">› כל המשחקים</button><div class="card center"><span class="sub">מי מכיר את מי?</span><h1 style="font-size:44px;line-height:52px">${done ? sc + '/5' : '⏳'}</h1><b>${done ? (guesser === S.me ? (sc >= 4 ? M('אתה מכיר', 'את מכירה') + ' ממש טוב 🏆' : 'יש עוד מה ללמוד 😉') : esc(nameOf(guesser)) + ' ' + G(guesser, 'ניחש', 'ניחשה') + ' ' + sc + ' נכון') : 'מחכים ש' + esc(nameOf(guesser)) + ' ' + G(guesser, 'ינחש', 'תנחש')}</b></div>
<div class="card group">${g.qs.map((q, i) => { const o = GQ[q][2], ans = g.answers[i], gs = done ? g.guesses[i] : null; return `<div class="mrow" style="min-height:56px"><span class="mt"><b>${gq(q, about)}</b><span class="sub">${about === S.me || done ? 'התשובה: ' + esc(o[ans]) : 'התשובה מוסתרת'}${done ? ' · ניחוש: ' + esc(o[gs]) : ''}</span></span>${done ? `<span class="mk ${gs === ans ? 'ok' : ''}">${gs === ans ? '✓' : '✗'}</span>` : ''}</div>`; }).join('')}</div>`;
}
V.games = () => {
  if (!isPremium()) return `<h2>משחקים</h2><p class="sub" style="margin:-10px 0 0">קצר, כיפי, ביחד.</p>
${[['⚖️', 'זה או זה', '5 שאלות מהירות. בסוף רואים כמה אתם דומים.'], ['🧠', 'מי מכיר את מי?', 'אחד עונה על עצמו, והשני מנחש.'], ['🏅', 'האתגר של השבוע', 'אתגר זוגי קטן כל שבוע, ורצף שבועות.']].map(([e, t, d]) => `<div class="card game locked"><div class="gh"><span class="gi">${e}</span><div><b>${t}</b><span class="sub">${d}</span></div></div></div>`).join('')}
<button class="wide" data-act="tab" data-t="premium">💎 פותחים עם פרימיום</button>`;
  if (S.play) return playView();
  if (S.gview) { const g = games().find(x => x.id === S.gview); if (g) return resultView(g); S.gview = null; }
  const all = games().filter(g => g.type !== 'challenge'), turn = all.filter(myTurn), wk = weekKey(), ch = challengeOf(wk), done = (ch && ch.done) || {}, st = streak();
  const tots = all.filter(g => g.type === 'tot' && totDone(g)), avg = tots.length ? Math.round(tots.reduce((s, g) => s + totMatch(g), 0) / tots.length * 20) : null;
  const gs = all.filter(g => g.type === 'guess' && guessDone(g)), score = id => gs.filter(g => g.by !== id).reduce((s, g) => s + guessScore(g), 0);
  const waiting = all.filter(g => !myTurn(g) && !(g.type === 'tot' ? totDone(g) : guessDone(g)));
  const recent = all.filter(g => g.type === 'tot' ? totDone(g) : guessDone(g)).slice(0, 8);
  return `<h2>משחקים</h2><p class="sub" style="margin:-10px 0 0">קצר, כיפי, ביחד.</p>
${turn.map(g => `<button class="card turn" data-act="gameplay" data-id="${esc(g.id)}"><b>${esc(nameOf(g.by))} ${G(g.by, 'מחכה', 'מחכה')} לך 🎲</b><span class="sub">${g.type === 'tot' ? 'סבב "זה או זה" · תורך לבחור' : 'מי מכיר את מי? · ' + M('נחש', 'נחשי') + ' 5 דברים על ' + esc(nameOf(g.by))}</span></button>`).join('')}
<div class="card game"><div class="gh"><span class="gi">⚖️</span><div><b>זה או זה</b><span class="sub">5 שאלות מהירות. בסוף רואים כמה אתם דומים.</span></div></div>
${avg != null ? `<div class="gstat"><span>${tots.length} סבבים</span><span>${avg}% התאמה בממוצע</span></div>` : ''}<button data-act="gamenew" data-t="tot">סבב חדש</button></div>
<div class="card game"><div class="gh"><span class="gi">🧠</span><div><b>מי מכיר את מי?</b><span class="sub">${M('ענה', 'עני')} על 5 שאלות על עצמך, ו${esc(pName())} ${P('ינחש', 'תנחש')}.</span></div></div>
${gs.length ? `<div class="gstat"><span>ניחושים נכונים:</span><span>${M('אני', 'אני')} ${score(S.me)}</span><span>${esc(pName())} ${score(pid())}</span></div>` : ''}<button data-act="gamenew" data-t="guess">סבב חדש</button></div>
<div class="card game"><div class="gh"><span class="gi">🏅</span><div><b>האתגר של השבוע</b><span class="sub">${esc(weekChallenge(wk))}</span></div></div>
<div class="row" style="gap:6px"><span class="pill ${done[S.me] ? 'hot' : ''}">${done[S.me] ? '✓ ' : ''}${esc(S.members[S.me]?.name || 'אני')}</span><span class="pill ${pid() && done[pid()] ? 'hot' : ''}">${pid() && done[pid()] ? '✓ ' : ''}${esc(pName())}</span>${st ? `<span class="pill" style="background:var(--sun);color:#3a2800">🔥 ${st} ${st === 1 ? 'שבוע' : 'שבועות'} ברצף</span>` : ''}</div>
${done[S.me] ? `<p class="hint" style="margin:0">${Object.keys(done).length >= 2 ? 'השלמתם את האתגר השבוע 🎉' : 'סימנת. ' + esc(pName()) + ' ' + P('יקבל', 'תקבל') + ' תזכורת.'}</p>` : `<button data-act="chdone">עשינו את זה ✔</button>`}</div>
${waiting.length ? `<h3 class="sec">מחכים ל${esc(pName())}</h3><div class="list">${waiting.map(g => `<button class="card plain" style="padding:14px 16px" data-act="gameopen" data-id="${esc(g.id)}">${g.type === 'tot' ? 'זה או זה' : 'מי מכיר את מי?'} · ⏳</button>`).join('')}</div>` : ''}
${recent.length ? `<h3 class="sec">סבבים אחרונים</h3><div class="card group">${recent.map(g => `<button class="mrow" data-act="gameopen" data-id="${esc(g.id)}"><span class="mt"><b>${g.type === 'tot' ? 'זה או זה' : 'מי מכיר את מי? · ' + (g.by === S.me ? esc(pName()) + ' ' + P('ניחש', 'ניחשה') : M('ניחשתי', 'ניחשתי'))}</b><span class="sub">${fmt(g.at)}</span></span><b>${g.type === 'tot' ? totMatch(g) : guessScore(g)}/5</b><span class="chev">‹</span></button>`).join('')}</div>` : ''}`;
};

V.together = () => {
  const I = of('idea'), open = I.filter(i => !i.done), done = I.filter(i => i.done), dr = I.find(i => i.id === S.drawn && !i.done);
  const evs = of('event').map(e => ({ ...e, k: nextOcc(e) })).sort((a, b) => (a.k < 0) - (b.k < 0) || a.k - b.k);
  const MEMALL = of('memory').sort((a, b) => b.date.localeCompare(a.date)), MEM = isPremium() ? MEMALL : MEMALL.filter(m => dnum(today()) - dnum(m.date) <= 30), memHidden = MEMALL.length - MEM.length;
  const sub = S.sub || 'dates';
  const seg = `<div class="seg">${[['dates', 'דייטים'], ['events', 'תאריכים'], ['mem', 'זיכרונות']].map(([k, l]) => `<button data-act="sub" data-s="${k}" aria-selected="${sub === k}">${l}</button>`).join('')}</div>`;
  if (sub === 'events') return `<h2>ביחד</h2>${seg}<div class="card"><form data-form="event"><input id="evtitle" maxlength="80" placeholder="יום הולדת, דייט בשישי, יום נישואין…" required><div class="row"><input id="evdate" type="date" required style="flex:1 1 160px"><label class="check" style="margin:0"><input id="evyear" type="checkbox"> כל שנה</label></div><button>הוספה</button></form>
<div style="margin-top:10px">${evs.length ? evs.map(e => `<div class="ev"><div>${esc(e.title)}<div class="sub">${heD(e.date)}${e.yearly ? ' · כל שנה' : ''}</div></div><div class="row"><b>${e.k < 0 ? '<span class="sub">עבר</span>' : e.k === 0 ? 'היום!' : e.k + ' ימים'}</b>${e.by === S.me ? delBtn(e.id) : ''}</div></div>`).join('') : '<p class="sub">ימי הולדת, דייטים ותאריכים חשובים יופיעו כאן עם ספירה לאחור.</p>'}</div></div>`;
  if (sub === 'mem') {
    const ps = S.memPh || [];
    const memCard = m => `<div class="card mem"><time>${heD(m.date)}</time><div style="min-width:0">${(m.photos || []).length ? `<div class="mthumbs">${m.photos.map(r => `<div class="ph">${phImg(r)}</div>`).join('')}</div>` : ''}<div style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(m.text || '')}</div>
${Object.entries(m.adds || {}).filter(([u, t]) => t && u !== m.by).map(([u, t]) => `<p class="madd">"${esc(t)}" <span class="sub">· ${u === S.me ? 'אני' : esc(nameOf(u))}</span></p>`).join('')}
${m.by !== S.me && !(m.adds || {})[S.me] ? `<details id="d-ma-${esc(m.id)}"><summary class="sub">להוסיף משפט משלי לזיכרון</summary><form data-form="memadd" data-id="${esc(m.id)}" class="row" style="margin-top:6px"><input id="ma-${esc(m.id)}" maxlength="160" placeholder="איך אני ${M('זוכר', 'זוכרת')} את זה…" style="flex:1 1 160px"><button>הוספה</button></form></details>` : ''}
<div class="row sub" style="justify-content:space-between;margin-top:6px"><span>${m.by === S.me ? 'אני' : esc(nameOf(m.by))}${m.place ? ' · ' + esc(m.place) : ''}</span>${m.by === S.me ? delBtn(m.id) : ''}</div></div></div>`;
    return `<h2>ביחד</h2>${seg}<button class="card lock bookbtn" data-act="tab" data-t="book"><span class="gi">📖</span><span class="mt"><b>ספר הזיכרונות שלנו</b><span class="sub">${MEMALL.length} זיכרונות · ${isPremium() ? 'לדפדף, לעצב ולהדפיס' : 'פרימיום 💎'}</span></span><span class="chev">‹</span></button>
<div class="card"><form data-form="mem"><label for="memtxt">רגע שאני רוצה לשמור</label><textarea id="memtxt" maxlength="1000" placeholder="הפעם שנתקענו בגשם וצחקנו…">${esc(S.memDraft?.text || '')}</textarea>
<div class="memphs">${ps.map((p, i) => `<div class="mph"><img src="${esc(p.u)}" alt=""><button type="button" class="mphx" data-act="memphrm" data-i="${i}" aria-label="הסרת התמונה">✕</button></div>`).join('')}${ps.length < MAXPH() ? `<button type="button" class="mphadd" data-act="memphoto">📷<span>${ps.length ? 'עוד תמונה' : 'תמונה'}</span></button>` : ''}</div>
<div class="row"><input id="memdate" type="date" value="${esc(S.memDraft?.date || today())}" required style="flex:1 1 140px"><input id="memplace" maxlength="40" placeholder="איפה? (לא חובה)" value="${esc(S.memDraft?.place || '')}" style="flex:1 1 140px"></div><button ${S.memBusy ? 'disabled' : ''}>${S.memBusy ? 'שומר…' : 'לשמור'}</button></form></div>
${memHidden ? lockCard('עוד ' + memHidden + ' זיכרונות ישנים', 'כל ההיסטוריה פתוחה בפרימיום') : ''}<div class="list">${MEM.length ? MEM.map(memCard).join('') : '<p class="sub center">הזיכרון הראשון מחכה לכם.</p>'}</div>`;
  }
  if (S.planEdit) return planEditor();
  if (S.planView) return planDetail();
  const src = S.jarSrc || 'all', ours = new Set(I.map(i => i.text.trim()));
  const pool = () => [...(src !== 'bank' ? open : []), ...(src !== 'ours' ? BANK.filter(b => !ours.has(b.text) && !(S.bankSkip || []).includes(b.id)) : [])];
  const drB = !dr && S.drawn && BANK.find(b => b.id === S.drawn), d0 = dr || drB, cnt = pool().length;
  return `<h2>ביחד</h2>${seg}${planList()}<h3 style="margin-top:6px">צנצנת הרעיונות</h3><p class="hint" style="margin:-6px 0 8px">הצנצנת משותפת: מה ש${M('אתה מוסיף', 'את מוסיפה')} ${pid() ? esc(pName()) + ' ' + P('רואה', 'רואה') + ' מיד, ושניכם יכולים להגריל' : 'יופיע גם אצל בן או בת הזוג'}.</p>
<div class="card jar"><div class="seg sm" role="tablist" aria-label="מאיפה להגריל">${[['all', 'מהכל'], ['ours', 'רק שלנו'], ['bank', 'מוכנים']].map(([k, l]) => `<button data-act="jarsrc" data-v="${k}" aria-selected="${src === k}">${l}</button>`).join('')}</div>
${d0 ? `<span class="sub">${drB ? drB.cat + ' · מהרעיונות המוכנים' : (d0.by === S.me ? 'רעיון שלך' : 'רעיון של ' + esc(nameOf(d0.by)))}</span><div class="drawn">${esc(d0.text)}</div>
<div class="row" style="justify-content:center"><button data-act="planidea" data-id="${esc(d0.id)}">לתכנן את זה</button>${pid() ? `<button class="ghost" data-act="sendidea" data-id="${esc(d0.id)}">לשלוח ל${esc(pName())} 💌</button>` : ''}</div>
<div class="row" style="justify-content:center"><button class="ghost" data-act="draw">תגריל שוב</button>${drB ? `<button class="mini" data-act="bankadd" data-id="${esc(drB.id)}">לצנצנת שלנו</button><button class="mini" data-act="bankskip" data-id="${esc(drB.id)}">לא בשבילנו</button>` : `<button class="mini" data-act="ideadone" data-id="${esc(d0.id)}">כבר עשינו</button>`}</div>`
: `<span class="fi" style="width:56px;height:56px">${ico('jar', 30)}</span><p class="sub" style="margin:0">${src === 'ours' ? (open.length ? 'יש בצנצנת שלכם ' + open.length + ' רעיונות' : 'עוד אין רעיונות שלכם. תוסיפו למטה') : `${open.length} רעיונות שלכם + ${BANK.length} מוכנים`}</p><button data-act="draw" ${cnt ? '' : 'disabled'}>תגריל לנו דייט 🎲</button>`}</div>
<div class="card"><form data-form="idea"><label for="ideatxt">רעיון לדייט</label><div class="row"><input id="ideatxt" maxlength="200" placeholder="פיקניק בשקיעה, לבשל משהו חדש…" required style="flex:1 1 200px"><button>לצנצנת</button></div></form>
<div class="list" style="margin-top:14px">${open.map(i => `<div class="row" style="justify-content:space-between"><span>${esc(i.text)}${i.by !== S.me ? ` <span class="sub">· ${esc(nameOf(i.by))}</span>` : ''}</span>${i.by === S.me ? delBtn(i.id) : ''}</div>`).join('')}</div>
<details id="d-bank"><summary>רעיונות מוכנים להוספה (${BANK.length})</summary>${IDEAS.map(([c, l], ci) => `<b class="bankcat">${c}</b>${l.map((t, i) => ours.has(t) ? `<div class="row bankrow"><span class="sub">✓ ${esc(t)}</span></div>` : `<div class="row bankrow"><span>${esc(t)}</span><button class="mini" data-act="bankadd" data-id="b${ci}-${i}">+ לצנצנת</button></div>`).join('')}`).join('')}</details>
${done.length ? `<details id="d-done"><summary>דייטים שכבר עשינו (${done.length})</summary>${done.map(i => `<div class="row" style="justify-content:space-between;padding:4px 0"><s class="sub">${esc(i.text)}</s><button class="mini" data-act="ideaback" data-id="${esc(i.id)}">להחזיר</button></div>`).join('')}</details>` : ''}</div>`;
};
// ready-made date ideas, so the jar is never empty
const IDEAS = [
  ['🏠 בבית', ['ערב סרט עם שמיכה ופופקורן', 'לבשל ביחד מתכון שאף פעם לא ניסינו', 'ערב משחקי קופסה', 'פיקניק על הרצפה בסלון', 'לאפות עוגה ולקשט אותה ביחד', 'ערב ספא ביתי: מסכות, מוזיקה ונרות', 'להכין פיצה מאפס', 'ערב תמונות ישנות וסיפורים', 'לבנות מבצר כריות ולראות סדרה', 'ערב טעימות: 5 סוגי שוקולד או גבינות', 'לצייר אחד את השנייה, בלי לצחוק (אסור)', 'ערב קריוקי בסלון', 'לכתוב אחד לשני מכתב ולקרוא בקול', 'ארוחת בוקר במיטה בשבת', 'לבשל ארוחה ממדינה אחרת ולהתלבש בהתאם', 'פאזל של 1000 חלקים וכוס יין', 'ערב שאלות עמוקות, בלי טלפונים']],
  ['🌳 בחוץ', ['פיקניק בשקיעה', 'זריחה בים עם קפה בטרמוס', 'טיול לילי עם פנס', 'לראות כוכבים מחוץ לעיר', 'שביל אופניים ביחד', 'טיול קצר עם נחל או מעיין', 'שקיעה על גג עם משהו טעים', 'להכין רשימת השמעה ולנסוע בלי יעד', 'לקטוף פירות בקטיף עצמי', 'פיקניק בפארק עם משחק כדור', 'לטפס להר ולאכול למעלה', 'סיבוב בשוק בשישי בבוקר']],
  ['🍽️ לאכול בחוץ', ['מסעדה שאף אחד מאיתנו לא היה בה', 'סיבוב קינוחים: שלושה מקומות בערב אחד', 'ארוחת בוקר מושקעת בבית קפה', 'דוכן אוכל רחוב שכולם מדברים עליו', 'סדנת בישול זוגית', 'טעימות יין או בירה', 'גלידה בטיילת', 'חומוסייה שמומלצת מחוץ לעיר']],
  ['🎟️ חוויה', ['סרט בקולנוע עם כל הנשנושים', 'הופעה של זמר שאחד מאיתנו אוהב', 'חדר בריחה', 'באולינג או מיני גולף', 'סדנת קדרות או ציור', 'מוזיאון ואחר כך קפה לדבר עליו', 'סטנדאפ', 'קיאקים או סאפ', 'פארק חבלים', 'בריכה או ספא ליום אחד', 'משחק כדורגל או כדורסל ביציע', 'מסלול ג׳יפים או טרקטורונים']],
  ['💕 רומנטי', ['ארוחה לאור נרות שאחד מאיתנו מבשל בהפתעה', 'לשחזר את הדייט הראשון שלנו', 'לילה בצימר', 'לכתוב רשימה של 10 דברים שאני אוהב בך', 'ריקוד סלואו במטבח', 'מכתב לעצמנו בעוד שנה, ולפתוח אותו אז', 'צילומים זוגיים בשקיעה', 'חיפוש מטמון קטן עם רמזים']],
  ['🆓 בלי כסף', ['הליכה ארוכה בלי טלפונים', 'ספרייה או חנות ספרים: כל אחד בוחר ספר לשני', 'לבקר מקום מהילדות של אחד מאיתנו', 'להתנדב ביחד יום אחד', 'לתכנן את הטיול של החלומות שלנו', 'ערב בלי מסכים: רק אנחנו ומוזיקה', 'לנסות ביחד אימון חדש ביוטיוב']]
];
const BANK = IDEAS.flatMap(([c, l], ci) => l.map((t, i) => ({ id: 'b' + ci + '-' + i, text: t, cat: c, bank: true })));
const qBookBtn = d => { const on = of('answer').some(a => a.day === d && a.book); return `<button class="mini bkm ${on ? 'on' : ''}" data-act="bookq" data-d="${d}" aria-pressed="${on}">📖 ${on ? 'בספר' : 'להכניס לספר'}</button>`; };
V.q = () => {
  const A = of('answer'), tk = today(), mine = A.find(a => a.day === tk && a.by === S.me), his = A.find(a => a.day === tk && a.by !== S.me);
  const allDays = [...new Set(A.map(a => a.day))].filter(d => d !== tk).sort().reverse();
  const days = isPremium() ? allDays : allDays.filter(d => dnum(tk) - dnum(d) <= 30), hiddenDays = allDays.length - days.length;
  const ans = a => `<div class="note ${a.by === S.me ? 'mine' : ''}">${esc(a.text)}<div class="meta"><span>${a.by === S.me ? 'אני' : esc(nameOf(a.by))}</span></div></div>`;
  return `<button class="back" data-act="tab" data-t="home">חזרה לבית</button><h2>השאלה של היום</h2><div class="card"><p style="font:400 24px/1.3 'Secular One';margin:0 0 14px">${esc(qText(tk))}</p>
${mine ? `<div class="list">${ans(mine)}${his ? ans(his) + qBookBtn(tk) : `<p class="sub">${esc(pName())} עוד לא ${P('ענה', 'ענתה')}. התשובה תיחשף ${P('כשיענה', 'כשתענה')}.</p>`}</div>` : `<form data-form="answer"><textarea id="anstxt" maxlength="1000" placeholder="התשובה שלך…" required></textarea><button>לענות</button><p class="sub" style="margin:0">${his ? esc(pName()) + ' כבר ' + P('ענה', 'ענתה') + '. ' + M('תענה', 'תעני') + ' כדי לראות.' : 'התשובות נחשפות רק אחרי ששניכם עונים.'}</p></form>`}</div>
${days.length ? '<h3>ימים קודמים</h3>' : ''}${hiddenDays ? lockCard('עוד ' + hiddenDays + ' ימים קודמים', 'כל ההיסטוריה פתוחה בפרימיום') : ''}<div class="list">${days.slice(0, 30).map(d => { const a = A.filter(x => x.day === d), m = a.find(x => x.by === S.me), o = a.find(x => x.by !== S.me); return `<details class="card" id="d-q-${d}"><summary>${heD(d)} · ${esc(qText(d))}</summary><div class="list">${m && o ? ans(m) + ans(o) + qBookBtn(d) : m ? ans(m) + '<p class="sub">רק ' + M('אתה', 'את') + ' ענית.</p>' : '<p class="sub">לא ענית ביום הזה, אז התשובה נשארת מוסתרת.</p>'}</div></details>`; }).join('')}</div>`;
};
const ST = { new: ['חדש', 'hot'], heard: ['נשמע', ''], talked: ['דיברנו', ''], solved: ['נפתר', ''] };
V.talk = () => {
  const all = of('issue'), L = all.filter(i => S.issueF === 'open' ? i.status !== 'solved' : i.status === 'solved');
  return `<button class="back" data-act="tab" data-t="me">› חזרה</button><h2>לדבר בנחת</h2><p class="sub" style="margin:-10px 0 0">מקום שקט לדברים שפחות נעים להגיד בפנים.</p><details class="guide" id="d-guide"><summary><b>איך מעלים בלי לריב</b></summary><ul><li>מדברים על המצב, לא על האדם.</li><li>"הרגשתי…" במקום "${P('אתה', 'את')} תמיד…".</li><li>אומרים מה כן היה עוזר.</li><li>קוראים, לוחצים "שמעתי אותך", ומדברים כששניכם רגועים.</li></ul></details>
<details class="card" id="d-newissue" ${all.length ? '' : 'open'}><summary><b>להעלות נקודה חדשה</b></summary><form data-form="issue"><label for="iswhat">מה קרה?</label><textarea id="iswhat" maxlength="800" required placeholder="מה היה המצב, בלי האשמות"></textarea><label for="isfeel">מה הרגשתי</label><input id="isfeel" maxlength="200" placeholder="${M('נעלבתי, לא ראו אותי, הייתי לחוץ', 'נעלבתי, לא ראו אותי, הייתי לחוצה')}…"><label for="iswant">מה היה עוזר לי</label><input id="iswant" maxlength="300" placeholder="שנדבר על זה, ${P('שתשאל', 'שתשאלי')}, שנחליט יחד…"><button>להעלות לשיחה</button></form></details>
<div class="seg">${[['open', 'פתוחים (' + all.filter(i => i.status !== 'solved').length + ')'], ['solved', 'פתרנו (' + all.filter(i => i.status === 'solved').length + ')']].map(([k, l]) => `<button data-act="if" data-f="${k}" aria-selected="${S.issueF === k}">${l}</button>`).join('')}</div>
<div class="list">${L.length ? L.map(i => { const st = ST[i.status] || ST.new, mine = i.by === S.me, id = esc(i.id); return `<div class="card issue ${i.status === 'solved' ? 'solved' : ''}"><div class="row" style="justify-content:space-between"><span class="sub">${mine ? 'העליתי' : G(i.by, 'העלה ', 'העלתה ') + esc(nameOf(i.by))} · ${fmt(i.at)}</span><span class="pill ${st[1]}">${st[0]}</span></div><dl><dt>מה קרה</dt><dd>${esc(i.what)}</dd>${i.feel ? `<dt>מה הרגשתי</dt><dd>${esc(i.feel)}</dd>` : ''}${i.want ? `<dt>מה היה עוזר</dt><dd>${esc(i.want)}</dd>` : ''}${i.side ? `<dt>הצד של ${esc(nameOf(i.sideBy))}</dt><dd>${esc(i.side)}</dd>` : ''}${i.res ? `<dt>מה סיכמנו</dt><dd>${esc(i.res)}</dd>` : ''}</dl>
${i.status === 'new' && !mine ? `<button data-act="heard" data-id="${id}">שמעתי אותך</button>` : ''}
${i.status === 'new' && mine ? `<p class="sub">מחכה ש${esc(pName())} ${P('יקרא', 'תקרא')}.</p>` : ''}
${!mine && !i.side && i.status !== 'solved' ? `<form data-form="side" data-id="${id}"><label for="side-${id}">איך אני רואה את זה (לא חובה)</label><textarea id="side-${id}" maxlength="800"></textarea><button class="ghost">להוסיף את הצד שלי</button></form>` : ''}
${i.status === 'heard' ? `<button class="ghost" data-act="talked" data-id="${id}">דיברנו על זה</button>` : ''}
${i.status === 'talked' ? `<form data-form="solve" data-id="${id}"><label for="res-${id}">מה סיכמנו?</label><input id="res-${id}" maxlength="300" required><button>פתרנו</button></form>` : ''}
<div class="row" style="margin-top:8px">${i.status === 'solved' ? `<button class="mini" data-act="reopen" data-id="${id}">לפתוח שוב</button>` : ''}${mine ? delBtn(i.id) : ''}</div></div>`; }).join('') : `<p class="sub center">${S.issueF === 'open' ? 'אין כרגע נקודות פתוחות.' : 'עוד לא סגרתם נקודות.'}</p>`}</div>`;
};
const myPrefs = () => S.members[S.me]?.prefs || {};
const prefOn = k => k === 'remind' ? myPrefs().remind !== false : myPrefs()[k] === true;
const sw = (k, title, sub, icon) => `<div class="mrow"><span class="fi">${ico(icon, 20)}</span><span class="mt"><b>${title}</b><span class="sub">${sub.replace('מעדי', 'מ' + esc(pName()))}</span></span><button class="switch" role="switch" aria-checked="${prefOn(k)}" aria-label="${title}" data-act="toggle" data-k="${k}"><i></i></button></div>`;
const acctTools = () => `<div style="margin-top:14px;border-top:1px solid var(--line);padding-top:12px"><p class="sub" style="margin:0 0 8px">מחיקת החשבון מוחקת לצמיתות את החשבון שלך וכל מה שכתבת. מה ש${esc(pName())} ${P('כתב', 'כתבה')} נשאר ${P('אצלו', 'אצלה')}.</p>${S.arm === 'account' ? `<button data-act="delacct" style="background:#b3122f">כן, למחוק הכל לצמיתות</button> <button class="mini" data-act="arm" data-id="">ביטול</button>` : `<button class="mini" data-act="arm" data-id="account">מחיקת החשבון</button>`}</div>`;
V.me = () => {
  const me = S.members[S.me] || {}, start = S.couple.start_date, p = pushState();
  const row = (icon, title, val, act, extra = '') => `<button class="mrow" data-act="${act}" ${extra}><span class="fi">${ico(icon, 20)}</span><span class="mt"><b>${title}</b>${val ? `<span class="sub">${val}</span>` : ''}</span><span class="chev">‹</span></button>`;
  const d = daysTogether(), stats = [[d != null ? d.toLocaleString('he-IL') : '–', 'ימים ביחד', 'together'], [of('note').length, 'פתקים', 'notes'], [of('idea').filter(i => i.done).length, 'דייטים שעשינו', 'jar'], [of('issue').filter(i => i.status === 'solved').length, 'נקודות שפתרנו', 'talk']];
  return `<div class="card profile2"><div class="ptop"><div class="duo">${avatar(S.me, me.name)}${pid() ? avatar(pid(), pName(), 'sm2') : ''}</div><div><h2 style="font-size:28px">${esc(me.name || '')}</h2><div class="sub">${pid() ? 'ביחד עם ' + esc(pName()) : ''}${start ? ' · מאז ' + heD(start) : ''}</div><button class="linkbtn editp" data-act="tab" data-t="profile">✏️ עריכת פרופיל</button></div></div>
<div class="stats">${stats.map(([n, l, i]) => `<div><span>${ico(i, 22)}</span><b>${n}</b><small>${l}</small></div>`).join('')}</div></div>

<h3 class="sec">הפרטים שלי</h3><div class="card group">
<div class="mrow" style="flex-wrap:wrap"><span class="fi">${ico('talk', 20)}</span><span class="mt"><b>איך לפנות אליי</b><span class="sub">${gOf(S.me) === 'm' ? 'בלשון זכר' : gOf(S.me) === 'f' ? 'בלשון נקבה' : 'עוד לא נבחר'}</span></span><span class="chips"><button class="chip" style="min-height:38px" data-act="gender" data-v="m" aria-pressed="${gOf(S.me) === 'm'}">זכר</button><button class="chip" style="min-height:38px" data-act="gender" data-v="f" aria-pressed="${gOf(S.me) === 'f'}">נקבה</button></span></div>
${row('me', 'הכינוי והתמונה שלי', esc(me.name || ''), 'tab', 'data-t="profile"')}
</div>

${S.edit === 'focus' ? `<div class="card pad"><b>מה חשוב לי</b><div class="chips" style="margin:10px 0">${FOCUS.map(x => `<button type="button" class="chip" data-act="focus" data-v="${esc(x)}" aria-pressed="${(S.pref.focus || []).includes(x)}">${esc(x)}</button>`).join('')}</div><div class="row"><button data-act="savefocus">שמירה</button><button class="mini" data-act="edit" data-e="">ביטול</button></div></div>` : ''}
<h3 class="sec">הזוגיות</h3><div class="card group">
${S.edit === 'start' ? `<form data-form="setstart" class="pad"><label for="setstart">מתי התחלנו?</label><input id="setstart" type="date" value="${esc(start || '')}"><div class="row"><button>שמירה</button><button type="button" class="mini" data-act="edit" data-e="">ביטול</button></div></form>` : row('together', 'מתי התחלנו', start ? heD(start) : 'לא הוגדר', 'edit', 'data-e="start"')}
${row('notes', 'מה חשוב לי', esc(((me.prefs || {}).focus || []).map(x => x.replace(/^\S+\s/, '')).join(' · ') || 'עוד לא בחרת'), 'editfocus')}
${pid() ? `<div class="mrow"><span class="fi">${ico('me', 20)}</span><span class="mt"><b>מה חשוב ל${esc(pName())}</b><span class="sub">${esc(((S.members[pid()].prefs || {}).focus || []).map(x => x.replace(/^\S+\s/, '')).join(' · ') || 'עוד לא ' + P('בחר', 'בחרה'))}</span></span></div>` : ''}
${(n => row('talk', 'לדבר בנחת', n ? n + ' נקודות פתוחות' : 'לדברים שפחות נעים להגיד', 'tab', 'data-t="talk"'))(of('issue').filter(i => i.status !== 'solved').length)}
${row('link', 'קוד הזוג', `<span dir="ltr">${esc(S.couple.code)}</span>`, 'copycode')}
</div>

<h3 class="sec">פרימיום</h3><div class="card group">${row('games', isPremium() ? 'פרימיום פעיל 💎' : 'רק שלנו פרימיום', isPremium() ? (S.couple.premium_note === 'founders' ? 'מתנה לתמיד לזוג הראשון' : 'משותף לשניכם') : 'משחקים, תכנון דייטים וכל ההיסטוריה', 'tab', 'data-t="premium"')}</div>
<h3 class="sec">התראות</h3><div class="card group">
<div class="mrow"><span class="fi">${ico('bell', 20)}</span><span class="mt"><b>התראות לטלפון</b><span class="sub">${p.txt}</span></span>${p.can ? '<button data-act="push">הפעלה</button>' : ''}</div>
${sw('remind', 'תזכורות', 'בערב, אם השאלה של היום מחכה. יום לפני תאריך חשוב, בבוקר', 'together')}
${p.ios ? '<p class="sub pad" style="margin:0">באייפון: כפתור השיתוף בספארי ← "הוספה למסך הבית", ופותחים מהאייקון.</p>' : ''}
</div>

<h3 class="sec">עיצוב</h3><div class="card pad"><b>מצב תצוגה</b><div class="seg" style="margin:10px 0 16px">${MODES.map(([k, l]) => `<button data-act="mode" data-k="${k}" aria-selected="${MODE === k}">${l}</button>`).join('')}</div>
<b>צבע האפליקציה</b><p class="hint">${MODE === 'auto' ? 'בהיר או כהה משתנה לבד לפי הגדרות הטלפון.' : 'אפשר לבחור כל צבע, בכל מצב.'}</p><div class="swatches">${Object.entries(THEMES).map(([k, t]) => `<button class="sw" data-act="theme" data-k="${k}" aria-pressed="${S.theme === k}" style="--a:${t.l[0]};--a2:${t.d[0]}"><i></i>${t.name}</button>`).join('')}</div>
</div>

<h3 class="sec">פרטיות וחשבון</h3><div class="card group">
${E2E ? `<button class="mrow" data-act="e2esheet"><span class="fi">${ico('lock', 20)}</span><span class="mt"><b>מוצפן מקצה לקצה 🔐</b><span class="sub">${K.rows.filter(r => r.wrapped).length} מכשירים מאושרים · קוד שחזור</span></span><span class="chev">‹</span></button>` : ''}
<div class="mrow" style="flex-wrap:wrap"><span class="fi">${ico('lock', 20)}</span><span class="mt"><b>נעילת האפליקציה</b><span class="sub">${{ none: 'בלי נעילה בטלפון הזה', pin: 'קוד של 4 ספרות בכל פתיחה', bio: bioName() + ' בכל פתיחה', both: bioName() + ', והקוד לגיבוי' }[lockMode()]}</span></span>
<div class="seg sm" style="flex-basis:100%;margin-top:8px">${[['none', 'בלי'], ['pin', 'קוד'], ['bio', bioName() === 'Face ID' ? 'Face ID' : 'אצבע'], ['both', 'שניהם']].map(([k, l]) => `<button data-act="lockmode" data-v="${k}" aria-selected="${lockMode() === k}">${l}</button>`).join('')}</div></div>
<a class="mrow" href="privacy.html" data-act="privacy"><span class="fi">${ico('lock')}</span><span class="mt"><b>מדיניות פרטיות</b></span><span class="chev">‹</span></a>
${row('me', 'התנתקות', '', 'logout')}
<div class="pad">${acctTools()}</div></div>
<p class="center sub" style="padding:8px 0 0">רק שלנו · גרסה 3.9<br>נבנה באהבה בישראל</p>`;
};

V.profile = () => {
  const me = S.members[S.me] || {}, nick = nickForMe(), myNick = me.prefs?.nickFor || '';
  return `<button class="back" data-act="tab" data-t="me">› חזרה</button><h1>הפרופיל שלי</h1>
<div class="center" style="display:grid;justify-items:center;gap:6px"><button class="avbtn" data-act="avsheet" aria-label="עריכת תמונה">${avatar(S.me, me.name, 'xl')}<span class="avedit">✏️</span></button>
<h2>${esc(realName(S.me))}</h2>${pid() ? (nick ? `<span class="nickline">${esc(realName(pid()))} ${P('קורא', 'קוראת')} לך: <b>${esc(nick)}</b> 💕</span>` : `<span class="sub">${esc(realName(pid()))} עוד לא ${P('נתן', 'נתנה')} לך כינוי</span>`) : ''}
<span class="hint">לחיצה על התמונה לעריכה</span></div>
${pid() ? `<div class="card"><form data-form="setnick"><b style="font-size:18px">איך ${M('אתה קורא', 'את קוראת')} ל${esc(realName(pid()))}? 💕</b><p class="hint">הכינוי יופיע אצלך במקום השם, ו${esc(realName(pid()))} ${P('יראה', 'תראה')} אותו בפרופיל ${P('שלו', 'שלה')}.</p>
<input id="setnick" value="${esc(myNick)}" maxlength="24" placeholder="מותק, חיים שלי, בובה…"><div class="row"><button style="flex:1">שמירת הכינוי</button>${myNick ? '<button type="button" class="mini" data-act="clearnick">בלי כינוי</button>' : ''}</div></form></div>` : ''}
<div class="card"><form data-form="setname"><b style="font-size:18px">השם שלי</b><p class="hint">איך קוראים לך. ${pid() ? esc(realName(pid())) + ' ' + P('רואה', 'רואה') + ' אותו אם אין כינוי.' : ''}</p><input id="setname" value="${esc(me.name || '')}" maxlength="30" required><button>שמירת השם</button></form></div>`;
};
function sheetView() {
  if (S.sheet !== 'avatar') return '';
  const me = S.members[S.me] || {}, ch = me.prefs?.av || {}, pc = ch.c || avColor(S.me);
  return `<div class="sheetbg" data-act="closesheet"></div><div class="sheet" role="dialog" aria-label="עריכת תמונה"><i class="grab"></i>
${S.sheetMode === 'emoji' ? `<b style="font-size:18px">🎭 בחירת דמות</b>
<div class="emos">${EMO.map(e => `<button class="emo-b" data-act="avemo" data-v="${e}" aria-pressed="${ch.e === e && !me.avatar}">${e}</button>`).join('')}</div>
<div class="row" style="gap:8px">${AV.map(c => `<button class="colb" data-act="avcol" data-v="${c}" aria-pressed="${pc === c}" style="--c:${c}" aria-label="צבע רקע"></button>`).join('')}</div>
<button class="wide" data-act="closesheet">סיום</button>` : `<b style="font-size:18px">תמונת הפרופיל</b>
<button class="sheetrow" data-act="pickphoto"><span>📷</span>${me.avatar ? 'תמונה אחרת מהגלריה' : 'בחירת תמונה מהגלריה'}</button>
${me.avatar ? `<button class="sheetrow" data-act="recrop"><span>✂️</span>לערוך את התמונה הנוכחית</button>` : ''}
<button class="sheetrow" data-act="emojimode"><span>🎭</span>בחירת דמות במקום תמונה</button>
${me.avatar || ch.e ? `<button class="sheetrow warn" data-act="rmavatar"><span>🗑️</span>להסיר ולחזור לאות הראשונה</button>` : ''}
<button class="wide ghost" data-act="closesheet">ביטול</button>`}</div>`;
}
function cropView() {
  if (!S.crop) return '';
  return `<div class="cropwrap" role="dialog" aria-label="עריכת תמונה"><b style="font-size:20px">עריכת התמונה</b><p class="hint" style="margin:0;color:#cfd8dc">גוררים כדי להזיז, והפס מגדיל</p>
<canvas id="cropc" width="560" height="560"></canvas>
<label class="zoom"><span>−</span><input id="cropz" type="range" min="1" max="3" step="0.01" value="${S.crop.z}"><span>+</span></label>
<div class="row" style="width:min(320px,90vw);flex-wrap:nowrap"><button style="flex:1" data-act="cropsave">שמירה</button><button class="ghost" style="flex:1;color:#fff;border-color:#fff8" data-act="cropcancel">ביטול</button></div></div>`;
}
let cropImg = null;
function drawCrop() {
  const c = document.getElementById('cropc'); if (!c || !cropImg || !S.crop) return;
  const ctx = c.getContext('2d'), N = c.width, w = cropImg.width, h = cropImg.height, sc = N / Math.min(w, h) * S.crop.z;
  const maxX = Math.max(0, (w * sc - N) / 2), maxY = Math.max(0, (h * sc - N) / 2);
  S.crop.x = Math.max(-maxX, Math.min(maxX, S.crop.x)); S.crop.y = Math.max(-maxY, Math.min(maxY, S.crop.y));
  ctx.clearRect(0, 0, N, N); ctx.save(); ctx.beginPath(); ctx.arc(N / 2, N / 2, N / 2, 0, Math.PI * 2); ctx.clip();
  ctx.drawImage(cropImg, N / 2 - w * sc / 2 + S.crop.x, N / 2 - h * sc / 2 + S.crop.y, w * sc, h * sc); ctx.restore();
}
async function openCrop(src) {
  try {
    cropImg = src instanceof Blob ? await createImageBitmap(src, { imageOrientation: 'from-image' }).catch(() => null) : null;
    if (!cropImg) cropImg = await new Promise((res, rej) => { const u = src instanceof Blob ? URL.createObjectURL(src) : src, i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
    S.sheet = null; S.crop = { z: 1, x: 0, y: 0 }; render();
  } catch (_) { toast('לא הצלחתי לפתוח את התמונה'); }
}
async function saveCrop() {
  const N = 320, out = document.createElement('canvas'); out.width = out.height = N;
  const w = cropImg.width, h = cropImg.height, k = N / 560, sc = 560 / Math.min(w, h) * S.crop.z * k;
  out.getContext('2d').drawImage(cropImg, N / 2 - w * sc / 2 + S.crop.x * k, N / 2 - h * sc / 2 + S.crop.y * k, w * sc, h * sc);
  let q = .85, url = out.toDataURL('image/jpeg', q); while (url.length > 140000 && q > .4) { q -= .12; url = out.toDataURL('image/jpeg', q); }
  S.crop = null; cropImg = null; render(); toast('שומר…');
  if (await run(sb.from('members').update({ avatar: await sealStr(url) }).eq('user_id', S.me), 'התמונה נשמרה')) { S.members[S.me].avatar = url; render(); }
}
// dragging inside the crop circle
{
  let drag = null;
  document.addEventListener('pointerdown', e => { if (e.target.id !== 'cropc' || !S.crop) return; const r = e.target.getBoundingClientRect(); drag = { x: e.clientX, y: e.clientY, ox: S.crop.x, oy: S.crop.y, k: 560 / r.width }; e.target.setPointerCapture(e.pointerId); });
  document.addEventListener('pointermove', e => { if (!drag || !S.crop) return; S.crop.x = drag.ox + (e.clientX - drag.x) * drag.k; S.crop.y = drag.oy + (e.clientY - drag.y) * drag.k; drawCrop(); });
  document.addEventListener('pointerup', () => { drag = null; });
  document.addEventListener('input', e => { if (e.target.id === 'cropz' && S.crop) { S.crop.z = +e.target.value; drawCrop(); } });
}
V.premium = () => `<button class="back" data-act="tab" data-t="me">› חזרה</button>
<div class="card prem"><span class="pbadge">💎</span><h1>רק שלנו פרימיום</h1><p class="sub" style="margin:0">מנוי אחד לשניכם. אחד משלם, ושניכם נהנים.</p></div>
<div class="card group">${PREMIUM_FEATURES.map(([i, t, d]) => `<div class="mrow"><span class="fi">${ico(i, 20)}</span><span class="mt"><b>${t}</b><span class="sub">${d}</span></span><span class="mk ok">✓</span></div>`).join('')}</div>
${isPremium() ? `<div class="card center"><b>הפרימיום שלכם פעיל 💎</b>${S.couple.premium_note === 'founders' ? '<p class="sub" style="margin:6px 0 0">מתנה לתמיד, כי אתם הזוג הראשון של רק שלנו ❤️</p>' : ''}</div>` : `
<div class="plans"><div class="card plan-o"><b>חודשי</b><span class="pp">₪20</span><span class="sub">לחודש</span></div><div class="card plan-o best"><span class="pill hot">הכי משתלם</span><b>שנתי</b><span class="pp">₪150</span><span class="sub">לשנה · יוצא ₪12.5 לחודש</span></div></div>
<button class="wide" disabled>בקרוב בחנות</button><p class="hint center">שבוע ראשון חינם. אפשר לבטל מתי שרוצים.</p>`}
<p class="hint center">פתקים, חיבוקים, השאלה היומית, תאריכים, צנצנת הרעיונות וזיכרונות נשארים בחינם, תמיד.</p>`;
// ===== memory book: photos, designs, and a printable PDF =====
const BOOK_THEMES = {
  rose: { name: 'רומנטי', bg: '#fdf0f2', ink: '#4a2230', acc: '#c2185b', sub: '#9a6b78', frame: 'round', orn: '♥' },
  classic: { name: 'קלאסי', bg: '#f6efe2', ink: '#3e3122', acc: '#8a6a3b', sub: '#8c7a62', frame: 'border', orn: '❦' },
  polar: { name: 'פולארויד', bg: '#e6d9c2', ink: '#3b3328', acc: '#b5543c', sub: '#7d6d58', frame: 'polaroid', orn: '✿' },
  night: { name: 'לילה', bg: '#1d2340', ink: '#f3ead6', acc: '#d9b45a', sub: '#b8b2a0', frame: 'gold', orn: '✦' },
  minimal: { name: 'מינימלי', bg: '#ffffff', ink: '#111111', acc: '#111111', sub: '#777777', frame: 'square', orn: '·' },
  garden: { name: 'פרחוני', bg: '#eef3e8', ink: '#2f3d2c', acc: '#5d8a4e', sub: '#6f7f68', frame: 'round', orn: '❀' },
};
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
const monthYear = d => { const [y, m] = d.split('-'); return MONTHS[+m - 1] + ' ' + y; };
const bookItem = () => of('book')[0];
const bookKey = () => BOOK_THEMES[bookItem()?.theme] ? bookItem().theme : 'rose';
const bookTitle = () => bookItem()?.title || 'הסיפור שלנו';
async function setBook(patch) { const b = bookItem(); return b ? upd(b.id, patch) : add('book', { theme: bookKey(), title: bookTitle(), ...patch }); }
const MAXPH = () => isPremium() ? 6 : 1;

// photos are shrunk, sealed with the couple key, and stored as opaque files; the demo keeps them inline
const PH = new Map();
async function shrinkBig(file, max = 1600) {
  let img; try { img = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch (_) { img = await new Promise((res, rej) => { const u = URL.createObjectURL(file), i = new Image(); i.onload = () => { URL.revokeObjectURL(u); res(i); }; i.onerror = rej; i.src = u; }); }
  const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, k = Math.min(1, max / Math.max(w, h)), c = document.createElement('canvas');
  c.width = Math.round(w * k); c.height = Math.round(h * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return new Promise(r => c.toBlob(r, 'image/jpeg', .84));
}
const blobURL = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
async function putPhoto(file) {
  const blob = await shrinkBig(file);
  if (!E2E) return blobURL(blob);
  const iv = crypto.getRandomValues(new Uint8Array(12)), ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, K.ck, await blob.arrayBuffer()));
  const body = new Uint8Array(12 + ct.length); body.set(iv); body.set(ct, 12);
  const path = S.couple.id + '/' + crypto.randomUUID();
  const { error } = await sb.storage.from('photos').upload(path, new Blob([body], { type: 'application/octet-stream' }), { contentType: 'application/octet-stream' });
  if (error) throw error;
  PH.set(path, URL.createObjectURL(blob)); return path;
}
async function photoURL(ref) {
  if (!ref || ref.startsWith('🔒')) return null; if (ref.startsWith('data:')) return ref;
  if (PH.has(ref)) return PH.get(ref);
  const p = (async () => {
    const { data, error } = await sb.storage.from('photos').download(ref); if (error || !K.ck) return null;
    const b = new Uint8Array(await data.arrayBuffer());
    return URL.createObjectURL(new Blob([await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.slice(0, 12) }, K.ck, b.slice(12))], { type: 'image/jpeg' }));
  })().catch(() => null);
  PH.set(ref, p); const u = await p; PH.set(ref, u); return u;
}
const phImg = ref => { const u = ref?.startsWith('data:') ? ref : PH.get(ref); return `<img data-ph="${esc(ref)}" ${typeof u === 'string' ? `src="${esc(u)}"` : ''} alt="">`; };
function hydratePhotos() { document.querySelectorAll('img[data-ph]:not([src])').forEach(async im => { const u = await photoURL(im.dataset.ph); if (u) im.src = u; else im.parentElement?.classList.add('miss'); }); }
async function dropPhotos(refs) { const real = (refs || []).filter(r => r && !r.startsWith('data:') && !r.startsWith('🔒')); if (E2E && real.length) await sb.storage.from('photos').remove(real); }

// new-memory photo picker (kept outside the screen so re-renders don't lose it)
const memIn = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*', multiple: true, hidden: true });
document.body.append(memIn);
memIn.addEventListener('change', () => {
  picking = false; const files = [...(memIn.files || [])]; memIn.value = '';
  S.memPh = S.memPh || []; const room = MAXPH() - S.memPh.length;
  files.slice(0, Math.max(0, room)).forEach(f => S.memPh.push({ f, u: URL.createObjectURL(f) }));
  if (files.length > room) toast(isPremium() ? 'עד 6 תמונות לזיכרון' : 'בחינם: תמונה אחת לזיכרון. בפרימיום עד 6');
  render();
});

// ---- the story the book tells: built from everything you do in the app ----
const ORIGIN = ['איך ואיפה נפגשנו בפעם הראשונה?', 'מה חשבת עליי בפעם הראשונה?', 'מתי הבנת שזה משהו רציני?', 'מה הדבר הראשון שאהבת בי?', 'איזה רגע מההתחלה הכי נשאר לך?'];
const SEASONS = [['חורף', '❄️'], ['אביב', '🌸'], ['קיץ', '☀️'], ['סתיו', '🍂']];
const ORD = ['הראשון', 'השני', 'השלישי', 'הרביעי', 'החמישי', 'השישי'];
const dayKey = t => new Date(t).toLocaleDateString('en-CA');
function seasonOf(k) { const y = +k.slice(0, 4), m = +k.slice(5, 7), s = m === 12 || m <= 2 ? 0 : m <= 5 ? 1 : m <= 8 ? 2 : 3; return { key: (m === 12 ? y + 1 : y) + '-' + s, s, y: m === 12 ? y + 1 : y }; }
const storyOf = id => of('story').find(x => x.by === id);
const lettersAll = () => of('letter').filter(l => l.openOn).sort((a, b) => a.openOn.localeCompare(b.openOn));
const letterOpen = l => l.openOn <= today();
const starsTxt = n => '★'.repeat(n || 0) + '☆'.repeat(5 - (n || 0));
// ---- storytelling helpers ----
const MILESTONES = [[30, 'חודש ראשון ביחד', '🌱'], [100, '100 ימים ביחד', '💯'], [182, 'חצי שנה ביחד', '🌗'], [365, 'שנה ראשונה ביחד', '🎂'], [500, '500 ימים ביחד', '✨'], [730, 'שנתיים ביחד', '🎂'], [1000, '1,000 ימים ביחד', '🎉'], [1095, 'שלוש שנים ביחד', '🎂'], [1461, 'ארבע שנים ביחד', '🎂'], [1826, 'חמש שנים ביחד', '🎂']];
const SEASON_DOODLE = ['❄', '✿', '☀', '❧'];
const addDays = (k, n) => new Date(Date.parse(k + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const dayNo = k => S.couple?.start_date ? dnum(k) - dnum(S.couple.start_date) + 1 : null;
const dayLabel = k => { const n = dayNo(k); return n && n > 0 ? `היום ה-${n.toLocaleString('he-IL')} שלנו` : ''; };
const cnt = (n, one, many) => n === 1 ? one : `${n.toLocaleString('he-IL')} ${many}`;
const joinHe = l => l.length < 2 ? l.join('') : l.slice(0, -1).join(', ') + ' ו' + (/^\d/.test(l[l.length - 1]) ? '-' : '') + l[l.length - 1];
// little decorations around the edges of a page, the same in the app and in the PDF
function doodles(seed, n = 7) {
  let s = seed * 9301 + 49297; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280, out = [];
  for (let i = 0; i < n; i++) { const side = i % 4, a = .06 + r() * .88, b = .025 + r() * .04; const [x, y] = side === 0 ? [a, b] : side === 1 ? [a, 1 - b] : side === 2 ? [b, a] : [1 - b, a]; out.push([x, y, .035 + r() * .035, (r() - .5) * 50]); }
  return out;
}
function bookPages() {
  const me = S.me, pt = pid(), start = S.couple?.start_date, pages = [{ t: 'cover' }];
  const sm = storyOf(me)?.a || [], sp = pt ? storyOf(pt)?.a || [] : [];
  const plansDone = of('plan').filter(p => p.date && Object.keys(p.review || {}).length);
  const dateCount = k => plansDone.filter(p => p.date <= k).length + of('idea').filter(i => i.done && dayKey(i.doneAt || i.at) <= k).length;
  // a written opening, built from what you two actually did
  const days = daysTogether(), names = coupleNames();
  const sums = [cnt(of('note').length, 'פתק אחד', 'פתקים'), cnt(of('hug').length, 'חיבוק אחד', 'חיבוקים'), cnt(dateCount('9999'), 'דייט אחד', 'דייטים')].filter(x => !/^0 /.test(x));
  pages.push({ t: 'prose', label: 'לפני שמתחילים', title: 'זה הסיפור שלנו',
    text: `זה הסיפור של ${names}.` + (start ? ` הוא התחיל ב-${heD(start)}${days > 0 ? `, ומאז עברו ${days.toLocaleString('he-IL')} ימים` + (sums.length ? `, ${joinHe(sums)}` : '') : ''}.` : '') + ' כל מה שכתוב כאן כתבנו בעצמנו, פתק אחרי פתק, עד שיצא מזה ספר.',
    quotes: [[me, sm[0]], [pt, sp[0]]].filter(([u, t]) => u && t).map(([u, t]) => [u, t]) });
  const toc = { t: 'toc', rows: [] }; pages.push(toc);
  // where it all began: both sides, question by question
  const orig = ORIGIN.map((q, i) => ({ q, a: sm[i] || '', b: sp[i] || '' })).filter(x => x.a || x.b);
  if (orig.length) {
    toc.rows.push(['איך הכל התחיל', pages.length]);
    pages.push({ t: 'opener', title: 'איך הכל התחיל', ico: '💞' });
    for (let i = 0; i < orig.length;) { const x = orig[i], y = orig[i + 1], len = z => (z.a + z.b).length;
      if (y && len(x) + len(y) < 320) { pages.push({ t: 'qa2', label: 'איך הכל התחיל', qs: [x, y] }); i += 2; } else { pages.push({ t: 'qa', label: 'איך הכל התחיל', q: x.q, a: x.a, b: x.b }); i++; } }
  }
  // everything with a date, grouped into seasons
  const fromReview = m => !m.planId && /^דייט: /.test(m.text || '') && plansDone.some(p => p.date === m.date);
  const mems = of('memory').filter(m => m.date && !m.planId && !fromReview(m));
  const A = of('answer'), byDay = {};
  for (const a of A) (byDay[a.day] ||= []).push(a);
  const both = Object.entries(byDay).filter(([, l]) => new Set(l.map(a => a.by)).size >= 2);
  let qa = both.filter(([, l]) => l.some(a => a.book));
  if (!qa.length) qa = [...both].sort((x, y) => y[1].reduce((s, a) => s + (a.text || '').length, 0) - x[1].reduce((s, a) => s + (a.text || '').length, 0)).slice(0, 6);
  const notes = of('note').filter(n => n.book), today_ = today();
  const miles = start ? MILESTONES.map(([n, title, ico]) => ({ k: addDays(start, n - 1), t: 'milestone', title, ico })).filter(m => m.k <= today_) : [];
  for (const m of miles) m.stats = [[of('note').filter(x => dayKey(x.at) <= m.k).length, 'פתקים'], [of('hug').filter(x => dayKey(x.at) <= m.k).length, 'חיבוקים'], [dateCount(m.k), 'דייטים'], [of('memory').filter(x => x.date && x.date <= m.k).length, 'זיכרונות']].filter(([v]) => v);
  const E = [
    ...mems.map(m => ({ k: m.date, t: 'mem', m })),
    ...plansDone.map(p => ({ k: p.date, t: 'date', p, ph: of('memory').filter(m => m.planId === p.id).flatMap(m => m.photos || []) })),
    ...qa.map(([d, l]) => { const a = l.find(x => x.by === me), b = l.find(x => x.by !== me); return { k: d, t: 'qa', label: dayLabel(d) ? dayLabel(d) + ' · השאלה היומית' : 'השאלה של ' + heD(d), q: fmtQ(l.find(x => x.qt)?.qt || qFor(d)), a: a?.text || '', b: b?.text || '' }; }),
    ...miles,
  ].sort((x, y) => x.k.localeCompare(y.k) || (x.t === 'milestone' ? -1 : 1));
  const chapters = new Map();
  for (const e of E) { const s = seasonOf(e.k); if (!chapters.has(s.key)) chapters.set(s.key, { ...s, items: [], notes: [] }); chapters.get(s.key).items.push(e); }
  for (const n of notes) { const s = seasonOf(dayKey(n.at)); if (!chapters.has(s.key)) chapters.set(s.key, { ...s, items: [], notes: [] }); chapters.get(s.key).notes.push(n); }
  const sorted = [...chapters.values()].sort((a, b) => a.key.localeCompare(b.key)), real = sorted.filter(c => c.items.some(e => e.t !== 'milestone'));
  if (real.length) for (const c of sorted) if (!real.includes(c)) { const host = [...real].reverse().find(r => r.key < c.key) || real[0]; host.items.push(...c.items); host.notes.push(...c.notes); host.items.sort((x, y) => x.k.localeCompare(y.k)); }
  const count = {}; let ci = 0, memI = 0;
  for (const ch of real.length ? real : sorted) {
    const n = count[ch.s] = (count[ch.s] || 0) + 1, [name, ico] = SEASONS[ch.s], title = `ה${name} ${ORD[n - 1] || 'של ' + ch.y} שלנו`;
    const inCh = kind => of(kind).filter(x => seasonOf(dayKey(x.at)).key === ch.key).length;
    const nN = inCh('note'), nH = inCh('hug'), nD = ch.items.filter(e => e.t === 'date').length, nM = ch.items.filter(e => e.t === 'mem').length;
    const did = [nN && 'כתבנו ' + cnt(nN, 'פתק אחד', 'פתקים'), nH && 'שלחנו ' + cnt(nH, 'חיבוק אחד', 'חיבוקים'), nD && (nD === 1 ? 'יצאנו לדייט אחד' : `יצאנו ל-${nD} דייטים`), nM && 'שמרנו ' + cnt(nM, 'זיכרון אחד', 'זיכרונות')].filter(Boolean);
    const hl = ch.items.find(e => e.t === 'mem' && e.m.text)?.m.text || ch.items.find(e => e.t === 'date')?.p.title, ms = ch.items.find(e => e.t === 'milestone');
    const story = (did.length ? `ב${name} הזה ${joinHe(did)}.` : '') + (ms ? ` וגם חגגנו ${ms.title.replace(' ביחד', '')} ביחד.` : '') + (hl ? ` הרגע שהכי נשאר: "${hl.length > 70 ? hl.slice(0, 68).replace(/\s\S*$/, '') + '…' : hl}"` : '');
    toc.rows.push([title, pages.length]);
    pages.push({ t: 'chapter', no: ++ci, ico, s: ch.s, title, story, stats: [[nN, 'פתקים'], [nH, 'חיבוקים'], [nD, 'דייטים'], [nM, 'זיכרונות']].filter(([v]) => v) });
    for (const e of ch.items) pages.push(e.t === 'mem' ? { ...e, lay: memLayout(e.m, memI++) } : e);
    for (let i = 0; i < ch.notes.length; i += 3) pages.push({ t: 'quotes', notes: ch.notes.slice(i, i + 3) });
  }
  // how alike we are
  const G2 = games(), tots = G2.filter(g => g.type === 'tot' && totDone(g)), gs = G2.filter(g => g.type === 'guess' && guessDone(g)), chs = G2.filter(g => g.type === 'challenge' && Object.keys(g.done || {}).length >= 2);
  if (tots.length || gs.length || chs.length) {
    const tiles = [];
    if (tots.length) tiles.push([Math.round(tots.reduce((s, g) => s + totMatch(g), 0) / tots.length * 20) + '%', 'התאמה ב"זה או זה"']);
    if (gs.length) for (const id of [me, pt].filter(Boolean)) { const mine = gs.filter(g => g.by !== id); if (mine.length) tiles.push([Math.round(mine.reduce((s, g) => s + guessScore(g), 0) / mine.length * 20) + '%', realName(id) + ' ' + G(id, 'מכיר', 'מכירה')]); }
    if (chs.length) tiles.push([chs.length, 'אתגרים שהשלמנו']);
    toc.rows.push(['כמה אנחנו דומים', pages.length]);
    pages.push({ t: 'stats', title: 'כמה אנחנו דומים', ico: '🎲', tiles });
  }
  toc.rows.push(['המספרים שלנו', pages.length]);
  pages.push({ t: 'stats', title: 'המספרים שלנו', ico: '♥', tiles: [[days != null ? days.toLocaleString('he-IL') : '–', 'ימים ביחד'], [of('note').length, 'פתקים'], [of('hug').length, 'חיבוקים'], [dateCount('9999'), 'דייטים'], [of('memory').length, 'זיכרונות'], [both.length, 'שאלות שענינו ביחד']].filter(([v], i) => i === 0 || v) });
  const L = lettersAll(); if (L.length) toc.rows.push(['מכתבים לעתיד', pages.length]);
  for (const l of L) pages.push({ t: 'letter', l });
  // where we are today, and what's next
  const up = upcomingPlans()[0], ev = of('event').map(e => ({ ...e, k: nextOcc(e) })).filter(e => e.k >= 0).sort((a, b) => a.k - b.k)[0], locked = L.filter(l => !letterOpen(l)).length;
  const next = up ? (hidden(up) ? 'דייט הפתעה' : up.title || 'דייט') + ' ' + whenTxt(planDays(up)) : ev ? ev.title + ' ' + whenTxt(ev.k) : '';
  toc.rows.push(['איפה אנחנו היום', pages.length]);
  pages.push({ t: 'epilogue', text: (days > 0 ? `היום, אחרי ${days.toLocaleString('he-IL')} ימים ביחד, ` : 'היום, ') + (next ? `מחכה לנו ${next}.` : 'אנחנו כבר חולמים על ההרפתקה הבאה.') + (locked ? ` ו${locked === 1 ? 'יש מכתב אחד שמחכה' : `יש ${locked} מכתבים שמחכים`} להיפתח.` : '') + ' הספר הזה עוד לא נגמר.', n: E.length });
  pages.forEach((p, i) => { p.pno = i + 1; });
  toc.rows = toc.rows.map(([t, i]) => [t, i + 1]);
  return pages;
}
function memLayout(m, i) { const n = (m.photos || []).length, short = (m.text || '').length < 150; return !n ? 'quote' : n === 1 && short && i % 2 === 0 ? 'hero' : n === 1 ? 'split' : 'collage'; }
const coupleNames = () => [realName(S.me), pid() ? realName(pid()) : ''].filter(Boolean).join(' ו');
const dd = (sym, seed, n) => `<div class="bdd" aria-hidden="true">${doodles(seed, n).map(([x, y, z, r]) => `<i style="left:${(x * 100).toFixed(1)}%;top:${(y * 100).toFixed(1)}%;font-size:${(z * 100).toFixed(1)}cqw;transform:translate(-50%,-50%) rotate(${r.toFixed(0)}deg)">${sym}</i>`).join('')}</div>`;
function pageHTML(p, th) { const h = pageInner(p, th); return p.pno > 1 && p.lay !== 'hero' ? h.replace(/<\/section>$/, `<span class="pno">${p.pno}</span></section>`) : h; }
function pageInner(p, th) {
  const head = (l, r = th.orn) => `<div class="bhead"><span>${esc(l)}</span><span>${r}</span></div>`;
  const photos = (ph, cls = '') => ph.length ? `<div class="bphotos n${Math.min(ph.length, 4)} ${cls}">${ph.slice(0, 4).map(r => `<div class="ph">${phImg(r)}</div>`).join('')}</div>` : '';
  const two = (a, b) => `<div class="bcols"><div><b>${esc(realName(S.me))}</b><p>${esc(a || '…')}</p></div><div><b>${esc(pid() ? realName(pid()) : '')}</b><p>${esc(b || '…')}</p></div></div>`;
  switch (p.t) {
    case 'cover': { const ph = of('memory').filter(m => (m.photos || []).length).sort((a, b) => a.date.localeCompare(b.date))[0]?.photos[0];
      return `<section class="bpage bcover"><span class="born">${th.orn}</span><h2>${esc(bookTitle())}</h2>${ph ? `<div class="ph cov">${phImg(ph)}</div>` : ''}<b>${esc(coupleNames())}</b>${S.couple?.start_date ? `<span class="bsub">מאז ${heD(S.couple.start_date)}</span>` : ''}</section>`; }
    case 'opener': return `<section class="bpage bcover"><span class="bico">${p.ico}</span><h2>${esc(p.title)}</h2><span class="bsub">כל אחד מאיתנו, מהצד שלו</span></section>`;
    case 'chapter': return `<section class="bpage bcover chap">${dd(SEASON_DOODLE[p.s], p.no * 7, 9)}<span class="bsub">פרק ${p.no}</span><span class="bico">${p.ico}</span><h2>${esc(p.title)}</h2>${p.story ? `<p class="bstory">${esc(p.story)}</p>` : ''}${p.stats.length ? `<div class="bchips">${p.stats.map(([v, l]) => `<span><b>${v}</b> ${l}</span>`).join('')}</div>` : ''}</section>`;
    case 'prose': return `<section class="bpage prose">${dd(th.orn, 3, 6)}${head(p.label)}<h3 class="btitle">${esc(p.title)}</h3><p class="bprose">${esc(p.text)}</p>${p.quotes.map(([u, t]) => `<p class="badd">${esc(realName(u))} ${G(u, 'זוכר', 'זוכרת')}: "${esc(t)}"</p>`).join('')}</section>`;
    case 'toc': return `<section class="bpage toc">${head('תוכן העניינים')}<ol class="btoc">${p.rows.map(([t, n]) => `<li><span>${esc(t)}</span><i></i><b>${n}</b></li>`).join('')}</ol></section>`;
    case 'milestone': return `<section class="bpage bcover mile">${dd('✦', dnum(p.k) % 97, 10)}<span class="bsub">${heD(p.k)}</span><span class="bico">${p.ico}</span><h2>${esc(p.title)}</h2>${p.stats.length ? `<span class="bsub">עד היום הזה:</span><div class="bchips">${p.stats.map(([v, l]) => `<span><b>${v}</b> ${l}</span>`).join('')}</div>` : ''}</section>`;
    case 'epilogue': return `<section class="bpage bcover">${dd(th.orn, 11, 8)}<span class="born">${th.orn}</span><h2>איפה אנחנו היום</h2><p class="bstory">${esc(p.text)}</p><span class="bsub">${p.n} רגעים בספר עד עכשיו · ועוד הרבה בדרך</span></section>`;
    case 'qa': return `<section class="bpage qa">${head(p.label)}<p class="bq">${esc(p.q)}</p>${two(p.a, p.b)}</section>`;
    case 'qa2': return `<section class="bpage qa qa2">${head(p.label)}${p.qs.map(z => `<p class="bq">${esc(z.q)}</p>${two(z.a, z.b)}`).join('')}</section>`;
    case 'quotes': return `<section class="bpage quotes">${head('מילים טובות')}${p.notes.map(n => `<blockquote>"${esc(n.text)}"<span>${esc(realName(n.by))} · ${heD(dayKey(n.at))}</span></blockquote>`).join('')}</section>`;
    case 'date': { const d = p.p, rv = d.review || {};
      return `<section class="bpage date">${head((dayLabel(d.date) ? dayLabel(d.date) + ' · ' : '') + 'דייט', d.surprise ? '🎁' : th.orn)}<h3 class="btitle">${esc(d.title || '')}</h3>${photos(p.ph, 'short')}
${Object.entries(rv).map(([u, r]) => `<p class="brv"><span class="bst">${starsTxt(r.stars)}</span> <b>${esc(realName(u))}:</b> ${esc(r.text || '')}</p>`).join('')}
<div class="bfoot">${d.surprise && d.planner ? 'הפתעה של ' + esc(realName(d.planner)) + ' · ' : ''}${d.place ? esc(d.place) : heD(d.date)}</div></section>`; }
    case 'mem': { const m = p.m, adds = Object.entries(m.adds || {}).filter(([u, t]) => t && u !== m.by).map(([u, t]) => `<p class="badd">"${esc(t)}" <span>· ${esc(realName(u))}</span></p>`).join(''), foot = `<div class="bfoot">${heD(m.date)}${m.place ? ' · ' + esc(m.place) : ''}</div>`;
      if (p.lay === 'hero') return `<section class="bpage hero"><div class="ph">${phImg(m.photos[0])}</div><div class="hcap"><p>${esc(m.text || '')}</p>${adds}<span>${dayLabel(m.date) ? dayLabel(m.date) + ' · ' : ''}${heD(m.date)}${m.place ? ' · ' + esc(m.place) : ''}</span></div></section>`;
      const ml = (dayLabel(m.date) ? dayLabel(m.date) + ' · ' : '') + monthYear(m.date);
      if (p.lay === 'quote') return `<section class="bpage bquote">${head(ml)}<p class="btxt">"${esc(m.text || '')}"</p>${adds}${foot}</section>`;
      return `<section class="bpage">${head(ml)}${photos(m.photos)}<p class="btxt">${esc(m.text || '')}</p>${adds}${foot}</section>`; }
    case 'stats': return `<section class="bpage bcover stats"><span class="bico">${p.ico}</span><h2>${esc(p.title)}</h2><div class="btiles">${p.tiles.map(([v, l]) => `<div><b>${v}</b><span>${esc(l)}</span></div>`).join('')}</div></section>`;
    case 'letter': { const l = p.l, open = letterOpen(l), to = l.to || (l.by === S.me ? pid() : S.me);
      return `<section class="bpage letter ${open ? '' : 'locked'}">${head('מכתב לעתיד', '💌')}<p class="bto">ל${esc(realName(to))},</p>${open ? `<p class="btxt">${esc(l.text || '')}</p><p class="bsig">${esc(realName(l.by))}</p>` : `<div class="blk">🔒<span>ייפתח ב-${heD(l.openOn)}</span></div>`}<div class="bfoot">נכתב ב-${heD(dayKey(l.at))} · נפתח ב-${heD(l.openOn)}</div></section>`; }
  }
  return '';
}
// the "finish your book" corner: the origin story, letters, and how to pick notes and answers
function bookTools() {
  const pt = pid(), mine = storyOf(S.me)?.a || [], his = pt ? storyOf(pt)?.a || [] : [], L = lettersAll(), marked = of('note').filter(n => n.book).length, qm = new Set(of('answer').filter(a => a.book).map(a => a.day)).size;
  if (S.bookEdit === 'story') return `<div class="card"><form data-form="story"><b style="font-size:18px">💞 איך הכל התחיל</b><p class="hint" style="margin:4px 0 8px">${pt ? esc(realName(pt)) + ' ' + P('עונה', 'עונה') + ' על אותן שאלות בנפרד, ובספר תראו את שני הצדדים.' : 'בן או בת הזוג יענו על אותן שאלות, ובספר תראו את שני הצדדים.'}</p>
${ORIGIN.map((q, i) => `<label for="og${i}">${esc(q)}</label><textarea id="og${i}" maxlength="500" rows="2">${esc(mine[i] || '')}</textarea>`).join('')}<div class="row"><button style="flex:1">שמירה</button><button type="button" class="ghost" data-act="bookedit" data-v="">ביטול</button></div></form></div>`;
  if (S.bookEdit === 'letter') { const min = new Date(Date.now() + 864e5).toLocaleDateString('en-CA');
    return `<div class="card"><form data-form="letter"><b style="font-size:18px">💌 מכתב לעתיד${pt ? ' ל' + esc(realName(pt)) : ''}</b><p class="hint" style="margin:4px 0 8px">המכתב יישאר נעול עד התאריך שתבחר${M('', 'י')}, ואז ${pt ? esc(realName(pt)) + ' ' + P('יקבל', 'תקבל') + ' התראה ויוכל' + P('', 'ה') + ' לקרוא' : 'ייפתח'}. הוא ייכנס גם לספר.</p>
<textarea id="lettxt" maxlength="3000" rows="6" required placeholder="מה הייתי רוצה ש${pt ? esc(realName(pt)) : ''} ${pt ? P('יקרא', 'תקרא') : 'תקראו'} עוד שנה…"></textarea><label for="letdate">מתי לפתוח?</label><input id="letdate" type="date" min="${min}" required value="${S.couple?.start_date ? (() => { const y = new Date().getFullYear(), d = S.couple.start_date.slice(4); let k = y + d; if (k <= today()) k = (y + 1) + d; return k; })() : min}"><p class="hint" style="margin:2px 0 8px">אפשר לבחור את יום השנה הבא שלכם.</p>
<div class="row"><button style="flex:1">לחתום ולנעול 🔒</button><button type="button" class="ghost" data-act="bookedit" data-v="">ביטול</button></div></form></div>`; }
  const nextOpen = L.find(l => !letterOpen(l));
  return `<h3 class="sec">להשלים את הספר</h3><div class="card group">
<button class="mrow" data-act="bookedit" data-v="story"><span class="fi">💞</span><span class="mt"><b>איך הכל התחיל</b><span class="sub">ענית על ${mine.filter(Boolean).length} מתוך ${ORIGIN.length}${pt ? ' · ' + esc(realName(pt)) + ': ' + his.filter(Boolean).length : ''}</span></span><span class="chev">‹</span></button>
<button class="mrow" data-act="bookedit" data-v="letter"><span class="fi">💌</span><span class="mt"><b>מכתב לעתיד</b><span class="sub">${L.length ? L.length + ' מכתבים' + (nextOpen ? ' · הבא נפתח ב-' + heD(nextOpen.openOn) : '') : 'נעול עד תאריך שבוחרים'}</span></span><span class="chev">‹</span></button>
<button class="mrow" data-act="tab" data-t="notes"><span class="fi">📝</span><span class="mt"><b>מילים טובות</b><span class="sub">${marked ? marked + ' פתקים בספר' : 'מסמנים 📖 על פתק כדי להכניס אותו לספר'}</span></span><span class="chev">‹</span></button>
<button class="mrow" data-act="tab" data-t="q"><span class="fi">❓</span><span class="mt"><b>השאלות שלנו</b><span class="sub">${qm ? qm + ' שאלות נבחרו' : 'בינתיים נבחרות לבד. אפשר לסמן 📖 בשאלה'}</span></span><span class="chev">‹</span></button></div>
${L.length ? `<div class="list">${L.map(l => { const mineL = l.by === S.me, open = letterOpen(l); return `<div class="card letterc"><b>💌 ${mineL ? 'כתבתי ל' + esc(pt ? realName(pt) : '') : 'מ' + esc(realName(l.by))}</b><span class="sub">${open ? 'נפתח ב-' + heD(l.openOn) : 'ייפתח ב-' + heD(l.openOn) + ' · עוד ' + (dnum(l.openOn) - dnum(today())) + ' ימים'}</span>${open || mineL ? `<p style="white-space:pre-wrap;margin:8px 0 0">${esc(l.text || '')}</p>` : '<p class="sub" style="margin:8px 0 0">🔒 נעול עד אז</p>'}${mineL && !open ? `<div style="margin-top:8px">${delBtn(l.id)}</div>` : ''}</div>`; }).join('')}</div>` : ''}`;
}

V.book = () => {
  const k = bookKey(), th = BOOK_THEMES[k], pages = bookPages();
  const head = `<button class="back" data-act="tab" data-t="together">› חזרה</button><h1>ספר הזיכרונות 📖</h1>`;
  const book = `<div class="book" data-frame="${th.frame}" data-theme="${k}" style="--bp:${th.bg};--bi:${th.ink};--ba:${th.acc};--bs:${th.sub}">${pages.map(p => pageHTML(p, th)).join('')}</div>`;
  if (!isPremium()) return `${head}<p class="sub">כל הזיכרונות שלכם, עם התמונות, כספר שמדפדפים בו. 6 עיצובים, ואפשר להדפיס או להזמין בכריכה.</p><div class="bpeek">${book}</div>${lockCard('ספר הזיכרונות פתוח בפרימיום', 'עיצובים, דפדוף, PDF להדפסה וספר בכריכה')}`;
  return `${head}${book}<p class="hint center" style="margin-top:6px">${pages.length} עמודים · מחליקים הצידה כדי לדפדף</p>${bookTools()}
<h3 class="sec">העיצוב של הספר</h3><div class="bthemes">${Object.entries(BOOK_THEMES).map(([key, t]) => `<button class="btheme" data-act="booktheme" data-k="${key}" aria-pressed="${k === key}"><i style="background:${t.bg};color:${t.acc};border-color:${t.acc}">${t.orn}</i>${t.name}</button>`).join('')}</div>
<div class="card"><form data-form="booktitle"><label for="booktitle">שם הספר</label><div class="row"><input id="booktitle" maxlength="40" value="${esc(bookTitle())}" style="flex:1 1 180px"><button>שמירה</button></div></form><p class="hint" style="margin:6px 0 0">העיצוב והשם משותפים לשניכם.</p></div>
<h3 class="sec">להדפסה</h3><div class="card">
<b>PDF של הספר</b><p class="hint" style="margin:4px 0 10px">עמודים ריבועיים של 21×21 ס״מ, באיכות הדפסה. אפשר להדפיס בבית או לשמור.</p>
<button class="wide" data-act="bookpdf" ${S.pdfBusy ? 'disabled' : ''}>${S.pdfBusy ? esc(S.pdfBusy) : 'להכין PDF 🖨️'}</button>
<details id="d-bind" style="margin-top:12px"><summary><b>ספר מודפס בכריכה קשה</b></summary><ol class="hint" style="padding-inline-start:18px;margin:8px 0 0;line-height:1.7">
<li>מכינים כאן את ה-PDF.</li><li>נכנסים לאתר של שירות להדפסת אלבומים שמקבל קובץ PDF מוכן.</li><li>בוחרים אלבום ריבועי 21×21 (או 20×20) בכריכה קשה, ומעלים את הקובץ.</li></ol>
<p class="hint" style="margin:8px 0 0">בהמשך נוסיף הזמנה ישר מהאפליקציה.</p></details></div>`;
};

// ---- PDF: each page drawn on a canvas, then packed as JPEG pages into a small PDF ----
function makePDF(imgs, W) {
  const parts = [], xref = []; let off = 0;
  const push = b => { parts.push(b); off += b.length; }, T = s => te.encode(s);
  const obj = (n, body) => { xref[n] = off; push(T(n + ' 0 obj\n')); body.forEach(push); push(T('\nendobj\n')); };
  push(T('%PDF-1.4\n'));
  const n = imgs.length;
  obj(1, [T('<< /Type /Catalog /Pages 2 0 R >>')]);
  obj(2, [T(`<< /Type /Pages /Kids [${imgs.map((_, i) => (3 + 3 * i) + ' 0 R').join(' ')}] /Count ${n} >>`)]);
  imgs.forEach((im, i) => {
    const p = 3 + 3 * i, cs = `q ${W} 0 0 ${W} 0 0 cm /Im0 Do Q`;
    obj(p, [T(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${W}] /Resources << /XObject << /Im0 ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>`)]);
    obj(p + 1, [T(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`)]);
    obj(p + 2, [T(`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.b.length} >>\nstream\n`), im.b, T('\nendstream')]);
  });
  const total = 3 + 3 * n, xo = off; let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let i = 1; i < total; i++) x += String(xref[i]).padStart(10, '0') + ' 00000 n \n';
  push(T(x + `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xo}\n%%EOF\n`));
  return new Blob(parts, { type: 'application/pdf' });
}
const loadImg = u => new Promise(r => { if (!u) return r(null); const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = u; });
function wrapLines(ctx, text, maxW) {
  const out = [];
  for (const para of String(text).split('\n')) { let line = ''; for (const w of para.split(' ')) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } out.push(line); }
  return out;
}
async function drawPage(p, th, N) {
  const c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'), F = (s, w = 400) => `${w} ${s}px Heebo, Arial, sans-serif`;
  x.fillStyle = th.bg; x.fillRect(0, 0, N, N); x.direction = 'rtl';
  const M = N * .08, R = N - M, W = N - 2 * M, CX = N / 2;
  if (th.frame === 'border') { x.strokeStyle = th.acc; x.lineWidth = N * .003; x.strokeRect(N * .035, N * .035, N * .93, N * .93); x.strokeRect(N * .045, N * .045, N * .91, N * .91); }
  if (th.frame === 'gold') { x.strokeStyle = th.acc; x.lineWidth = N * .002; x.strokeRect(N * .04, N * .04, N * .92, N * .92); }
  const T = (s, px, y, { w = 400, color = th.ink, align = 'right', at, italic } = {}) => { x.font = (italic ? 'italic ' : '') + F(px, w); x.fillStyle = color; x.textAlign = align; x.fillText(s, align === 'center' ? CX : at ?? R, y); };
  // a wrapped paragraph; returns where it ended
  const para = (s, px, y, { maxW = W, maxY = N - M * 1.4, align = 'right', at, w = 400, color = th.ink, lh = 1.45 } = {}) => {
    x.font = F(px, w); const lines = wrapLines(x, s || '', maxW), max = Math.max(1, Math.floor((maxY - y) / (px * lh)) + 1);
    let out = lines.slice(0, max); if (lines.length > max) out[max - 1] = out[max - 1].replace(/\s*\S*$/, '') + '…';
    out.forEach((l, i) => T(l, px, y + i * px * lh, { w, color, align, at })); return y + out.length * px * lh;
  };
  const head = (l, r = th.orn) => { T(l, N * .03, M + N * .02, { w: 600, color: th.sub }); T(r, N * .035, M + N * .02, { color: th.acc, align: 'left', at: M }); };
  const foot = s => T(s, N * .025, N - M + N * .01, { color: th.sub, align: 'center' });
  const photo = async (ref, bx, by, bw, bh, tilt = 0, frame = th.frame) => {
    const im = await loadImg(await photoURL(ref)); x.save(); x.translate(bx + bw / 2, by + bh / 2); x.rotate(tilt); x.translate(-bw / 2, -bh / 2);
    let ix = 0, iy = 0, iw = bw, ih = bh;
    if (frame === 'polaroid') { x.shadowColor = 'rgba(0,0,0,.25)'; x.shadowBlur = N * .012; x.fillStyle = '#fff'; x.fillRect(0, 0, bw, bh); x.shadowBlur = 0; ix = iy = bw * .05; iw = bw * .9; ih = bh - bw * .05 - bh * .13; }
    if (frame === 'border') { x.fillStyle = '#fff'; x.fillRect(0, 0, bw, bh); ix = iy = N * .01; iw = bw - 2 * ix; ih = bh - 2 * iy; }
    x.beginPath(); if (frame === 'round') x.roundRect(ix, iy, iw, ih, N * .02); else x.rect(ix, iy, iw, ih); x.clip();
    if (im) { const s = Math.max(iw / im.width, ih / im.height), sw = iw / s, sh = ih / s; x.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, ix, iy, iw, ih); } else { x.fillStyle = 'rgba(0,0,0,.08)'; x.fill(); }
    x.restore();
    if (frame === 'gold') { x.strokeStyle = th.acc; x.lineWidth = N * .002; x.strokeRect(bx, by, bw, bh); }
  };
  const grid = async (ph, top, h) => {
    const g = N * .025, n = Math.min(ph.length, 4);
    const boxes = n === 1 ? [[0, 0, W, h]] : n === 2 ? [[0, 0, (W - g) / 2, h], [(W + g) / 2, 0, (W - g) / 2, h]] : n === 3 ? [[0, 0, (W - g) / 2, h], [(W + g) / 2, 0, (W - g) / 2, (h - g) / 2], [(W + g) / 2, (h + g) / 2, (W - g) / 2, (h - g) / 2]] : [0, 1, 2, 3].map(i => [(i % 2) * (W + g) / 2, Math.floor(i / 2) * (h + g) / 2, (W - g) / 2, (h - g) / 2]);
    for (let i = 0; i < n; i++) { const [bx, by, bw, bh] = boxes[i]; await photo(ph[i], R - bx - bw, top + by, bw, bh, th.frame === 'polaroid' ? (i % 2 ? .025 : -.02) : 0); }
  };
  const doodle = (sym, seed, n) => { x.save(); x.globalAlpha = .2; x.fillStyle = th.acc; x.textAlign = 'center'; for (const [dx, dy, z, r] of doodles(seed, n)) { x.save(); x.translate(dx * N, dy * N); x.rotate(r * Math.PI / 180); x.font = F(z * N); x.fillText(sym, 0, z * N * .35); x.restore(); } x.restore(); };
  const center = (title, sub, ico, y0 = N * .4) => { if (ico) T(ico, N * .09, y0 - N * .12, { align: 'center', color: th.acc }); const y = para(title, N * .07, y0, { align: 'center', w: 800, lh: 1.2 }); if (sub) T(sub, N * .035, y + N * .02, { align: 'center', color: th.sub }); return y; };
  switch (p.t) {
    case 'cover': {
      const ph = of('memory').filter(m => (m.photos || []).length).sort((a, b) => a.date.localeCompare(b.date))[0]?.photos[0];
      T(th.orn, N * .06, N * .2, { color: th.acc, align: 'center' });
      if (ph) { T(bookTitle(), N * .07, N * .33, { w: 800, align: 'center' }); await photo(ph, N * .27, N * .4, N * .46, N * .36, th.frame === 'polaroid' ? -.03 : 0); T(coupleNames(), N * .04, N * .84, { w: 600, align: 'center' }); if (S.couple?.start_date) T('מאז ' + heD(S.couple.start_date), N * .03, N * .9, { color: th.sub, align: 'center' }); }
      else { T(bookTitle(), N * .075, N * .48, { w: 800, align: 'center' }); T(coupleNames(), N * .04, N * .58, { w: 600, align: 'center' }); if (S.couple?.start_date) T('מאז ' + heD(S.couple.start_date), N * .03, N * .65, { color: th.sub, align: 'center' }); }
      break;
    }
    case 'opener': center(p.title, 'כל אחד מאיתנו, מהצד שלו', p.ico, N * .52); break;
    case 'chapter': {
      doodle(SEASON_DOODLE[p.s], p.no * 7, 9);
      T('פרק ' + p.no, N * .032, N * .24, { align: 'center', color: th.sub, w: 600 });
      let y = center(p.title, '', p.ico, N * .44);
      if (p.story) y = para(p.story, N * .033, y + N * .05, { align: 'center', maxW: W * .86, maxY: N * .8, lh: 1.55 });
      if (p.stats.length) T(p.stats.map(([v, l]) => v + ' ' + l).join('   ·   '), N * .028, Math.min(y + N * .05, N * .88), { align: 'center', color: th.acc, w: 600 });
      break;
    }
    case 'milestone': {
      doodle('✦', dnum(p.k) % 97, 10);
      T(heD(p.k), N * .03, N * .26, { align: 'center', color: th.sub, w: 600 });
      const y = center(p.title, '', p.ico, N * .5);
      if (p.stats.length) { T('עד היום הזה:', N * .03, y + N * .05, { align: 'center', color: th.sub }); T(p.stats.map(([v, l]) => v + ' ' + l).join('   ·   '), N * .03, y + N * .11, { align: 'center', color: th.acc, w: 600 }); }
      break;
    }
    case 'prose': {
      doodle(th.orn, 3, 6); head(p.label);
      let y = para(p.title, N * .06, N * .24, { w: 800, lh: 1.2 }) + N * .04;
      y = para(p.text, N * .038, y, { lh: 1.7, maxY: N * .7 }) + N * .03;
      for (const [u, t] of p.quotes) { y = para(`${realName(u)} ${G(u, 'זוכר', 'זוכרת')}: "${t}"`, N * .03, y, { color: th.sub, maxY: y + N * .1 }) + N * .02; }
      break;
    }
    case 'toc': {
      head('תוכן העניינים'); const fs = p.rows.length > 14 ? N * .028 : N * .036, gap = Math.min(fs * 1.9, (N * .78 - N * .2) / Math.max(1, p.rows.length));
      p.rows.forEach(([t, n], i) => { const y = N * .24 + i * gap; T(t, fs, y); T(String(n), fs, y, { color: th.acc, w: 800, align: 'left', at: M });
        x.font = F(fs); const tw = x.measureText(t).width; x.save(); x.strokeStyle = th.sub; x.globalAlpha = .5; x.setLineDash([N * .004, N * .008]); x.lineWidth = N * .0018; x.beginPath(); x.moveTo(R - tw - N * .015, y); x.lineTo(M + N * .05, y); x.stroke(); x.restore(); });
      break;
    }
    case 'epilogue': {
      doodle(th.orn, 11, 8); T(th.orn, N * .06, N * .26, { color: th.acc, align: 'center' });
      T('איפה אנחנו היום', N * .065, N * .38, { w: 800, align: 'center' });
      const y = para(p.text, N * .036, N * .48, { align: 'center', maxW: W * .86, lh: 1.6, maxY: N * .78 });
      T(p.n + ' רגעים בספר עד עכשיו · ועוד הרבה בדרך', N * .026, Math.min(y + N * .06, N * .88), { align: 'center', color: th.sub });
      break;
    }
    case 'qa': {
      head(p.label); let y = para(p.q, N * .048, N * .22, { w: 800, lh: 1.25, maxY: N * .34 }) + N * .04;
      x.strokeStyle = th.acc; x.globalAlpha = .4; x.lineWidth = N * .002; x.beginPath(); x.moveTo(CX, y); x.lineTo(CX, N - M * 1.5); x.stroke(); x.globalAlpha = 1;
      const cw = W / 2 - N * .035;
      T(realName(S.me), N * .034, y + N * .02, { w: 800, color: th.acc }); para(p.a || '…', N * .036, y + N * .085, { maxW: cw, maxY: N - M * 1.5 });
      T(pid() ? realName(pid()) : '', N * .034, y + N * .02, { w: 800, color: th.acc, at: CX - N * .035 }); para(p.b || '…', N * .036, y + N * .085, { maxW: cw, at: CX - N * .035, maxY: N - M * 1.5 });
      break;
    }
    case 'qa2': {
      head(p.label); let y = N * .2; const cw = W / 2 - N * .035, half = (N - M * 1.4 - y) / 2;
      for (const z of p.qs) {
        const yq = para(z.q, N * .04, y, { w: 800, lh: 1.25, maxY: y + N * .1 }) + N * .02;
        T(realName(S.me), N * .028, yq, { w: 800, color: th.acc }); para(z.a || '…', N * .029, yq + N * .05, { maxW: cw, maxY: y + half - N * .04 });
        T(pid() ? realName(pid()) : '', N * .028, yq, { w: 800, color: th.acc, at: CX - N * .035 }); para(z.b || '…', N * .029, yq + N * .05, { maxW: cw, at: CX - N * .035, maxY: y + half - N * .04 });
        y += half;
      }
      break;
    }
    case 'quotes': {
      head('מילים טובות'); let y = N * .26; const per = Math.min(N * .24, (N - M * 1.4 - y) / p.notes.length);
      for (const n of p.notes) { T('"', N * .08, y + N * .03, { color: th.acc, w: 800 }); const e = para(n.text, N * .036, y, { maxY: y + per - N * .09, at: R - N * .05, maxW: W - N * .05 }); T('— ' + realName(n.by) + ' · ' + heD(dayKey(n.at)), N * .026, e + N * .01, { color: th.sub, at: R - N * .05 }); y += per; }
      break;
    }
    case 'date': {
      const d = p.p, rv = Object.entries(d.review || {});
      head((dayLabel(d.date) ? dayLabel(d.date) + ' · ' : '') + 'דייט', d.surprise ? '🎁' : th.orn);
      let y = para(d.title || '', N * .055, N * .2, { w: 800, lh: 1.2, maxY: N * .28 }) + N * .02;
      if (p.ph.length) { await grid(p.ph, y, N * .38); y += N * .38 + N * .06; } else y += N * .04;
      for (const [u, r] of rv) { T(starsTxt(r.stars), N * .034, y, { color: th.acc }); T(realName(u) + ':', N * .03, y, { w: 800, at: R - N * .21 }); y = para(r.text || '', N * .03, y + N * .05, { maxY: y + N * .16 }) + N * .02; }
      foot((d.surprise && d.planner ? 'הפתעה של ' + realName(d.planner) + ' · ' : '') + (d.place || heD(d.date)));
      break;
    }
    case 'mem': {
      const m = p.m, ph = m.photos || [], adds = Object.entries(m.adds || {}).filter(([u, t]) => t && u !== m.by);
      const addLines = y => { for (const [u, t] of adds) { T(`"${t.slice(0, 90)}" · ${realName(u)}`, N * .027, y, { color: th.sub, italic: true, align: p.lay === 'quote' ? 'center' : 'right' }); y += N * .045; } };
      if (p.lay === 'hero') {
        await photo(ph[0], 0, 0, N, N, 0, 'square');
        const gr = x.createLinearGradient(0, N * .55, 0, N); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.72)'); x.fillStyle = gr; x.fillRect(0, N * .55, N, N * .45);
        x.font = F(N * .04, 600); const lines = wrapLines(x, m.text || '', W).slice(0, 3), base = N - M - N * .05 - adds.length * N * .045;
        lines.forEach((l, i) => T(l, N * .04, base - (lines.length - 1 - i) * N * .056, { w: 600, color: '#fff' }));
        adds.forEach(([u, t], i) => T(`"${t.slice(0, 90)}" · ${realName(u)}`, N * .027, base + N * .05 + i * N * .045, { color: 'rgba(255,255,255,.85)', italic: true }));
        T((dayLabel(m.date) ? dayLabel(m.date) + ' · ' : '') + heD(m.date) + (m.place ? ' · ' + m.place : ''), N * .025, N - M * .7, { color: 'rgba(255,255,255,.8)' });
        break;
      }
      head((dayLabel(m.date) ? dayLabel(m.date) + ' · ' : '') + monthYear(m.date));
      if (p.lay === 'quote') {
        x.font = F(N * .05); const lines = wrapLines(x, '"' + (m.text || '') + '"', W).slice(0, 9), y0 = N * .5 - lines.length * N * .05 * 1.45 / 2 + N * .02;
        lines.forEach((l, i) => T(l, N * .05, y0 + i * N * .05 * 1.45, { align: 'center' })); addLines(y0 + lines.length * N * .0725 + N * .02);
      } else {
        const h = p.lay === 'split' ? N * .46 : N * .5; await grid(ph, N * .15, h);
        const e = para(m.text || '', N * .034, N * .15 + h + N * .075, { maxY: N - M * 1.4 - adds.length * N * .045 }); addLines(e + N * .01);
      }
      foot(heD(m.date) + (m.place ? ' · ' + m.place : ''));
      break;
    }
    case 'stats': {
      T(p.ico, N * .07, N * .2, { align: 'center', color: th.acc }); T(p.title, N * .06, N * .3, { align: 'center', w: 800 });
      const cols = p.tiles.length > 4 ? 3 : 2, g = N * .03, tw = (W - g * (cols - 1)) / cols, th2 = N * .17, top = N * .4;
      p.tiles.forEach(([v, l], i) => {
        const cx = R - (i % cols) * (tw + g) - tw, cy = top + Math.floor(i / cols) * (th2 + g);
        x.fillStyle = th.acc; x.globalAlpha = .1; x.beginPath(); x.roundRect(cx, cy, tw, th2, N * .02); x.fill(); x.globalAlpha = 1;
      });
      p.tiles.forEach(([v, l], i) => { const cx = R - (i % cols) * (tw + g) - tw / 2, cy = top + Math.floor(i / cols) * (th2 + g); x.textAlign = 'center'; x.font = F(N * .058, 800); x.fillStyle = th.acc; x.fillText(String(v), cx, cy + th2 * .5); x.font = F(N * .026, 600); x.fillStyle = th.sub; x.fillText(l, cx, cy + th2 * .78); });
      break;
    }
    case 'letter': {
      const l = p.l, open = letterOpen(l), to = l.to || (l.by === S.me ? pid() : S.me);
      head('מכתב לעתיד', '💌'); T('ל' + realName(to) + ',', N * .045, N * .24, { w: 800 });
      if (open) { const e = para(l.text || '', N * .032, N * .32, { maxY: N - M * 2.2, lh: 1.6 }); T(realName(l.by), N * .04, Math.min(e + N * .04, N - M * 1.6), { w: 800, color: th.acc, align: 'left', at: M }); }
      else { T('🔒', N * .1, N * .55, { align: 'center' }); T('ייפתח ב-' + heD(l.openOn), N * .04, N * .65, { align: 'center', color: th.sub, w: 600 }); }
      foot('נכתב ב-' + heD(dayKey(l.at)) + ' · נפתח ב-' + heD(l.openOn));
      break;
    }
  }
  if (p.pno > 1 && p.lay !== 'hero') T(String(p.pno), N * .022, N - N * .035, { color: th.sub, align: 'left', at: N * .05 });
  return new Promise(r => c.toBlob(async b => r({ b: new Uint8Array(await b.arrayBuffer()), w: N, h: N }), 'image/jpeg', .9));
}

async function bookPDF() {
  const th = BOOK_THEMES[bookKey()], pages = bookPages(), imgs = [];
  try { await Promise.all(['400', '600', '800'].map(w => document.fonts.load(`${w} 40px Heebo`))); } catch (_) { }
  for (let i = 0; i < pages.length; i++) { S.pdfBusy = `מכין עמוד ${i + 1} מתוך ${pages.length}…`; render(); imgs.push(await drawPage(pages[i], th, 1240)); }
  S.pdfBusy = null; render();
  const blob = makePDF(imgs, 595.28), name = (bookTitle().replace(/[\\/:*?"<>|]/g, '') || 'ספר-הזיכרונות') + '.pdf', file = new File([blob], name, { type: 'application/pdf' });
  try { if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: bookTitle() }); return; } } catch (e) { if (e?.name === 'AbortError') return; }
  if (NATIVE) { // Android app: write the file, then open the share sheet (save to Drive/Files, WhatsApp, print…)
    const P = window.Capacitor?.Plugins;
    if (P?.Filesystem && P?.Share) {
      try {
        const b64 = toB(new Uint8Array(await blob.arrayBuffer()));
        const { uri } = await P.Filesystem.writeFile({ path: 'book-' + Date.now() + '.pdf', data: b64, directory: 'CACHE' });
        await P.Share.share({ title: bookTitle(), url: uri, dialogTitle: 'לשמור או לשלוח את הספר' });
      } catch (e) { if (!/cancel/i.test(String(e?.message || e))) { console.error(e); toast('לא הצלחתי לפתוח את השיתוף'); } }
      return;
    }
    toast('צריך לעדכן את האפליקציה כדי לשמור קבצים'); return;
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove(); toast('הקובץ ירד 🖨️');
}
// "today, a year ago" on the home screen
function onThisDay() {
  const t = today(), md = t.slice(5);
  return of('memory').filter(m => m.date && m.date.slice(5) === md && m.date < t).sort((a, b) => b.date.localeCompare(a.date))[0];
}

// ===== app lock: a 4-digit code on this device =====
const pinSaved = () => { try { return JSON.parse(ls.get('rak-pin') || 'null'); } catch (_) { return null; } };
async function pinHash(pin, salt) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pin)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
S.locked = !!(pinSaved() || ls.get('rak-bio')); try { S.bankSkip = JSON.parse(ls.get('rak-bankskip') || '[]'); } catch (_) { S.bankSkip = []; } S.pinBuf = ''; S.pinMode = null; S.pinTries = 0;

// ---- fingerprint / Face ID on top of the code (the code stays as the fallback) ----
const bioSaved = () => { try { return JSON.parse(ls.get('rak-bio') || 'null'); } catch (_) { return null; } };
const bioName = () => !NATIVE && isIOS ? 'Face ID' : 'טביעת אצבע';
async function bioAvailable() {
  const NB = window.Capacitor?.Plugins?.NativeBiometric;
  if (NATIVE) { if (!NB) return false; try { return !!(await NB.isAvailable()).isAvailable; } catch (_) { return false; } }
  try { return !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()); } catch (_) { return false; }
}
async function bioCheck(setup) {
  if (NATIVE) { await window.Capacitor.Plugins.NativeBiometric.verifyIdentity({ reason: 'כניסה לרק שלנו', title: 'רק שלנו', subtitle: 'טביעת אצבע כדי להיכנס', negativeButtonText: 'קוד' }); return { type: 'native' }; }
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  if (setup) {
    const c = await navigator.credentials.create({ publicKey: { challenge, rp: { name: 'רק שלנו' }, user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'רק שלנו', displayName: 'רק שלנו' }, pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }], authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' }, timeout: 60000 } });
    return { type: 'web', id: toB(new Uint8Array(c.rawId)) };
  }
  const s = bioSaved();
  await navigator.credentials.get({ publicKey: { challenge, allowCredentials: [{ type: 'public-key', id: fromB(s.id) }], userVerification: 'required', timeout: 60000 } });
  return s;
}
async function bioUnlock() {
  if (S.bioBusy) return; S.bioBusy = true;
  try { await bioCheck(false); S.locked = false; S.pinBuf = ''; S.pinMsg = ''; S.bioBusy = false; render(); showHello(); }
  catch (_) { S.bioBusy = false; S.pinMsg = 'לא זוהה. אפשר להקיש את הקוד'; render(); }
}
// the privacy policy, shown over the current screen
function privView() { return `<div class="privov" role="dialog" aria-label="מדיניות פרטיות"><button class="back" data-act="privclose">› חזרה</button><div class="privbody">${S.privHTML || '<p class="sub">טוען…</p>'}</div></div>`; }
async function openPrivacy() {
  S.priv = true; render();
  if (!S.privHTML) { try { const h = await (await fetch('privacy.html', { cache: 'no-cache' })).text(); S.privHTML = (h.match(/<main>([\s\S]*)<\/main>/) || [, ''])[1] || '<p>לא נטען, בדקו אינטרנט</p>'; } catch (_) { S.privHTML = '<p>לא נטען, בדקו אינטרנט</p>'; } render(); }
}
const lockMode = () => pinSaved() && bioSaved() ? 'both' : pinSaved() ? 'pin' : bioSaved() ? 'bio' : 'none';
const lockActive = () => (S.locked && ['app', 'welcome', 'wait'].includes(S.stage)) || !!S.pinMode;
function lockView() {
  const mode = S.pinMode || 'unlock';
  const title = { unlock: 'הקוד שלך', set1: 'בחרו קוד של 4 ספרות', set2: 'עוד פעם, לאישור', off: 'הקוד הנוכחי, לביטול הנעילה' }[mode];
  const f = mode === 'unlock' && face(), top = f ? faceTop(f, true) + `<p class="tag" style="margin:4px 0 0;color:var(--mut)">${greet()}${f.m[f.me]?.name ? ', ' + esc(f.m[f.me].name) : ''}</p>` : `<div style="color:var(--acc)">${logo(72)}</div>`;
  if (mode === 'unlock' && !pinSaved()) return `<div class="lockwrap" role="dialog" aria-label="נעילה">${top}<h2>רק שלנו נעולה</h2>
${S.pinMsg ? `<p class="err" style="text-align:center">${esc(S.pinMsg)}</p>` : '<p class="hint" style="min-height:18px"></p>'}<button class="biobig" data-act="biounlock"><span>👆</span>לפתוח עם ${bioName()}</button>
<button class="mini" style="margin-top:18px" data-act="pinforgot">להיכנס עם אימייל וסיסמה</button></div>`;
  return `<div class="lockwrap" role="dialog" aria-label="נעילה">${f ? faceTop(f, true) + `<p class="tag" style="margin:4px 0 0;color:var(--mut)">${greet()}${f.m[f.me]?.name ? ', ' + esc(f.m[f.me].name) : ''}</p>` : `<div style="color:var(--acc)">${logo(72)}</div>`}<h2>${title}</h2>
<div class="pindots ${S.pinShake ? 'shake' : ''}">${[0, 1, 2, 3].map(i => `<i class="${i < S.pinBuf.length ? 'on' : ''}"></i>`).join('')}</div>
${S.pinMsg ? `<p class="err" style="text-align:center">${esc(S.pinMsg)}</p>` : '<p class="hint" style="min-height:18px"></p>'}${mode === 'unlock' && bioSaved() ? `<button class="biob" data-act="biounlock">👆 ${bioName()}</button>` : ''}
<div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-act="pin" data-v="${n}">${n}</button>`).join('')}
${mode === 'unlock' ? '<button class="kp-s" data-act="pinforgot">שכחתי</button>' : '<button class="kp-s" data-act="pincancel">ביטול</button>'}<button data-act="pin" data-v="0">0</button><button class="kp-s" data-act="pinback" aria-label="מחיקה">⌫</button></div></div>`;
}
async function pinDigit(d) {
  if (S.pinBuf.length >= 4) return;
  S.pinBuf += d; S.pinMsg = ''; S.pinShake = false; render();
  if (S.pinBuf.length < 4) return;
  const pin = S.pinBuf, mode = S.pinMode || 'unlock'; S.pinBuf = '';
  if (mode === 'set1') { S.pinFirst = pin; S.pinMode = 'set2'; render(); return; }
  if (mode === 'set2') {
    if (pin !== S.pinFirst) { S.pinMode = 'set1'; S.pinMsg = 'הקודים לא תאמו, נסו שוב'; S.pinShake = true; render(); return; }
    const salt = Math.random().toString(36).slice(2); ls.set('rak-pin', JSON.stringify({ salt, hash: await pinHash(pin, salt) }));
    if (S.lockTarget === 'pin') ls.del('rak-bio'); S.lockTarget = null; S.pinMode = null; S.locked = false; render(); toast('הנעילה הופעלה 🔒'); return;
  }
  const saved = pinSaved(), ok = saved && (await pinHash(pin, saved.salt)) === saved.hash;
  if (!ok) { S.pinTries++; S.pinShake = true; S.pinMsg = S.pinTries >= 5 ? 'יותר מדי ניסיונות. אפשר ללחוץ "שכחתי"' : 'קוד לא נכון'; render(); return; }
  S.pinTries = 0;
  if (mode === 'off') { try { localStorage.removeItem('rak-pin'); localStorage.removeItem('rak-bio'); } catch (_) { } S.pinMode = null; render(); toast('הנעילה בוטלה'); return; }
  S.locked = false; render(); showHello();
}
// lock again after a minute in the background
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') hiddenAt = Date.now(); else if ((pinSaved() || bioSaved()) && hiddenAt && Date.now() - hiddenAt > 60000 && !picking) { S.locked = true; S.pinBuf = ''; render(); } });
// ===== end-to-end encryption =====
// Every word is sealed on the phone with a key that only the couple's approved devices hold.
// The server keeps dates, times, flags and ids (for reminders), never the text itself.
const E2E = !DEMO;
const KEEP = new Set(['date', 'time', 'day', 'status', 'planner', 'type', 'week', 'ideaId', 'sideBy', 'by', 'openOn', 'to', 'planId']);
const te = new TextEncoder(), td = new TextDecoder();
const toB = u => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const fromB = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const EC = { name: 'ECDH', namedCurve: 'P-256' };
const K = { ck: null, dev: null, state: E2E ? 'loading' : 'ready', rows: [], first: false };
const LOCKED = '🔒 נכתב לפני איפוס ההצפנה';
async function aesSeal(key, bytes) { const iv = crypto.getRandomValues(new Uint8Array(12)); return toB(iv) + ':' + toB(new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes))); }
async function aesOpen(key, s) { const [iv, c] = s.split(':'); return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB(iv) }, key, fromB(c))); }
const sealStr = async s => !E2E || !s ? s : 'e1:' + await aesSeal(K.ck, te.encode(s));
const openStr = async s => { if (typeof s !== 'string' || !s.startsWith('e1:')) return s; if (!K.ck) return LOCKED; try { return td.decode(await aesOpen(K.ck, s.slice(3))); } catch (_) { return LOCKED; } };
async function walk(v, k, f) {
  if (typeof v === 'string') return KEEP.has(k) ? v : f(v);
  if (Array.isArray(v)) return Promise.all(v.map(x => walk(x, k, f)));
  if (v && typeof v === 'object') { const o = {}; for (const [kk, x] of Object.entries(v)) o[kk] = await walk(x, kk, f); return o; }
  return v;
}
async function sealData(d) { if (!E2E) return d; if (!K.ck) throw new Error('no key'); return walk(d, '', sealStr); }
const openData = d => E2E ? walk(d, '', openStr) : d;
const openItem = async i => ({ ...i, data: await openData(i.data || {}) });
const isPlain = (v, k = '') => typeof v === 'string' ? !KEEP.has(k) && !!v && !v.startsWith('e1:') : Array.isArray(v) ? v.some(x => isPlain(x, k)) : v && typeof v === 'object' ? Object.entries(v).some(([kk, x]) => isPlain(x, kk)) : false;
async function openMembers(list) { for (const m of list) if (m.avatar?.startsWith('e1:')) { const a = await openStr(m.avatar); m.avatar = a === LOCKED ? null : a; } return list; }

// this device's key pair, kept on the phone per account
async function myDevice() {
  const k = 'rak-dev-' + S.me; let d = null; try { d = JSON.parse(ls.get(k) || 'null'); } catch (_) { }
  if (!d) { const kp = await crypto.subtle.generateKey(EC, true, ['deriveBits']); d = { id: crypto.randomUUID(), pub: await crypto.subtle.exportKey('jwk', kp.publicKey), priv: await crypto.subtle.exportKey('jwk', kp.privateKey) }; ls.set(k, JSON.stringify(d)); }
  d.key = await crypto.subtle.importKey('jwk', d.priv, EC, false, ['deriveBits']);
  return d;
}
const pubOnly = j => ({ kty: j.kty, crv: j.crv, x: j.x, y: j.y });
async function kek(pubJwk) {
  const pub = await crypto.subtle.importKey('jwk', pubOnly(pubJwk), EC, false, []);
  const bits = await crypto.subtle.deriveBits({ name: 'ECDH', public: pub }, K.dev.key, 256);
  const h = await crypto.subtle.importKey('raw', bits, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(16), info: te.encode('rak-shelanu wrap v1') }, h, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
const importCK = raw => crypto.subtle.importKey('raw', raw, 'AES-GCM', true, ['encrypt', 'decrypt']);
async function wrapFor(pubJwk) { return aesSeal(await kek(pubJwk), new Uint8Array(await crypto.subtle.exportKey('raw', K.ck))); }
// 5 symbols that both phones show for the same device, to make sure nobody slipped a fake one in
const FP = '🍎🍌🍇🍓🍒🍑🍍🥝🥥🥑🌽🥕🍄🌶️🍔🍕🌮🍩🍪🎂🍫🍿☕🍵🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐦🦄🐝🦋🐢🐙🐬🐳🌵🌲🌴🍀🌸🌻🌙⭐☀️🌈❄️🔥⚽🎈🎁'.match(/\p{Extended_Pictographic}️?/gu);
async function fingerprint(pub) { const h = new Uint8Array(await crypto.subtle.digest('SHA-256', te.encode(pub.x + '.' + pub.y))); return [0, 1, 2, 3, 4].map(i => FP[h[i] % FP.length]).join(' '); }
const devLabel = () => NATIVE ? 'אנדרואיד (אפליקציה)' : isIOS ? 'אייפון' : /android/i.test(navigator.userAgent) ? 'אנדרואיד (דפדפן)' : 'מחשב';

// one check at a time: several realtime events can land together
let keyJob = null;
function ensureKey() { return keyJob || (keyJob = ensureKeyNow().finally(() => { keyJob = null; })); }
async function ensureKeyNow() {
  if (!E2E || !S.couple) { K.state = 'ready'; return; }
  K.dev = K.dev && K.dev.uid === S.me ? K.dev : Object.assign(await myDevice(), { uid: S.me });
  const cid = S.couple.id;
  let { data: rows, error } = await sb.from('e2e_devices').select('*').eq('couple_id', cid);
  if (error) { K.state = 'error'; return; }
  let row = rows.find(r => r.id === K.dev.id);
  if (!row) {
    const ins = { id: K.dev.id, couple_id: cid, user_id: S.me, pub: pubOnly(K.dev.pub), label: devLabel() };
    const r = await sb.from('e2e_devices').insert(ins);
    if (r.error) { K.state = 'error'; return; }
    row = { ...ins, wrapped: null }; rows.push(row);
  }
  K.rows = rows; K.ck = null;
  if (row.wrapped) {
    try { K.ck = await importCK(await aesOpen(await kek(row.wrapper_pub), row.wrapped)); K.state = 'ready'; } catch (_) { K.state = 'pending'; }
  } else {
    const { data: ec } = await sb.from('e2e_couple').select('couple_id').eq('couple_id', cid).maybeSingle();
    if (!ec && !(await sb.from('e2e_couple').insert({ couple_id: cid, first_device: K.dev.id })).error) {
      K.ck = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
      const w = await wrapFor(K.dev.pub);
      await sb.from('e2e_devices').update({ wrapped: w, wrapper_pub: pubOnly(K.dev.pub) }).eq('id', K.dev.id);
      row.wrapped = w; K.state = 'ready'; K.first = true;
    } else K.state = 'pending';
  }
  K.fp = await fingerprint(K.dev.pub);
  for (const r of K.rows) r.fp = await fingerprint(r.pub);
}
const devRequests = () => K.state === 'ready' ? K.rows.filter(r => !r.wrapped && r.id !== K.dev?.id && !(S.devSkip || []).includes(r.id)) : [];
async function approveDevice(id) {
  const r = K.rows.find(x => x.id === id); if (!r || !K.ck) return;
  const w = await wrapFor(r.pub);
  if (await run(sb.from('e2e_devices').update({ wrapped: w, wrapper_pub: pubOnly(K.dev.pub) }).eq('id', id), 'המכשיר אושר 🔐')) { r.wrapped = w; render(); }
}
async function rejectDevice(id) { if (await run(sb.from('e2e_devices').delete().eq('id', id), 'הבקשה נחסמה')) { K.rows = K.rows.filter(x => x.id !== id); render(); } }
// older plain text from before encryption gets sealed once a key exists
async function sealOld(plain, plainAv) {
  if (!E2E || !K.ck || !plain) return;
  for (const it of S.items) if (plain.has(it.id) && !String(JSON.stringify(it.data)).includes('🔒')) { try { await sb.from('items').update({ data: await sealData(it.data) }).eq('id', it.id); } catch (_) { } }
  const me = S.members[S.me]; if (plainAv && me?.avatar) await sb.from('members').update({ avatar: await sealStr(me.avatar) }).eq('user_id', S.me);
}
// everything the server has, opened with the key we now hold
async function reopenAll() {
  const [m, it] = await Promise.all([sb.from('members').select('user_id,name,prefs,avatar').eq('couple_id', S.couple.id), sb.from('items').select('*').eq('couple_id', S.couple.id).order('created_at', { ascending: false }).limit(2000)]);
  if (m.data) S.members = Object.fromEntries((await openMembers(m.data)).map(x => [x.user_id, x]));
  if (it.data) S.items = await Promise.all(it.data.map(openItem));
}
let devT = null;
function onDevChange() { clearTimeout(devT); return new Promise(res => { devT = setTimeout(() => devChangeNow().then(res), 400); }); }
async function devChangeNow() {
  const was = K.state; await ensureKey();
  if (K.state === 'ready' && was !== 'ready') { await reopenAll(); toast('התוכן נפתח 🔐'); }
  render();
}
// recovery code: 20 letters, kept by the couple, seals a copy of the key on the server
const RC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => [...crypto.getRandomValues(new Uint8Array(20))].map(b => RC[b % 32]).join('').replace(/(.{4})(?=.)/g, '$1-');
async function codeKey(code, salt) {
  const base = await crypto.subtle.importKey('raw', te.encode(code.toUpperCase().replace(/[^A-Z0-9]/g, '')), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: fromB(salt), iterations: 310000 }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function makeBackup() {
  const code = newCode(), salt = toB(crypto.getRandomValues(new Uint8Array(16)));
  const backup = await aesSeal(await codeKey(code, salt), new Uint8Array(await crypto.subtle.exportKey('raw', K.ck)));
  return (await run(sb.from('e2e_couple').update({ backup, backup_salt: salt }).eq('couple_id', S.couple.id))) ? code : null;
}
async function restoreFromCode(code) {
  const { data: ec } = await sb.from('e2e_couple').select('backup,backup_salt').eq('couple_id', S.couple.id).maybeSingle();
  if (!ec?.backup) return 'לא נשמר קוד שחזור לזוג הזה';
  try { K.ck = await importCK(await aesOpen(await codeKey(code, ec.backup_salt), ec.backup)); } catch (_) { return 'הקוד לא נכון'; }
  await sb.from('e2e_devices').update({ wrapped: await wrapFor(K.dev.pub), wrapper_pub: pubOnly(K.dev.pub) }).eq('id', K.dev.id);
  return '';
}
// last resort when no approved device is left: a new key; older text stays locked
async function resetKeys() {
  await keyJob;
  await sb.from('e2e_devices').delete().eq('couple_id', S.couple.id);
  await sb.from('e2e_couple').delete().eq('couple_id', S.couple.id);
  ls.del('rak-dev-' + S.me); K.dev = null; K.ck = null;
  await ensureKey(); await reopenAll(); render();
}
const keyWait = () => E2E && S.couple && ['pending', 'error'].includes(K.state) && ['app', 'welcome', 'wait'].includes(S.stage);
function keyView() {
  const other = pid() ? esc(pName()) : '', mine = K.rows.some(r => r.user_id === S.me && r.wrapped);
  const how = mine && other ? `צריך לאשר מהאפליקציה של ${other}, או ממכשיר אחר שלך שכבר מחובר.` : mine ? 'צריך לאשר ממכשיר אחר שלך שכבר מחובר.' : other ? `${other} ${P('צריך', 'צריכה')} לפתוח את האפליקציה ולאשר.` : 'צריך לאשר ממכשיר שכבר מחובר.';
  return `<div class="lockwrap keyw" role="dialog" aria-label="אישור מכשיר"><div class="bigico">🔐</div><h2>${K.state === 'error' ? 'אין חיבור כרגע' : 'מחכים לאישור'}</h2>
${K.state === 'error' ? `<p class="hint center">בדקו אינטרנט ונסו שוב.</p><button data-act="keyretry">לנסות שוב</button>` : `<p class="center" style="margin:0;max-width:330px">כל מה שכתבתם מוצפן, ורק מכשירים שאושרו יכולים לקרוא אותו. כדי לפתוח כאן, ${how}</p>
<div class="card center" style="padding:14px 18px;margin:4px 0"><span class="sub">ודאו שאותם סמלים מופיעים שם</span><div class="fp">${esc(K.fp || '')}</div></div>
${S.keyMode === 'code' ? `<form data-form="rcode" class="keyform"><input id="rcode" dir="ltr" autocomplete="off" autocapitalize="characters" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX" maxlength="30"><button>פתיחה</button>${S.keyMsg ? `<p class="err">${esc(S.keyMsg)}</p>` : ''}</form>` : `<button class="ghost" data-act="keymode" data-v="code">יש לנו קוד שחזור</button>`}
${S.keyMode === 'reset' ? `<div class="card" style="max-width:340px"><b>אין אף מכשיר מאושר?</b><p class="hint" style="margin:6px 0 10px">אפשר להתחיל הצפנה חדשה. מה שנכתב עד עכשיו יישאר נעול לתמיד, ושני הצדדים יצטרכו לאשר מכשירים מחדש.</p><button class="danger" data-act="keyreset">להתחיל הצפנה חדשה</button> <button class="mini" data-act="keymode" data-v="">ביטול</button></div>` : `<button class="mini" data-act="keymode" data-v="reset">אין לנו אף מכשיר מאושר</button>`}`}
<button class="mini" data-act="logout">התנתקות</button></div>`;
}
function devReqView() {
  const r = devRequests()[0]; if (!r) return '';
  const self = r.user_id === S.me, who = self ? 'מכשיר חדש שלך' : `מכשיר חדש של ${esc(realName(r.user_id))}`;
  return `<div class="sheetbg"></div><div class="sheet" role="dialog" aria-label="בקשת אישור מכשיר"><i class="grab"></i><b style="font-size:20px">🔐 ${who}</b>
<p style="margin:0">${esc(r.label || '')} מבקש לפתוח את התוכן המוצפן שלכם. ${self ? 'אם זה אתה' : 'אם זה באמת ' + P('הוא', 'היא') + ''}, ודאו שאותם סמלים מופיעים שם:</p>
<div class="fp">${esc(r.fp || '')}</div>
<button class="wide" data-act="devok" data-id="${esc(r.id)}">לאשר</button>
<div class="row" style="flex-wrap:nowrap"><button class="ghost" style="flex:1" data-act="devlater" data-id="${esc(r.id)}">אחר כך</button><button class="ghost warn" style="flex:1" data-act="devno" data-id="${esc(r.id)}">לא מוכר, לחסום</button></div></div>`;
}
function e2eSheet() {
  if (S.sheet !== 'e2e') return '';
  const devs = K.rows.filter(r => r.wrapped);
  return `<div class="sheetbg" data-act="closesheet"></div><div class="sheet" role="dialog" aria-label="הצפנה"><i class="grab"></i><b style="font-size:20px">🔐 מוצפן מקצה לקצה</b>
<p class="hint" style="margin:0">הפתקים, התשובות, הזיכרונות והתמונות מוצפנים בטלפון לפני שהם יוצאים. גם מי שמנהל את השרת לא יכול לקרוא אותם. מה שכן נשמר גלוי: שמות, תאריכים ושעות (בשביל התזכורות).</p>
<b>מכשירים שאושרו</b>${devs.map(r => `<div class="mrow" style="padding:6px 0"><span class="mt"><b>${esc(realName(r.user_id))} · ${esc(r.label || '')}${r.id === K.dev?.id ? ' (זה)' : ''}</b><span class="sub">${esc(r.fp || '')}</span></span>${r.id !== K.dev?.id ? (S.arm === 'dev' + r.id ? `<button class="mini" data-act="devrm" data-id="${esc(r.id)}">בטוח?</button>` : `<button class="mini" data-act="arm" data-id="dev${esc(r.id)}">הסרה</button>`) : ''}</div>`).join('')}
<b>קוד שחזור</b>${S.newCode ? `<div class="card center"><div class="rcode" dir="ltr">${esc(S.newCode)}</div><p class="hint" style="margin:8px 0 0">כתבו אותו על דף או שמרו במקום פרטי. בלעדיו ובלי אף מכשיר מאושר, אין דרך לשחזר את התוכן. הקוד לא יוצג שוב.</p></div><button class="ghost" data-act="copyrc">העתקה</button>` : `<p class="hint" style="margin:0">אם תאבדו את כל הטלפונים, הקוד הזה מחזיר את הכל. ${S.hasBackup ? 'כבר יש לכם קוד. יצירת קוד חדש מבטלת את הישן.' : 'עוד לא יצרתם קוד.'}</p><button class="ghost" data-act="mkrc">${S.hasBackup ? 'ליצור קוד חדש' : 'ליצור קוד שחזור'}</button>`}
<button class="wide" data-act="closesheet">סגירה</button></div>`;
}

// ---- render, keeping whatever the person is typing ----
let lastOv = null;
function render() {
  const openD = [...document.querySelectorAll('details[id][open]')].map(d => d.id), v = $('#view'), act = document.activeElement, fid = act && act.id, sel = fid && act.selectionStart != null ? [act.selectionStart, act.selectionEnd] : null, vals = {};
  v.querySelectorAll('input[id],textarea[id]').forEach(e => { if (e.type === 'checkbox') vals[e.id] = e.checked; else if (e.type !== 'date' || e.dataset.touched) vals[e.id] = e.value; });
  const inApp = S.stage === 'app';
  document.body.dataset.stage = S.stage;
  $('#nav').hidden = !inApp;
  v.innerHTML = S.stage === 'focus' ? focusView() : S.stage === 'notify' ? notifyView() : S.stage === 'welcome' ? welcomeView() : S.stage === 'splash' ? splashView() : S.stage === 'intro' ? introView() : S.stage === 'auth' ? authView() : S.stage === 'pair' ? pairView() : S.stage === 'wait' ? waitView() : V[S.tab]();
  if (inApp) $('#nav').innerHTML = navHTML();
  let ov = document.getElementById('overlay'); if (!ov) { ov = document.createElement('div'); ov.id = 'overlay'; document.body.append(ov); }
  const ovHTML = lockActive() ? lockView() : S.priv ? privView() : S.hello && face() ? helloView(face()) : keyWait() ? keyView() : ['app', 'wait'].includes(S.stage) ? (devRequests().length ? devReqView() : inApp ? sheetView() + e2eSheet() + moodSheet() + cropView() : '') : '';
  if (lastOv !== ovHTML) { ov.innerHTML = ovHTML; lastOv = ovHTML; } // an unchanged overlay keeps its animations
  if (S.crop && !lockActive()) drawCrop();
  if (lockActive() && !S.pinMode) { if (!S.bioTried && NATIVE && bioSaved()?.type === 'native') { S.bioTried = true; setTimeout(bioUnlock, 350); } } else S.bioTried = false;
  openD.forEach(id => { const d = document.getElementById(id); if (d) d.open = true; });
  hydratePhotos();
  for (const [id, val] of Object.entries(vals)) { const e = document.getElementById(id); if (!e) continue; if (e.type === 'checkbox') e.checked = val; else { e.value = val; if (e.type === 'date') e.dataset.touched = 1; } }
  if (fid) { const e = document.getElementById(fid); if (e) { e.focus({ preventScroll: true }); if (sel && e.setSelectionRange) try { e.setSelectionRange(...sel); } catch (_) { } } }
}

// ---- data ----
let splashDone = false, pendingStage = null;
function setStage(st) { if (!splashDone) { pendingStage = st; return; } S.stage = st; render(); }
async function loadAll() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) { S.splashBtn = true; if (ls.get('rak-intro')) { S.authMode = 'in'; return setStage('auth'); } splashDone = true; if (S.stage === 'splash') render(); return; }
  S.me = user.id; S.myName = (user.user_metadata?.name || user.user_metadata?.full_name || S.myName || '').trim().split(/\s+/)[0].slice(0, 30);
  const { data: me } = await sb.from('members').select('couple_id').eq('user_id', S.me).maybeSingle();
  if (!me) return setStage(['focus', 'notify', 'pair'].includes(S.stage) ? S.stage : 'focus');
  const [c, m, it] = await Promise.all([
    sb.from('couples').select('*').eq('id', me.couple_id).single(),
    sb.from('members').select('user_id,name,prefs,avatar').eq('couple_id', me.couple_id),
    sb.from('items').select('*').eq('couple_id', me.couple_id).order('created_at', { ascending: false }).limit(2000)
  ]);
  if (c.error || m.error || it.error) { toast('בעיה בטעינה, בדקו אינטרנט'); return; }
  S.couple = c.data;
  await ensureKey();
  const plain = new Set(it.data.filter(i => isPlain(i.data)).map(i => i.id)), plainAv = (m.data.find(x => x.user_id === S.me)?.avatar || '').startsWith('data:');
  S.members = Object.fromEntries((await openMembers(m.data)).map(x => [x.user_id, x])); S.items = await Promise.all(it.data.map(openItem)); S.pref = { ...(S.members[S.me]?.prefs || {}) };
  saveFace(); subscribe(); sealOld(plain, plainAv);
  await checkPush();
  setStage(Object.keys(S.members).length < 2 && !ls.get('rak-solo') ? 'wait' : (S.stage === 'app' || ls.get('rak-welcome') === today()) ? 'app' : 'welcome');
  if (S.stage === 'app' && S.tab === 'notes') markSeen();
}
function subscribe() {
  if (channel) return;
  const f = 'couple_id=eq.' + S.couple.id;
  channel = sb.channel('couple-' + S.couple.id)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: f }, async p => {
      if (p.eventType === 'DELETE') S.items = S.items.filter(i => i.id !== p.old.id);
      else { const n = await openItem(p.new), i = S.items.findIndex(x => x.id === n.id); if (i >= 0) S.items[i] = n; else S.items.unshift(n); S.items.sort((a, b) => b.created_at.localeCompare(a.created_at)); }
      if (S.stage === 'app') render();
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'items' }, p => { const id = p.old?.id; if (id && S.items.some(i => i.id === id)) { S.items = S.items.filter(i => i.id !== id); if (S.stage === 'app') render(); } })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter: f }, () => refreshMeta())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'e2e_devices', filter: f }, () => onDevChange())
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'couples', filter: 'id=eq.' + S.couple.id }, p => { S.couple = { ...S.couple, ...p.new }; render(); })
    .subscribe();
}
async function refreshMeta() {
  const { data } = await sb.from('members').select('user_id,name,prefs,avatar').eq('couple_id', S.couple.id);
  if (!data) return;
  const sig = JSON.stringify(data.map(x => [x.user_id, x.name, x.prefs, (x.avatar || '').length]));
  const was = S.stage, next = data.length < 2 ? (['app', 'welcome'].includes(was) || ls.get('rak-solo') ? (was === 'wait' ? 'app' : was) : 'wait') : was === 'wait' ? 'app' : was;
  if (sig === S.memSig && next === was) return; // nothing new: don't redraw (keeps the screen calm)
  const hadTwo = Object.keys(S.members).length >= 2;
  S.memSig = sig; S.members = Object.fromEntries((await openMembers(data)).map(x => [x.user_id, x])); saveFace();
  S.stage = next;
  if (!hadTwo && data.length >= 2) toast(pName() + ' ' + P('הצטרף', 'הצטרפה') + '!');
  render();
}
async function markSeen() { for (const n of of('note').filter(n => n.by !== S.me && !n.seen)) await upd(n.id, { seen: true }); }

// ---- notifications ----
const b64 = s => { const p = '='.repeat((4 - s.length % 4) % 4), r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map(c => c.charCodeAt(0))); };
// Android app: notifications through Firebase (the web version uses web push)
const PN = () => NATIVE && window.Capacitor?.Plugins?.PushNotifications;
let pnReady = false;
async function registerNative() {
  const P = PN(); if (!P) return;
  if (!pnReady) {
    pnReady = true;
    P.addListener('registration', t => { if (t?.value && S.me) sb.from('push_subs').upsert({ endpoint: 'fcm:' + t.value, sub: { fcm: t.value }, user_id: S.me }).then(() => { }); });
    P.addListener('registrationError', e => console.error('push reg', e));
    P.addListener('pushNotificationReceived', n => { if (n?.title) toast(n.title); });
    P.addListener('pushNotificationActionPerformed', a => { const tab = a?.notification?.data?.tab; if (tab && S.stage === 'app' && VIEWS.includes(tab)) go(tab); });
  }
  await P.register();
}
async function checkPush() {
  if (NATIVE) {
    const P = PN(); if (!P) { S.push = 'native'; return; }
    try { const st = await P.checkPermissions(); if (st.receive === 'granted') { S.push = 'on'; registerNative(); } else S.push = st.receive === 'denied' ? 'denied' : 'off'; } catch (_) { S.push = 'off'; }
    return;
  }
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) { S.push = 'unsupported'; return; }
  if (Notification.permission === 'denied') { S.push = 'denied'; return; }
  try {
    const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((_, r) => setTimeout(r, 4000))]);
    const sub = await reg.pushManager.getSubscription();
    if (sub && Notification.permission === 'granted') { S.push = 'on'; await sb.from('push_subs').upsert({ endpoint: sub.endpoint, sub: sub.toJSON(), user_id: S.me }); }
    else S.push = 'off';
  } catch (_) { S.push = 'off'; }
}
async function enablePush() {
  if (NATIVE) {
    const P = PN(); if (!P) { toast('צריך לעדכן את האפליקציה'); return; }
    try { const st = await P.requestPermissions(); if (st.receive !== 'granted') { S.push = 'denied'; render(); toast('ההתראות חסומות בהגדרות הטלפון'); return; } await registerNative(); S.push = 'on'; render(); toast('ההתראות הופעלו'); } catch (e) { console.error(e); toast('לא הצלחתי להפעיל התראות'); }
    return;
  }
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { S.push = perm === 'denied' ? 'denied' : 'off'; render(); return; }
    const reg = await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID_PUBLIC) });
    const ok = await run(sb.from('push_subs').upsert({ endpoint: sub.endpoint, sub: sub.toJSON(), user_id: S.me }), 'ההתראות הופעלו');
    if (ok) { S.push = 'on'; render(); }
  } catch (e) { console.error(e); toast('לא הצלחתי להפעיל התראות'); }
}

// ---- events ----
function go(tab) { if (tab === 'together') { S.planView = null; S.planEdit = null; S.pf = null; } if (tab === 'games') { S.play = null; S.gview = null; } S.tab = tab; S.edit = null; history.replaceState(null, '', '#' + tab); render(); scrollTo(0, 0); if (tab === 'notes') markSeen(); }
async function signOutLocal() { if (channel) { sb.removeChannel(channel); channel = null; } await sb.auth.signOut(); S.items = []; S.members = {}; S.couple = null; S.memSig = null; try { localStorage.removeItem('rak-solo'); } catch (_) { } S.pairMode = null; S.pref = {}; S.myName = ''; S.authMode = 'in'; S.stage = 'auth'; K.ck = null; K.rows = []; K.state = E2E ? 'loading' : 'ready'; ls.del('rak-face'); render(); }
// one file input that lives outside the screen, so it survives re-renders while the gallery is open
const photoIn = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*', hidden: true });
document.body.append(photoIn);
let picking = false;
photoIn.addEventListener('change', async () => {
  const f = photoIn.files && photoIn.files[0]; picking = false; if (!f) return;
  await openCrop(f); photoIn.value = '';
});
document.addEventListener('input', e => { if (e.target.type === 'date') e.target.dataset.touched = 1; });
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act, id = b.dataset.id;
  if (a !== 'arm' && a !== 'del') S.arm = null;
  if (a === 'tab') return go(b.dataset.t);
  if (a === 'welcome') { ls.set('rak-welcome', today()); S.stage = 'app'; render(); scrollTo(0, 0); return; }
  if (a === 'gamenew') { const t = b.dataset.t; S.play = { type: t, mode: t === 'guess' ? 'answer' : null, qs: pick5(t === 'tot' ? TOT.length : GQ.length), answers: [], id: null }; render(); scrollTo(0, 0); return; }
  if (a === 'gameplay') { const g = games().find(x => x.id === id); if (!g) return; S.play = g.type === 'tot' ? { type: 'tot', qs: g.qs, answers: [], id } : { type: 'guess', mode: 'guess', about: g.by, qs: g.qs, answers: [], id }; render(); scrollTo(0, 0); return; }
  if (a === 'gameexit') { S.play = null; render(); return; }
  if (a === 'gameclose') { S.gview = null; render(); return; }
  if (a === 'gameopen') { S.gview = id; render(); scrollTo(0, 0); return; }
  if (a === 'gpick') {
    const pl = S.play; if (!pl) return; pl.answers.push(+b.dataset.v);
    if (pl.answers.length < 5) { render(); return; }
    S.play = null;
    if (pl.type === 'tot') {
      if (pl.id) { const g = games().find(x => x.id === pl.id); await upd(pl.id, { picks: { ...(g?.picks || {}), [S.me]: pl.answers } }); S.gview = pl.id; }
      else if (await add('game', { type: 'tot', qs: pl.qs, picks: { [S.me]: pl.answers } })) toast('נשלח! עכשיו תור ' + pName());
    } else if (pl.mode === 'answer') { if (await add('game', { type: 'guess', qs: pl.qs, answers: pl.answers })) toast(pName() + ' ' + P('יקבל', 'תקבל') + ' את השאלות'); }
    else { await upd(pl.id, { guesses: pl.answers }); S.gview = pl.id; }
    render(); scrollTo(0, 0); return;
  }
  if (a === 'chdone') { const wk = weekKey(), ch = challengeOf(wk); if (ch) await upd(ch.id, { done: { ...(ch.done || {}), [S.me]: true } }); else await add('game', { type: 'challenge', week: wk, text: weekChallenge(wk), done: { [S.me]: true } }); render(); return; }
  if ((a === 'newplan' || a === 'planidea') && !isPremium()) { go('premium'); return; }
  if (a === 'newplan' || a === 'planidea') { const idea = a === 'planidea' ? of('idea').find(i => i.id === id) || BANK.find(i => i.id === id) : null; S.tab = 'together'; S.sub = 'dates'; S.planView = null; S.pf = null; S.planEdit = idea ? { title: idea.text, ideaId: idea.bank ? null : idea.id } : {}; history.replaceState(null, '', '#together'); render(); scrollTo(0, 0); return; }
  if (a === 'openplan') { S.tab = 'together'; S.sub = 'dates'; S.planEdit = null; S.planView = id; S.pstar = 0; history.replaceState(null, '', '#together'); render(); scrollTo(0, 0); return; }
  if (a === 'closeplan') { const back = S.planEdit?.id; S.planEdit = null; S.pf = null; S.planView = back || null; render(); scrollTo(0, 0); return; }
  if (a === 'editplan') { S.planEdit = { id }; S.pf = null; render(); scrollTo(0, 0); return; }
  if (a === 'pfbudget') { S.pf.budget = +b.dataset.v; render(); return; }
  if (a === 'pfplanner') { S.pf.planner = b.dataset.v; if (S.pf.planner !== S.me) S.pf.surprise = false; render(); return; }
  if (a === 'pfsurprise') { S.pf.surprise = !S.pf.surprise; render(); return; }
  if (a === 'pstar') { S.pstar = +b.dataset.v; render(); return; }
  if (a === 'confirmplan') { const p = of('plan').find(x => x.id === id); if (p) upd(id, { confirmed: { ...(p.confirmed || {}), [S.me]: true } }, P('הוא', 'היא') + ' ' + P('יקבל', 'תקבל') + ' התראה ❤️'); return; }
  if (a === 'tick') { const p = of('plan').find(x => x.id === id); if (!p) return; const list = (p.checklist || []).map((c, i) => i === +b.dataset.i ? { ...c, done: !c.done, by: S.me } : c); upd(id, { checklist: list }); return; }
  if (a === 'cancelplan') { S.planView = null; S.arm = null; await del(id); toast('הדייט בוטל'); return; }
  if (a === 'markdone') { const p = of('plan').find(x => x.id === id); upd(id, { status: 'done' }); if (p?.ideaId) upd(p.ideaId, { done: true, doneAt: Date.now() }); return; }
  if (a === 'sub') { S.sub = b.dataset.s; render(); return; }
  if (a === 'plan2mem') { const p = of('plan').find(x => x.id === id); if (!p) return; S.memDraft = { text: 'דייט: ' + (p.title || ''), date: p.date, place: p.place || '', planId: p.id }; S.planView = null; S.sub = 'mem'; render(); scrollTo(0, 0); toast('הוסיפו תמונות ושמרו 📷'); return; }
  if (a === 'bookedit') { S.bookEdit = b.dataset.v || null; render(); return; }
  if (a === 'bookmark') { const n = of('note').find(x => x.id === id); if (n) await upd(id, { book: !n.book }, n.book ? 'יצא מהספר' : 'נכנס לספר 📖'); return; }
  if (a === 'bookq') { const d = b.dataset.d, l = of('answer').filter(x => x.day === d), on = l.some(x => x.book), mine = l.find(x => x.by === S.me) || l[0]; if (!mine) return; if (on) { for (const x of l.filter(x => x.book)) await upd(x.id, { book: false }); toast('יצא מהספר'); } else await upd(mine.id, { book: true }, 'נכנס לספר 📖'); return; }
  if (a === 'memphoto') { picking = true; memIn.click(); return; }
  if (a === 'memphrm') { (S.memPh || []).splice(+b.dataset.i, 1); render(); return; }
  if (a === 'booktheme') { await setBook({ theme: b.dataset.k }); render(); return; }
  if (a === 'bookpdf') { if (!S.pdfBusy) bookPDF().catch(e => { console.error(e); S.pdfBusy = null; render(); toast('משהו השתבש בהכנת הקובץ'); }); return; }
  if (a === 'otd') { if (isPremium()) go('book'); else { S.sub = 'mem'; go('together'); } return; }
  if (a === 'goto') { S.err = S.info = ''; if (b.dataset.m) S.authMode = b.dataset.m; if (b.dataset.s === 'intro') ls.set('rak-intro', '1'); if (b.dataset.s === 'notify') S.pref.other = (document.getElementById('fother')?.value || '').trim(); S.stage = b.dataset.s; render(); scrollTo(0, 0); return; }
  if (a === 'focus') { const v = b.dataset.v, f = S.pref.focus = S.pref.focus || []; if (f.includes(v)) f.splice(f.indexOf(v), 1); else if (f.length < 3) f.push(v); else toast('אפשר לבחור עד 3'); render(); return; }
  if (a === 'toggle') {
    const k = b.dataset.k, prefs = { ...myPrefs(), [k]: !prefOn(k) };
    S.members[S.me].prefs = prefs; render();
    await run(sb.from('members').update({ prefs }).eq('user_id', S.me)); return;
  }
  if (a === 'gender') {
    S.pref.g = b.dataset.v;
    if (S.stage === 'app' && S.members[S.me]) { const prefs = { ...(S.members[S.me].prefs || {}), g: S.pref.g }; S.members[S.me].prefs = prefs; render(); await run(sb.from('members').update({ prefs }).eq('user_id', S.me), 'נשמר'); return; }
    render(); return;
  }
  if (a === 'notify') { S.pref.notify = b.dataset.v; render(); return; }
  if (a === 'notifydone') { if (S.pref.notify === 'yes' && !NATIVE && !(isIOS && !standalone)) { if (DEMO) S.push = 'on'; else await enablePush(); } S.stage = 'pair'; render(); scrollTo(0, 0); return; }
  if (a === 'editfocus') { S.edit = 'focus'; S.pref = { ...(S.members[S.me]?.prefs || {}) }; render(); return; }
  if (a === 'savefocus') { const prefs = { ...(S.members[S.me]?.prefs || {}), focus: S.pref.focus || [] }; if (await run(sb.from('members').update({ prefs }).eq('user_id', S.me), 'נשמר')) S.members[S.me].prefs = prefs; S.edit = null; render(); return; }
  if (a === 'pairmode') { S.pairMode = b.dataset.m || null; S.err = ''; render(); return; }
  if (a === 'edit') { S.edit = b.dataset.e || null; render(); const inp = document.querySelector('#setname,#setstart'); inp?.focus(); return; }
  if (a === 'mode') { MODE = b.dataset.k; ls.set('rak-mode', MODE); applyTheme(S.theme); render(); return; }
  if (a === 'theme') { S.theme = b.dataset.k; ls.set('rak-theme', S.theme); applyTheme(S.theme); render(); return; }
  if (a === 'logo') { LOGO = b.dataset.k; ls.set('rak-logo', LOGO); render(); return; }
  if (a === 'arm') { S.arm = id; render(); return; }
  if (a === 'del') { S.arm = null; del(id); return; }
  if (a === 'delacct') {
    S.arm = null; b.disabled = true;
    // the last one out takes the couple's photos along (otherwise they stay for the partner's memories)
    if (S.couple && !pid()) try { await dropPhotos(of('memory').flatMap(m => m.photos || [])); } catch (_) { }
    const { error } = await sb.rpc('delete_my_account');
    if (error) { toast('המחיקה לא הצליחה, נסו שוב'); render(); return; }
    await signOutLocal(); toast('החשבון נמחק'); return;
  }
  if (a === 'google') {
    S.err = ''; b.disabled = true;
    if (NATIVE) { // Android: pick a Google account from the phone, no password
      const SL = window.Capacitor?.Plugins?.SocialLogin;
      if (!SL) { S.err = 'צריך לעדכן את האפליקציה בשביל כניסה עם Google'; render(); return; }
      try {
        await SL.initialize({ google: { webClientId: GOOGLE_WEB_CLIENT } });
        const raw = [...crypto.getRandomValues(new Uint8Array(24))].map(x => x.toString(16).padStart(2, '0')).join('');
        const hashed = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)))].map(x => x.toString(16).padStart(2, '0')).join('');
        const r = await SL.login({ provider: 'google', options: { nonce: hashed } }), tok = r?.result?.idToken;
        if (!tok) throw new Error('no token');
        const { error } = await sb.auth.signInWithIdToken({ provider: 'google', token: tok, nonce: raw });
        if (error) throw error;
        await loadAll();
      } catch (e) { console.error(e); if (!/cancel/i.test(String(e?.message || e))) S.err = 'הכניסה עם Google לא הצליחה, נסו שוב'; render(); }
      return;
    }
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
    if (error) { S.err = /not enabled|provider/i.test(error.message) ? 'הכניסה עם Google עוד לא הופעלה. בינתיים אפשר עם אימייל.' : 'הכניסה עם Google לא הצליחה, נסו שוב'; render(); return; }
    if (DEMO) loadAll();
    return;
  }
  if (a === 'authmode') { S.authMode = S.authMode === 'up' ? 'in' : 'up'; S.err = S.info = ''; render(); return; }
  if (a === 'logout') return signOutLocal();
  if (a === 'pin') { pinDigit(b.dataset.v); return; }
  if (a === 'pinback') { S.pinBuf = S.pinBuf.slice(0, -1); render(); return; }
  if (a === 'pincancel') { S.lockTarget = null; if (lockMode() === 'none') ls.del('rak-bio'); S.pinMode = null; S.pinBuf = ''; S.pinMsg = ''; render(); return; }
  if (a === 'pinforgot') { try { localStorage.removeItem('rak-pin'); localStorage.removeItem('rak-bio'); } catch (_) { } S.locked = false; S.pinBuf = ''; S.pinMsg = ''; await signOutLocal(); toast('הנעילה בוטלה. נכנסים שוב עם האימייל והסיסמה'); return; }
  if (a === 'biounlock') { bioUnlock(); return; }
  if (a === 'privacy') { e.preventDefault(); openPrivacy(); return; }
  if (a === 'privclose') { S.priv = false; render(); return; }
  if (a === 'lockmode') {
    const v = b.dataset.v, cur = lockMode(); if (v === cur) return;
    if (v === 'none') {
      if (pinSaved()) { S.lockTarget = null; S.pinMode = 'off'; S.pinBuf = ''; S.pinMsg = ''; render(); return; }
      try { await bioCheck(false); } catch (_) { toast('לא זוהה, הנעילה נשארה'); return; }
      ls.del('rak-bio'); toast('הנעילה בוטלה'); render(); return;
    }
    if ((v === 'bio' || v === 'both') && !bioSaved()) {
      if (!(await bioAvailable())) { toast(NATIVE && !window.Capacitor?.Plugins?.NativeBiometric ? 'צריך לעדכן את האפליקציה בשביל טביעת אצבע' : 'בטלפון הזה אין ' + bioName() + ' זמין'); return; }
      try { ls.set('rak-bio', JSON.stringify(await bioCheck(true))); } catch (_) { toast('לא הופעל. אפשר לנסות שוב'); return; }
    }
    if (v === 'bio') ls.del('rak-pin');
    if ((v === 'pin' || v === 'both') && !pinSaved()) { S.lockTarget = v; S.pinMode = 'set1'; S.pinBuf = ''; S.pinMsg = ''; S.pinFirst = ''; render(); return; }
    if (v === 'pin') ls.del('rak-bio');
    toast({ pin: 'נכנסים עם קוד 🔒', bio: 'נכנסים עם ' + bioName() + ' 👆', both: bioName() + ', והקוד לגיבוי 🔒' }[v]); render(); return;
  }
  if (a === 'bioset') {
    if (bioSaved()) { ls.del('rak-bio'); toast(bioName() + ' כובה'); render(); return; }
    if (!(await bioAvailable())) { toast(NATIVE && !window.Capacitor?.Plugins?.NativeBiometric ? 'צריך לעדכן את האפליקציה בשביל טביעת אצבע' : 'בטלפון הזה אין ' + bioName() + ' זמין'); return; }
    try { ls.set('rak-bio', JSON.stringify(await bioCheck(true))); toast('מעכשיו נכנסים גם עם ' + bioName() + ' 👆'); } catch (_) { toast('לא הופעל. אפשר לנסות שוב'); }
    render(); return;
  }
  if (a === 'pinset') { S.pinMode = pinSaved() ? 'off' : 'set1'; S.pinBuf = ''; S.pinMsg = ''; S.pinFirst = ''; render(); return; }
  if (a === 'avsheet') { S.sheet = 'avatar'; S.sheetMode = null; render(); return; }
  if (a === 'closesheet') { S.sheet = null; S.sheetMode = null; S.newCode = null; S.moodPick = null; render(); return; }
  if (a === 'moodsheet') { S.sheet = 'mood'; S.moodPick = null; render(); return; }
  if (a === 'moodpick') { S.moodPick = b.dataset.k; render(); return; }
  if (a === 'moodsave') { const m = S.moodPick || moodOf(S.me)?.m, t = (document.getElementById('moodtxt')?.value || '').trim(); if (!m) return; S.sheet = null; S.moodPick = null; render(); if (await add('mood', { m, text: t })) toast(pid() ? pName() + ' ' + P('יראה', 'תראה') + ' את המנורה שלך 🏮' : 'עודכן 🏮'); return; }
  if (a === 'moodhug') { if (await add('note', { text: '🤗 ראיתי שהיום פחות קל לך. ' + M('שולח', 'שולחת') + ' לך חיבוק גדול, ואני כאן', seen: false })) toast('החיבוק נשלח 🤗'); return; }
  if (a === 'e2esheet') { S.sheet = 'e2e'; S.newCode = null; render(); const { data } = await sb.from('e2e_couple').select('backup').eq('couple_id', S.couple.id).maybeSingle(); S.hasBackup = !!data?.backup; render(); return; }
  if (a === 'mkrc') { const c = await makeBackup(); if (c) { S.newCode = c; S.hasBackup = true; render(); } return; }
  if (a === 'copyrc') { try { await navigator.clipboard.writeText(S.newCode); toast('הועתק. שמרו במקום פרטי'); } catch (_) { toast('אפשר לסמן ולהעתיק ידנית'); } return; }
  if (a === 'devok') { await approveDevice(b.dataset.id); return; }
  if (a === 'devno') { await rejectDevice(b.dataset.id); return; }
  if (a === 'devlater') { (S.devSkip ||= []).push(b.dataset.id); render(); return; }
  if (a === 'devrm') { S.arm = null; await rejectDevice(b.dataset.id); return; }
  if (a === 'keymode') { S.keyMode = b.dataset.v || null; S.keyMsg = ''; render(); return; }
  if (a === 'keyretry') { await onDevChange(); return; }
  if (a === 'keyreset') { S.keyMode = null; await resetKeys(); toast('התחלתם הצפנה חדשה'); return; }
  if (a === 'emojimode') { S.sheetMode = 'emoji'; render(); return; }
  if (a === 'recrop') { const u = S.members[S.me]?.avatar; if (u) openCrop(u); return; }
  if (a === 'cropsave') { saveCrop(); return; }
  if (a === 'cropcancel') { S.crop = null; cropImg = null; render(); return; }
  if (a === 'rmavatar') { const me = S.members[S.me], prefs = { ...(me.prefs || {}), av: null }; me.prefs = prefs; me.avatar = null; S.sheet = null; render(); await run(sb.from('members').update({ prefs, avatar: null }).eq('user_id', S.me), 'הוסר'); return; }
  if (a === 'clearnick') { const me = S.members[S.me], prefs = { ...(me.prefs || {}), nickFor: '' }; me.prefs = prefs; render(); await run(sb.from('members').update({ prefs }).eq('user_id', S.me), 'הכינוי הוסר'); return; }
  if (a === 'pickphoto') { S.sheet = null; render(); picking = true; setTimeout(() => { picking = false; }, 120000); photoIn.click(); return; }
  if (a === 'rmphoto') { if (await run(sb.from('members').update({ avatar: null }).eq('user_id', S.me), 'התמונה הוסרה')) { S.members[S.me].avatar = null; render(); } return; }
  if (a === 'avemo' || a === 'avcol' || a === 'avclear') {
    const me = S.members[S.me], cur = me.prefs?.av || {};
    const av = a === 'avclear' ? null : { e: a === 'avemo' ? b.dataset.v : (cur.e || EMO[0]), c: a === 'avcol' ? b.dataset.v : (cur.c || avColor(S.me)) };
    const prefs = { ...(me.prefs || {}), av }; me.prefs = prefs; const hadPhoto = !!me.avatar; me.avatar = null; render();
    await run(sb.from('members').update(hadPhoto ? { prefs, avatar: null } : { prefs }).eq('user_id', S.me)); return;
  }
  if (a === 'solo') { ls.set('rak-solo', '1'); S.stage = 'app'; render(); scrollTo(0, 0); return; }
  if (a === 'copycode') { try { await navigator.clipboard.writeText(S.couple.code); toast('הקוד הועתק'); } catch (_) { toast('הקוד: ' + S.couple.code); } return; }
  if (a === 'push') return enablePush();
  if (a === 'hugback') upd(id, { ack: true }, 'החיבוק נשלח');
  if (a === 'draw') {
    const src = S.jarSrc || 'all', I = of('idea'), open = I.filter(i => !i.done), ours = new Set(I.map(i => i.text.trim()));
    const all = [...(src !== 'bank' ? open : []), ...(src !== 'ours' ? BANK.filter(x => !ours.has(x.text) && !(S.bankSkip || []).includes(x.id)) : [])];
    const o = all.filter(i => i.id !== S.drawn), p = o.length ? o : all; S.drawn = p.length ? p[Math.floor(Math.random() * p.length)].id : null; render(); return;
  }
  if (a === 'jarsrc') { S.jarSrc = b.dataset.v; S.drawn = null; render(); return; }
  if (a === 'bankskip') { (S.bankSkip ||= []).push(id); try { ls.set('rak-bankskip', JSON.stringify(S.bankSkip)); } catch (_) { } S.drawn = null; render(); return; }
  if (a === 'bankadd') { const x = BANK.find(z => z.id === id); if (x && await add('idea', { text: x.text, done: false })) { toast('נכנס לצנצנת 🫙'); if (S.drawn === id) S.drawn = null; } return; }
  if (a === 'sendidea') { const x = BANK.find(z => z.id === id) || of('idea').find(z => z.id === id); if (x && await add('note', { text: '🎲 הגרלתי לנו דייט: ' + x.text + '\nמה ' + P('אומר', 'אומרת') + '?', seen: false })) toast('נשלח ל' + pName() + ' 💌'); return; }
  if (a === 'ideadone') { S.drawn = null; upd(id, { done: true, doneAt: Date.now() }, 'איזה כיף!'); }
  if (a === 'ideaback') upd(id, { done: false });
  if (a === 'if') { S.issueF = b.dataset.f; render(); }
  if (a === 'heard') upd(id, { status: 'heard' });
  if (a === 'talked') upd(id, { status: 'talked' });
  if (a === 'reopen') upd(id, { status: 'talked' });
});
const AUTH_ERR = { 'Invalid login credentials': 'אימייל או סיסמה לא נכונים', 'Email not confirmed': 'צריך קודם לאשר את המייל (בדקו גם בספאם)', 'User already registered': 'כבר יש חשבון עם המייל הזה. נסו להיכנס' };
const PAIR_ERR = { 'too many tries': 'יותר מדי ניסיונות. נסו שוב בעוד שעה', 'bad code': 'הקוד לא נכון', 'couple full': 'במקום הזה כבר יש שניים', 'already in a couple': 'כבר הצטרפת לזוג' };
document.addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target, k = f.dataset.form, val = id => (document.getElementById(id)?.value || '').trim(), clear = (...ids) => ids.forEach(i => { const x = document.getElementById(i); if (x) { x.value = ''; delete x.dataset.touched; } });
  const btn = f.querySelector('button:not([type=button])'); if (btn) btn.disabled = true;
  try {
    if (k === 'auth') {
      S.err = S.info = ''; const email = val('em'), password = document.getElementById('pw').value;
      if (S.authMode === 'up') S.myName = val('nm');
      const r = S.authMode === 'up' ? await sb.auth.signUp({ email, password, options: { emailRedirectTo: NATIVE ? undefined : location.origin + location.pathname, data: { name: S.myName } } }) : await sb.auth.signInWithPassword({ email, password });
      if (r.error) S.err = AUTH_ERR[r.error.message] || r.error.message;
      else if (!r.data.session) { S.info = 'שלחנו לך מייל אישור. לוחצים על הקישור במייל, חוזרים לכאן ונכנסים.'; S.authMode = 'in'; }
      else return loadAll();
      render(); return;
    }
    if (k === 'create' || k === 'join') {
      S.err = ''; const name = S.myName || val(k === 'create' ? 'cname' : 'jname');
      const { data, error } = k === 'create' ? await sb.rpc('create_couple', { p_name: name, p_start: val('cstart') || null }) : await sb.rpc('join_couple', { p_code: val('jcode'), p_name: name });
      const bad = error ? error.message : (k === 'join' && data !== 'ok' ? String(data) : null);
      if (bad) { S.err = PAIR_ERR[bad] || 'משהו השתבש, נסו שוב'; render(); return; }
      const prefs = { g: S.pref.g || null, focus: S.pref.focus || [], other: S.pref.other || '', notify: S.pref.notify || 'no', preview: false, remind: true };
      await sb.from('members').update({ prefs }).eq('user_id', S.me);
      return loadAll();
    }
    if (k === 'setnick') { const n = val('setnick'), me = S.members[S.me], prefs = { ...(me.prefs || {}), nickFor: n }; me.prefs = prefs; render(); await run(sb.from('members').update({ prefs }).eq('user_id', S.me), n ? 'הכינוי נשמר 💕' : 'נשמר'); return; }
    if (k === 'setname') { const n = val('setname'); if (n && n !== S.members[S.me]?.name && await run(sb.from('members').update({ name: n }).eq('user_id', S.me), 'נשמר')) S.members[S.me].name = n; S.edit = null; render(); return; }
    if (k === 'setstart') { const s = val('setstart'); if (s !== (S.couple.start_date || '') && await run(sb.from('couples').update({ start_date: s || null }).eq('id', S.couple.id), 'נשמר')) S.couple.start_date = s || null; S.edit = null; render(); return; }
    if (k === 'rcode') { const c = val('rcode'); if (!c) return; S.keyMsg = 'בודקים…'; render(); const e = await restoreFromCode(c); S.keyMsg = e; if (!e) { S.keyMode = null; await onDevChange(); } else render(); return; }
    if (k === 'hug') { const t = val('hugtxt'); clear('hugtxt'); if (await add('hug', { text: t, ack: false })) toast('שלחת. ' + pName() + ' ' + P('יקבל', 'תקבל') + ' התראה'); return; }
    if (k === 'note') { const t = val('notetxt'); if (!t) return; clear('notetxt'); add('note', { text: t, seen: false }); return; }
    if (k === 'idea') { const t = val('ideatxt'); if (!t) return; clear('ideatxt'); add('idea', { text: t, done: false }); return; }
    if (k === 'event') { const t = val('evtitle'), d = val('evdate'), y = document.getElementById('evyear').checked; if (!t || !d) return; clear('evtitle', 'evdate'); document.getElementById('evyear').checked = false; add('event', { title: t, date: d, yearly: y }); return; }
    if (k === 'answer') { const t = val('anstxt'), d = today(); if (!t || of('answer').some(a => a.day === d && a.by === S.me)) return; clear('anstxt'); add('answer', { day: d, text: t, qt: (S.items.find(i => i.kind === 'answer' && i.data?.day === d && i.data?.qt)?.data.qt) || qFor(d) }); return; }
    if (k === 'issue') { const w = val('iswhat'); if (!w) return; const o = { what: w, feel: val('isfeel'), want: val('iswant'), status: 'new' }; clear('iswhat', 'isfeel', 'iswant'); S.issueF = 'open'; document.getElementById('d-newissue')?.removeAttribute('open'); if (await add('issue', o)) toast('הועלה. ' + pName() + ' ' + P('יקבל', 'תקבל') + ' התראה'); return; }
    if (k === 'side') { const id = f.dataset.id, t = val('side-' + id); if (!t) return; upd(id, { side: t, sideBy: S.me }); return; }
    if (k === 'solve') { const id = f.dataset.id, t = val('res-' + id); if (!t) return; upd(id, { status: 'solved', res: t, solvedAt: Date.now() }, 'כל הכבוד לשניכם'); return; }
    if (k === 'plan') {
      const e = S.planEdit || {}, data = { title: val('pltitle'), date: val('pldate'), time: val('pltime'), place: val('plplace'), budget: S.pf.budget, planner: S.pf.planner, surprise: S.pf.planner === S.me && S.pf.surprise, wear: S.pf.surprise ? val('plwear') : '' };
      if (!data.title || !data.date) return;
      if (e.id) { await upd(e.id, data, 'נשמר'); S.planEdit = null; S.pf = null; S.planView = e.id; render(); return; }
      const ok = await add('plan', { ...data, ideaId: e.ideaId || null, checklist: [], confirmed: {}, status: 'planned', review: {} });
      if (ok) { S.planEdit = null; S.pf = null; S.drawn = null; toast(pid() ? pName() + ' ' + P('יקבל', 'תקבל') + ' התראה' : 'נקבע!'); render(); scrollTo(0, 0); }
      return;
    }
    if (k === 'addcheck') { const id = f.dataset.id, t = val('chk-' + id), p = of('plan').find(x => x.id === id); if (!t || !p) return; clear('chk-' + id); upd(id, { checklist: [...(p.checklist || []), { t, done: false, by: S.me }] }); return; }
    if (k === 'review') {
      const id = f.dataset.id, p = of('plan').find(x => x.id === id); if (!p) return;
      if (!S.pstar) { toast('בחרו כמה כוכבים'); return; }
      const t = val('rv-' + id), first = !Object.keys(p.review || {}).length;
      await upd(id, { review: { ...(p.review || {}), [S.me]: { stars: S.pstar, text: t } }, status: 'done' }, 'נשמר בזיכרונות');
      if (first) await add('memory', { text: 'דייט: ' + (p.title || '') + (t ? ' – ' + t : ''), date: p.date });
      if (p.ideaId) upd(p.ideaId, { done: true, doneAt: Date.now() });
      S.pstar = 0; render(); return;
    }
    if (k === 'mem') {
      const t = val('memtxt'), d = val('memdate'), pl = val('memplace'), files = S.memPh || [];
      if ((!t && !files.length) || !d) { if (!t && !files.length) toast('כתבו משהו או הוסיפו תמונה'); return; }
      if (E2E && !K.ck) return NOKEY();
      S.memBusy = true; render(); const refs = [];
      try { for (const p of files) refs.push(await putPhoto(p.f)); }
      catch (e) { console.error(e); S.memBusy = false; await dropPhotos(refs); render(); toast('התמונה לא עלתה, בדקו אינטרנט ונסו שוב'); return; }
      const ok = await add('memory', { text: t, date: d, place: pl, photos: refs, ...(S.memDraft?.planId ? { planId: S.memDraft.planId } : {}) });
      S.memBusy = false; if (ok) { clear('memtxt', 'memplace'); S.memPh = []; S.memDraft = null; toast('נשמר בזיכרונות 📖'); } else await dropPhotos(refs);
      render(); return;
    }
    if (k === 'memadd') { const id = f.dataset.id, t = val('ma-' + id), m = of('memory').find(x => x.id === id); if (!t || !m) return; upd(id, { adds: { ...(m.adds || {}), [S.me]: t } }, 'נוסף לזיכרון 💕'); return; }
    if (k === 'story') { const a = ORIGIN.map((_, i) => val('og' + i)), it = storyOf(S.me); if (it ? await upd(it.id, { a }) : await add('story', { a })) { S.bookEdit = null; toast('נשמר בספר 💞'); render(); } return; }
    if (k === 'letter') { const t = val('lettxt'), d = val('letdate'); if (!t || !d || d <= today()) { if (d && d <= today()) toast('בוחרים תאריך עתידי'); return; } if (await add('letter', { text: t, openOn: d, to: pid() || null })) { S.bookEdit = null; toast('המכתב נחתם ונעול עד ' + heD(d) + ' 💌'); render(); } return; }
    if (k === 'booktitle') { const t = val('booktitle') || 'הסיפור שלנו'; if (t !== bookTitle()) { await setBook({ title: t }); toast('נשמר'); } return; }
  } finally { if (btn && btn.isConnected) btn.disabled = false; }
});

// Opening from a notification jumps to the right tab
navigator.serviceWorker?.addEventListener('message', e => { if (e.data?.tab && S.stage === 'app') go(e.data.tab); });
addEventListener('hashchange', () => { const t = location.hash.slice(1); if (S.stage === 'app' && VIEWS.includes(t) && t !== S.tab) go(t); });
// Coming back to the app: catch up on anything missed while it slept
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.me && S.stage === 'app' && !picking) { if (channel) { sb.removeChannel(channel); channel = null; } loadAll(); } });
// while waiting for the partner, don't rely on realtime alone
setInterval(() => { if (S.couple && (S.stage === 'wait' || (S.stage === 'app' && !pid()))) refreshMeta(); }, 5000);
sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT' && S.stage === 'app') { S.stage = 'auth'; render(); } });

if (!NATIVE && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(console.error);
render();
setTimeout(() => { splashDone = true; if (pendingStage) { S.stage = pendingStage; render(); } }, 1400);
loadAll();

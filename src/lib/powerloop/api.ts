// Storage
export const store = {
  get: (k: string) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
  set: (k: string, v: any) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k: string) => localStorage.removeItem(k),
};

// Local DB
export const DB = {
  users: { get: () => store.get('pl_db_usr') || [], save: (v: any) => store.set('pl_db_usr', v) },
  otps: { get: () => store.get('pl_db_otp') || {}, save: (v: any) => store.set('pl_db_otp', v) },
  hist: { get: (uid: string) => store.get('pl_hist_' + uid) || [], save: (uid: string, v: any) => store.set('pl_hist_' + uid, v) },
};

function mkToken(uid: string) { return btoa(JSON.stringify({ uid, exp: Date.now() + 30 * 24 * 3600000 })); }

export function chkToken(tok: string) {
  try {
    const p = JSON.parse(atob(tok));
    if (p.exp < Date.now()) throw new Error('expired');
    return p;
  } catch {
    throw new Error('Session expired — please log in again');
  }
}

// Local API
export async function callApi(path: string, method?: string, body?: any, token?: string): Promise<any> {
  await new Promise(r => setTimeout(r, 340));
  method = method || 'GET';

  if (path === '/auth/send-otp') {
    const ph = (body.phone || '').trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otps = DB.otps.get();
    otps[ph] = { otp, exp: Date.now() + 300000 };
    DB.otps.save(otps);
    return { dev_otp: otp, message: 'OTP sent' };
  }

  if (path === '/auth/verify-otp') {
    const { phone: ph, otp } = body;
    const otps = DB.otps.get();
    const e = otps[ph];
    if (!e || e.exp < Date.now()) { if (e) { delete otps[ph]; DB.otps.save(otps); } throw new Error('OTP expired — request a new one'); }
    if (e.otp !== otp) throw new Error('Invalid OTP — please try again');
    delete otps[ph]; DB.otps.save(otps);
    const users = DB.users.get();
    const u = users.find((x: any) => x.phone === ph);
    if (u) return { status: 'LOGIN', token: mkToken(u.id), user: u };
    return { status: 'NEW_USER', verify_token: btoa(JSON.stringify({ phone: ph, exp: Date.now() + 600000 })) };
  }

  if (path === '/auth/register') {
    const { verify_token: vt, name, email } = body;
    let v: any;
    try { v = JSON.parse(atob(vt)); } catch { throw new Error('Invalid token'); }
    if (v.exp < Date.now()) throw new Error('Session expired');
    const users = DB.users.get();
    const nu = { id: 'u' + Date.now(), name, phone: v.phone, email: email || '', avatar_url: null, created_at: new Date().toISOString() };
    users.push(nu); DB.users.save(users);
    return { token: mkToken(nu.id), user: nu };
  }

  if (path === '/auth/google') throw new Error('Google Sign-In is not available in offline mode — please use Mobile OTP.');

  if (path === '/profile' && method === 'GET') {
    const p = chkToken(token!);
    const u = DB.users.get().find((x: any) => x.id === p.uid);
    if (!u) throw new Error('User not found');
    return u;
  }

  if (path === '/profile' && method === 'PUT') {
    const p = chkToken(token!);
    const arr = DB.users.get();
    const i = arr.findIndex((x: any) => x.id === p.uid);
    if (i === -1) throw new Error('User not found');
    arr[i] = { ...arr[i], ...body }; DB.users.save(arr);
    return arr[i];
  }

  if (path === '/history' && method === 'GET') {
    const p = chkToken(token!);
    return DB.hist.get(p.uid);
  }

  if (path === '/history' && method === 'POST') {
    const p = chkToken(token!);
    const h = DB.hist.get(p.uid);
    const e = { id: 'h' + Date.now(), ...body, status: 'paid', created_at: new Date().toISOString() };
    h.unshift(e); if (h.length > 50) h.splice(50);
    DB.hist.save(p.uid, h);
    return e;
  }

  throw new Error('Unknown endpoint: ' + path);
}

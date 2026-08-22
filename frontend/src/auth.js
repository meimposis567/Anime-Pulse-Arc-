// Non-intrusive auth helper; can be used without changing UI
export const auth = {
  token: null,
  setToken(t){ this.token = t; localStorage.setItem('token', t); },
  load(){ this.token = localStorage.getItem('token'); return this.token; },
  headers(){ const t=this.load(); return t ? { 'Authorization': 'Bearer ' + t } : {}; }
}
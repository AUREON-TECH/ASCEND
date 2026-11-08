// ASCEND / AUREON BASE — client-side SDK adapter.
// This file contains no secrets. Configure the public API URL after the backend is publicly accessible.
export function createAscendClient(baseUrl) {
  const root = String(baseUrl || '').replace(/\/$/, '');
  if (!/^https:\/\//.test(root)) throw new Error('É necessária uma URL HTTPS válida para a AUREON BASE.');
  const accessKey = 'ascend_access_token';
  const refreshKey = 'ascend_refresh_token';
  let access = sessionStorage.getItem(accessKey) || '';
  let refresh = localStorage.getItem(refreshKey) || '';
  async function request(path, options = {}, retry = true) {
    const send = token => fetch(root + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...options.headers }
    });
    let response = await send(access);
    if (response.status === 401 && retry && refresh && path !== '/auth/refresh') {
      const renewed = await fetch(root + '/auth/refresh', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({refresh_token:refresh}) });
      if (renewed.ok) {
        const tokens = await renewed.json();
        storeTokens(tokens);
        response = await send(access);
      } else clearTokens();
    }
    if (response.status === 204) return null;
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'Falha na comunicação com a AUREON BASE');
    return body;
  }
  function storeTokens(tokens) {
    if (tokens.access_token) { access = tokens.access_token; sessionStorage.setItem(accessKey, access); }
    if (tokens.refresh_token) { refresh = tokens.refresh_token; localStorage.setItem(refreshKey, refresh); }
  }
  function clearTokens() { access = ''; refresh = ''; sessionStorage.removeItem(accessKey); localStorage.removeItem(refreshKey); }
  const json = data => ({method:'POST',body:JSON.stringify(data)});
  return {
    async register({name,email,password}) {
      const result = await request('/auth/register', json({display_name:name,email,password,project_slug:'ascend'}), false);
      storeTokens(result); return result;
    },
    async login({email,password}) {
      const result = await request('/auth/login', json({email,password}), false);
      storeTokens(result); return result;
    },
    async logout() {
      try { if(access) await request('/auth/logout', json({refresh_token:refresh}), false); }
      finally { clearTokens(); }
    },
    me: () => request('/me'),
    access: () => request('/projects/ascend/access'),
    requestPasswordReset: email => request('/auth/request-password-reset', json({email}), false),
    resetPassword: ({email,code,newPassword}) => request('/auth/reset-password', json({email,code,new_password:newPassword}), false),
    list: collection => request('/v1/projects/ascend/data/'+encodeURIComponent(collection)),
    insert: (collection,data) => request('/v1/projects/ascend/data/'+encodeURIComponent(collection),json({data})),
    update: (collection,id,data) => request('/v1/projects/ascend/data/'+encodeURIComponent(collection)+'/'+encodeURIComponent(id),{method:'PUT',body:JSON.stringify({data})}),
    remove: (collection,id) => request('/v1/projects/ascend/data/'+encodeURIComponent(collection)+'/'+encodeURIComponent(id),{method:'DELETE'}),
    authenticated: () => Boolean(access || refresh)
  };
}

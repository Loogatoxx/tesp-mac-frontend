// Gestao simples da sessao no browser (localStorage)

export function guardarSessao(jwt, user) {
  localStorage.setItem('jwt', jwt);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getJwt() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

export function logout() {
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');
}

export function isGestor() {
  const u = getUser();
  return u?.role?.name === 'Admin';   // ⬅️ mete aqui o NOME do teu role gestor
}
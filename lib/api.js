// Cliente da API REST do Strapi (consumida pela app Next.js)
const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export { API_URL };

// Resolve o URL de uma imagem (Strapi devolve url relativo em local e absoluto na cloud)
export function mediaUrl(foto) {
  if (!foto || !foto.url) return null;
  return foto.url.startsWith('http') ? foto.url : `${API_URL}${foto.url}`;
}

async function tratar(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error?.message || `Erro ${res.status}`);
  }
  return json;
}

// ---------- Produtos (leitura publica) ----------
export async function listarProdutos() {
  const res = await fetch(
    `${API_URL}/api/produtos?populate=Foto&pagination[pageSize]=100`,
    { cache: 'no-store' }
  );
  const json = await tratar(res);
  return json.data || [];
}

// ---------- Autenticacao (RF-001) ----------
export async function login(identifier, password) {
  const res = await fetch(`${API_URL}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  return tratar(res); // { jwt, user }
}

export async function registar(username, email, password) {
  const res = await fetch(`${API_URL}/api/auth/local/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return tratar(res);
}

// ---------- CRUD de produtos (precisa de JWT / login) ----------
export async function criarProduto(data, jwt) {
  const res = await fetch(`${API_URL}/api/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ data }),
  });
  return tratar(res);
}

export async function atualizarProduto(documentId, data, jwt) {
  const res = await fetch(`${API_URL}/api/produtos/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ data }),
  });
  return tratar(res);
}

export async function apagarProduto(documentId, jwt) {
  const res = await fetch(`${API_URL}/api/produtos/${documentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok && res.status !== 204) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error?.message || `Erro ${res.status}`);
  }
  return true;
}

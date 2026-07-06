// Cliente da API REST do Strapi (consumida pela app Next.js)
const API_URL = 'http://localhost:1337';

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
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Login falhou');

  // tentar buscar o utilizador COM o role (para saber se é gestor);
  // se falhar (ex.: role sem permissão 'me'), usa os dados básicos do login,
  // que já trazem username e id.
  let user = data.user;
  try {
    const meRes = await fetch(`${API_URL}/api/users/me?populate=role`, {
      headers: { Authorization: `Bearer ${data.jwt}` },
    });
    if (meRes.ok) user = await meRes.json();
  } catch {}
  return { jwt: data.jwt, user };
}
export async function register(username, email, password) {
  // Certifique-se de que o caminho é exatamente este:
  const resposta = await fetch(`${API_URL}/auth/local/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });}


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
export async function uploadImagem(file, jwt) {
  const fd = new FormData();
  fd.append('files', file);
  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` }, // NÃO metas Content-Type (o browser trata)
    body: fd,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Erro no upload');
  return json[0].id; // id do ficheiro carregado
}

// ---------- Encomendas ----------
export async function criarEncomenda(dados, jwt) {
  const res = await fetch(`${API_URL}/api/encomendas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ data: dados }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Erro ao criar encomenda');
  return json.data;
}

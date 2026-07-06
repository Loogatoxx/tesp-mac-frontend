// Gestão do carrinho de compras — guardado no localStorage do browser.
// Cada item: { documentId, id, Nome, Preco, Foto, Stock, quantidade }
const CHAVE = 'carrinho';

export function getCarrinho() {
  if (typeof window === 'undefined') return [];
  const c = localStorage.getItem(CHAVE);
  return c ? JSON.parse(c) : [];
}

function guardar(carrinho) {
  localStorage.setItem(CHAVE, JSON.stringify(carrinho));
  window.dispatchEvent(new Event('carrinho-alterado'));
}

// Limite de stock do item (Infinity se o produto não tiver stock definido)
function limiteStock(item) {
  return item.Stock == null ? Infinity : item.Stock;
}

// Adiciona um produto (ou soma +1 se já lá estiver) — nunca passa do stock
export function adicionarAoCarrinho(produto) {
  const carrinho = getCarrinho();
  const existente = carrinho.find((i) => i.documentId === produto.documentId);
  const stock = produto.Stock == null ? Infinity : produto.Stock;
  if (existente) {
    if (existente.quantidade < stock) existente.quantidade += 1;
  } else {
    carrinho.push({
      documentId: produto.documentId,
      id: produto.id,
      Nome: produto.Nome,
      Preco: produto.Preco,
      Foto: produto.Foto || null,
      Stock: produto.Stock ?? null,
      quantidade: 1,
    });
  }
  guardar(carrinho);
}

// +1 / -1 (não passa do stock; remove se chegar a 0)
export function alterarQuantidade(documentId, delta) {
  let carrinho = getCarrinho();
  const item = carrinho.find((i) => i.documentId === documentId);
  if (!item) return;
  let nova = item.quantidade + delta;
  const max = limiteStock(item);
  if (nova > max) nova = max;
  item.quantidade = nova;
  if (item.quantidade <= 0) {
    carrinho = carrinho.filter((i) => i.documentId !== documentId);
  }
  guardar(carrinho);
}

// Define a quantidade exacta (input manual) — limitada entre 1 e o stock
export function definirQuantidade(documentId, quantidade) {
  const carrinho = getCarrinho();
  const item = carrinho.find((i) => i.documentId === documentId);
  if (!item) return;
  let q = parseInt(quantidade, 10);
  if (isNaN(q) || q < 1) q = 1; // mínimo 1
  const max = limiteStock(item);
  if (q > max) q = max; // não passa do stock
  item.quantidade = q;
  guardar(carrinho);
}

// Sincroniza o stock dos itens com os produtos vindos da API
// e corrige quantidades que já estejam acima do stock.
export function sincronizarStock(produtos) {
  const mapa = {};
  produtos.forEach((p) => {
    mapa[p.documentId] = p.Stock;
  });
  const carrinho = getCarrinho().map((i) => {
    const stock = mapa[i.documentId] ?? i.Stock ?? null;
    let quantidade = i.quantidade;
    if (stock != null && quantidade > stock) quantidade = stock; // corrige o que já estava acima
    return { ...i, Stock: stock, quantidade };
  });
  guardar(carrinho);
}

export function removerDoCarrinho(documentId) {
  guardar(getCarrinho().filter((i) => i.documentId !== documentId));
}

export function contarItens() {
  return getCarrinho().reduce((t, i) => t + i.quantidade, 0);
}

export function totalCarrinho() {
  return getCarrinho().reduce((t, i) => t + Number(i.Preco || 0) * i.quantidade, 0);
}

export function limparCarrinho() {
  guardar([]);
}

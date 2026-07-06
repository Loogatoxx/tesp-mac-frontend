'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, Button, Form, Card, Row, Col, Alert } from 'react-bootstrap';
import {
  getCarrinho,
  alterarQuantidade,
  definirQuantidade,
  removerDoCarrinho,
  totalCarrinho,
  sincronizarStock,
  limparCarrinho,
} from '@/lib/carrinho';
import { listarProdutos, criarEncomenda } from '@/lib/api';
import { getUser, getJwt } from '@/lib/auth';

export default function Carrinho() {
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({ nome: '', telefone: '', morada: '' });
  const [confirmacao, setConfirmacao] = useState(null);

  // relê o carrinho do localStorage e recalcula o total
  function atualizar() {
    setItens(getCarrinho());
    setTotal(totalCarrinho());
  }

  useEffect(() => {
    atualizar();
    // buscar o stock atual dos produtos e sincronizar/limitar o carrinho
    listarProdutos()
      .then((prods) => {
        sincronizarStock(prods);
        atualizar();
      })
      .catch(() => {});
    window.addEventListener('carrinho-alterado', atualizar);
    return () => window.removeEventListener('carrinho-alterado', atualizar);
  }, []);

  function mudarQtd(docId, delta) {
    alterarQuantidade(docId, delta);
    atualizar();
  }

  function remover(docId) {
    removerDoCarrinho(docId);
    atualizar();
  }

  function mudarQtdManual(docId, valor) {
    definirQuantidade(docId, valor);
    atualizar();
  }

  function alterarForm(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function finalizar(e) {
    e.preventDefault();
    const user = getUser();
    const jwt = getJwt();
    if (!jwt || !user) {
      alert('Precisas de iniciar sessão para finalizar a compra.');
      return;
    }
    try {
      const dados = {
        estado: 'Pago',
        total: total,
        nomeCliente: form.nome,
        telefone: form.telefone,
        enderecoEntrega: form.morada,
        produtos: itens.map((i) => i.id), // relação M-N (array de ids)
        itens: itens.map((i) => ({ documentId: i.documentId, quantidade: i.quantidade })), // p/ baixar o stock
        // o utilizador é definido no servidor (controller), a partir do login
      };
      await criarEncomenda(dados, jwt);

      // prazo de entrega: 3 a 5 dias úteis
      const dias = 3 + Math.floor(Math.random() * 3);
      const entrega = new Date();
      entrega.setDate(entrega.getDate() + dias);

      limparCarrinho();
      setConfirmacao({ dias, data: entrega.toLocaleDateString('pt-PT') });
    } catch (err) {
      alert('Erro ao finalizar: ' + err.message);
    }
  }

  if (confirmacao) {
    return (
      <Alert variant="success">
        <Alert.Heading>✅ Compra concluída (demo)!</Alert.Heading>
        <p>
          Obrigado pela tua encomenda. A entrega demora cerca de{' '}
          <strong>{confirmacao.dias} dias úteis</strong>.
        </p>
        <p className="mb-0">
          Entrega prevista para: <strong>{confirmacao.data}</strong>.
        </p>
        <hr />
        <Link href="/">Voltar ao catálogo</Link>
      </Alert>
    );
  }

  if (itens.length === 0) {
    return (
      <Alert variant="info">
        O teu carrinho está vazio. <Link href="/">Ver catálogo</Link>.
      </Alert>
    );
  }

  return (
    <Row className="g-4">
      <Col md={7}>
        <h1 className="mb-3">Carrinho</h1>
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Preço</th>
              <th>Qtd</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {itens.map((i) => (
              <tr key={i.documentId}>
                <td>{i.Nome}</td>
                <td>{Number(i.Preco || 0).toFixed(2)} €</td>
                <td className="text-nowrap">
                  <div className="d-flex align-items-center gap-1">
                    <Button size="sm" variant="outline-secondary" onClick={() => mudarQtd(i.documentId, -1)}>
                      −
                    </Button>
                    <Form.Control
                      type="number"
                      min={1}
                      max={i.Stock ?? undefined}
                      value={i.quantidade}
                      onChange={(e) => mudarQtdManual(i.documentId, e.target.value)}
                      style={{ width: 90 }}
                    />
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => mudarQtd(i.documentId, +1)}
                      disabled={i.Stock != null && i.quantidade >= i.Stock}
                    >
                      +
                    </Button>
                  </div>
                  {i.Stock != null && <small className="text-muted">stock: {i.Stock}</small>}
                </td>
                <td>{(Number(i.Preco || 0) * i.quantidade).toFixed(2)} €</td>
                <td>
                  <Button size="sm" variant="outline-danger" onClick={() => remover(i.documentId)}>
                    Remover
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <h4>Total: {total.toFixed(2)} €</h4>
      </Col>

      <Col md={5}>
        <Card>
          <Card.Body>
            <Card.Title className="mb-3">Dados de entrega</Card.Title>
            <Form onSubmit={finalizar}>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  value={form.nome}
                  onChange={(e) => alterarForm('nome', e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Telefone</Form.Label>
                <Form.Control
                  value={form.telefone}
                  onChange={(e) => alterarForm('telefone', e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Morada de entrega</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.morada}
                  onChange={(e) => alterarForm('morada', e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" variant="success" className="w-100">
                Pagar {total.toFixed(2)} € (demo)
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, Button, Form, Row, Col, Alert, Card } from 'react-bootstrap';
import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
  apagarProduto,
} from '@/lib/api';
import { getJwt, getUser } from '@/lib/auth';

const VAZIO = {
  Nome: '',
  Preco: '',
  Descricao: '',
  Categoria: 'Outro',
  Stock: 0,
  Disponivel: true,
};
const CATEGORIAS = ['Anfibio', 'Reptil', 'Peixe', 'Aracnideo', 'Mamifero', 'Ave', 'Outro'];

export default function AdminPage() {
  const [jwt, setJwt] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null); // documentId em edicao
  const [msg, setMsg] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setJwt(getJwt());
    carregar();
  }, []);

  async function carregar() {
    try {
      setProdutos(await listarProdutos());
    } catch (e) {
      setErro(e.message);
    }
  }

  function alterar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function submeter(e) {
    e.preventDefault();
    setErro(null);
    setMsg(null);
    const dados = {
      ...form,
      Preco: Number(form.Preco),
      Stock: Number(form.Stock),
    };
    try {
      if (editId) {
        await atualizarProduto(editId, dados, jwt);
        setMsg('Produto atualizado.');
      } else {
        await criarProduto(dados, jwt);
        setMsg('Produto criado.');
      }
      setForm(VAZIO);
      setEditId(null);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  function editar(p) {
    setEditId(p.documentId);
    setForm({
      Nome: p.Nome || '',
      Preco: p.Preco ?? '',
      Descricao: p.Descricao || '',
      Categoria: p.Categoria || 'Outro',
      Stock: p.Stock ?? 0,
      Disponivel: !!p.Disponivel,
    });
    window.scrollTo(0, 0);
  }

  async function remover(p) {
    if (!confirm(`Apagar "${p.Nome}"?`)) return;
    setErro(null);
    setMsg(null);
    try {
      await apagarProduto(p.documentId, jwt);
      setMsg('Produto apagado.');
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (!jwt) {
    return (
      <Alert variant="warning">
        Precisas de <Link href="/login">iniciar sessão</Link> para gerir produtos.
      </Alert>
    );
  }

  return (
    <>
      <h1 className="mb-3">Gestão de Produtos</h1>
      {msg && (
        <Alert variant="success" onClose={() => setMsg(null)} dismissible>
          {msg}
        </Alert>
      )}
      {erro && (
        <Alert variant="danger" onClose={() => setErro(null)} dismissible>
          {erro}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{editId ? 'Editar produto' : 'Novo produto'}</Card.Title>
          <Form onSubmit={submeter}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  value={form.Nome}
                  onChange={(e) => alterar('Nome', e.target.value)}
                  required
                />
              </Col>
              <Col md={3}>
                <Form.Label>Preço (€)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={form.Preco}
                  onChange={(e) => alterar('Preco', e.target.value)}
                  required
                />
              </Col>
              <Col md={3}>
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  value={form.Stock}
                  onChange={(e) => alterar('Stock', e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Categoria</Form.Label>
                <Form.Select
                  value={form.Categoria}
                  onChange={(e) => alterar('Categoria', e.target.value)}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={8}>
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  value={form.Descricao}
                  onChange={(e) => alterar('Descricao', e.target.value)}
                />
              </Col>
              <Col xs={12}>
                <Form.Check
                  label="Disponível"
                  checked={form.Disponivel}
                  onChange={(e) => alterar('Disponivel', e.target.checked)}
                />
              </Col>
            </Row>
            <div className="mt-3">
              <Button type="submit">{editId ? 'Guardar' : 'Criar'}</Button>{' '}
              {editId && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setForm(VAZIO);
                    setEditId(null);
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.id}>
              <td>{p.Nome}</td>
              <td>{p.Categoria}</td>
              <td>{Number(p.Preco || 0).toFixed(2)} €</td>
              <td>{p.Stock ?? 0}</td>
              <td className="text-end">
                <Button size="sm" variant="outline-primary" onClick={() => editar(p)}>
                  Editar
                </Button>{' '}
                <Button size="sm" variant="outline-danger" onClick={() => remover(p)}>
                  Apagar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

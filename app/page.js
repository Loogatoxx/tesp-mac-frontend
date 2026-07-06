'use client';

import { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { listarProdutos, mediaUrl } from '@/lib/api';
import { adicionarAoCarrinho } from '@/lib/carrinho';

export default function Catalogo() {
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarProdutos()
      .then(setProdutos)
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (erro) return <Alert variant="danger">Erro ao carregar: {erro}</Alert>;

  return (
    <>
      <h1 className="mb-4">Catálogo</h1>
      {produtos.length === 0 && (
        <Alert variant="info">
          Sem produtos. (Já transferiste os dados para a base da cloud?)
        </Alert>
      )}
      <Row xs={1} sm={2} md={3} className="g-4">
        {produtos.map((p) => {
          const img = mediaUrl(p.Foto);
          return (
            <Col key={p.id}>
              <Card className="h-100 shadow-sm">
                {img && (
                  <Card.Img
                    variant="top"
                    src={img}
                    alt={p.Nome}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title className="d-flex justify-content-between align-items-start gap-2">
                    <span>{p.Nome}</span>
                    {p.Categoria && <Badge bg="secondary">{p.Categoria}</Badge>}
                  </Card.Title>
                  <Card.Text className="text-muted">{p.Descricao}</Card.Text>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                  <strong>{Number(p.Preco || 0).toFixed(2)} €</strong>
                  <span className={p.Disponivel ? 'text-success' : 'text-danger'}>
                    {p.Disponivel ? `Stock: ${p.Stock ?? 0}` : 'Indisponível'}
                  </span>
                    <Button
                        style={{ backgroundColor: "green"}}
                        variant="primary"
                        size="sm"
                        disabled={!p.Disponivel}
                        onClick={() => adicionarAoCarrinho(p)}
                    >
                        Adicionar
                    </Button>
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
}

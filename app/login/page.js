'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { login } from '@/lib/api';
import { guardarSessao } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submeter(e) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const { jwt, user } = await login(identifier, password);
      guardarSessao(jwt, user);
      router.push('/admin');
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card style={{ maxWidth: 420 }} className="mx-auto">
      <Card.Body>
        <Card.Title className="mb-3">Entrar</Card.Title>
        {erro && <Alert variant="danger">{erro}</Alert>}
        <Form onSubmit={submeter}>
          <Form.Group className="mb-3">
            <Form.Label>Email ou username</Form.Label>
            <Form.Control
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" disabled={loading}>
            {loading ? 'A entrar...' : 'Entrar'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

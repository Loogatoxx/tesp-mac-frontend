'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { registar } from '@/lib/api'; // Make sure this function exists in your API helper
import { guardarSessao } from '@/lib/auth';


export default function RegisterRegister() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState(null);
    const [loading, setLoading] = useState(false);

    async function submeter(e) {
        e.preventDefault();
        setErro(null);
        setLoading(true);
        try {
            // Calls your register API endpoint passing user credentials
            const { jwt, user } = await registar(username, email, password);

            // Log the user in automatically after registration
            guardarSessao(jwt, user);

            // Redirect to the dashboard/admin panel
            router.push('/admin');
        } catch (e) {
            setErro(e.message || 'Ocorreu um erro ao criar a conta.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card style={{ maxWidth: 420 }} className="mx-auto mt-5">
            <Card.Body>
                <Card.Title className="mb-3">Criar Conta</Card.Title>

                {erro && <Alert variant="danger">{erro}</Alert>}

                <Form onSubmit={submeter}>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            minLength={6}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </Form.Group>

                    {/* Flexbox container pushes the Login link to the left and Register button to the right */}
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <Button
                            type="button"
                            variant="link"
                            className="p-0 text-decoration-none"
                            onClick={() => router.push('/login')}
                        >
                            Já tenho conta (Login)
                        </Button>

                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'A criar...' : 'Registar'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}

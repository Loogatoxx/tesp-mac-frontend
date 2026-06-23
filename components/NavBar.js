'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { getUser, logout } from '@/lib/auth';

export default function NavBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
    const aoMudar = () => setUser(getUser());
    window.addEventListener('storage', aoMudar);
    return () => window.removeEventListener('storage', aoMudar);
  }, []);

  function sair() {
    logout();
    setUser(null);
    window.location.href = '/';
  }

  return (
    <Navbar bg="dark" variant="dark" expand="md">
      <Container>
        <Navbar.Brand as={Link} href="/">🐾 Loja de Animais</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} href="/">Catálogo</Nav.Link>
          <Nav.Link as={Link} href="/admin">Gestão</Nav.Link>
        </Nav>
        <Nav className="align-items-center">
          {user ? (
            <>
              <Navbar.Text className="me-2">Olá, {user.username}</Navbar.Text>
              <Button size="sm" variant="outline-light" onClick={sair}>
                Sair
              </Button>
            </>
          ) : (
            <Nav.Link as={Link} href="/login">
              Entrar
            </Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

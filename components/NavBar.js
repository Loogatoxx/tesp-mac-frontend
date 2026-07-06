'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { getUser, logout, isGestor } from '@/lib/auth';
import { contarItens } from '@/lib/carrinho';

export default function NavBar() {
  const [user, setUser] = useState(null);
  const [numItens, setNumItens] = useState(0);

  useEffect(() => {
    setUser(getUser());
    setNumItens(contarItens());
    const aoMudar = () => setUser(getUser());
    const aoMudarCarrinho = () => setNumItens(contarItens());
    window.addEventListener('storage', aoMudar);
    window.addEventListener('carrinho-alterado', aoMudarCarrinho);
    return () => {
      window.removeEventListener('storage', aoMudar);
      window.removeEventListener('carrinho-alterado', aoMudarCarrinho);
    };
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
            {user && isGestor() && (
                <Nav.Link as={Link} href="/admin">Gestão</Nav.Link>
            )}
          </Nav>
          <Nav className="align-items-center">
            <Nav.Link as={Link} href="/carrinho" className="me-2">
              🛒
              {numItens > 0 && (
                <Badge bg="danger" pill className="ms-1">{numItens}</Badge>
              )}
            </Nav.Link>
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
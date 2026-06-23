import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata = {
  title: 'Loja de Animais — TESP MAC',
  description: 'Frontend Next.js que consome a API REST do Strapi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        <NavBar />
        <main className="container py-4">{children}</main>
      </body>
    </html>
  );
}

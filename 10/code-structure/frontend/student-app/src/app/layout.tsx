import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StudyMate - Plataforma de Aprendizaje Digital',
  description: 'Plataforma educativa moderna para estudiantes, docentes e instituciones',
  keywords: ['educación', 'aprendizaje', 'digital', 'estudiantes', 'gamificación'],
  authors: [{ name: 'StudyMate Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {/* Providers para estado global, autenticación, etc. */}
        <div id="root">{children}</div>
      </body>
    </html>
  );
}

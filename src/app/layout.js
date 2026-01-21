import './globals.css';

export const metadata = {
  title: 'El Chalán - Heladería',
  description: 'Sistema de fidelización de puntos - Heladería El Chalán',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#4a9b8c',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#4a9b8c] min-h-screen">
        {children}
      </body>
    </html>
  );
}

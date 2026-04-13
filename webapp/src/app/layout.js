import './globals.css';

export const metadata = {
  title: 'Starstruck Cinemas Web',
  description: 'A Next.js Cinema Booking App',
  manifest: '/manifest.json',
  themeColor: '#FF2B5E',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Starstruck',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/background.jpg" />
      </head>
      <body>
        <nav className="no-print" style={{ background: 'rgba(0,0,0,0.8)', padding: '1rem', display: 'flex', gap: '1rem', backdropFilter: 'blur(20px)' }}>
          <a href="/">🎬 Starstruck Cinemas</a>
          <a href="/admin">Admin Shield</a>
        </nav>
        <main className="container">
          {children}
        </main>
        
        {/* Service Worker Native Mount */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('PWA SW Mounted successfully:', registration.scope);
                }, function(err) {
                  console.error('PWA SW Failed:', err);
                });
              });
            }
          `
        }} />
      </body>
    </html>
  );
}

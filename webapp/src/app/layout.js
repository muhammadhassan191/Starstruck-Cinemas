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
        <main className="container">
          {children}
        </main>
        
        {/* Floating Admin Button */}
        <a href="/admin" className="no-print" style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            background: 'linear-gradient(135deg, #FF2B5E, #FF5B84)',
            color: 'white',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(255, 43, 94, 0.4)',
            fontWeight: '600',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 9999,
            transition: 'transform 0.2s',
          }}
        >
          🛡️ Admin Console
        </a>
        
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

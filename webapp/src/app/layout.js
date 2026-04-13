import './globals.css';

export const metadata = {
  title: 'DAKs Cinemas Web',
  description: 'Enhanced Cinema Ticket Booking Application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <a href="/">🎬 DAKs Cinemas</a>
          <a href="/admin">Admin Dashboard</a>
        </nav>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}

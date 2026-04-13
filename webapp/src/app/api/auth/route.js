import { openDB } from '../../../lib/db';

export async function POST(request) {
  const { username, password } = await request.json();
  const db = await openDB();

  const admin = await db.get('SELECT * FROM Admins WHERE username = ? AND password = ?', [username, password]);
  
  if (admin) {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } else {
    return new Response(JSON.stringify({ success: false, message: 'Invalid Credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
}

import { openDB } from '../../../../lib/db';

export async function POST(request) {
  const { action, email, password, name } = await request.json();
  const db = await openDB();

  try {
    if (action === 'signup') {
      // Create user
      const existing = await db.get('SELECT * FROM Users WHERE email = ?', [email]);
      if (existing) return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 400 });
      
      const result = await db.run(
        'INSERT INTO Users (email, password, name) VALUES (?, ?, ?)',
        [email, password, name || email.split('@')[0]]
      );
      
      const newUser = await db.get('SELECT id, name, email, reward_points FROM Users WHERE id = ?', [result.lastID]);
      return new Response(JSON.stringify({ success: true, user: newUser }), { status: 201 });
    } 
    else if (action === 'login') {
      const user = await db.get('SELECT id, name, email, reward_points FROM Users WHERE email = ? AND password = ?', [email, password]);
      if (user) {
        return new Response(JSON.stringify({ success: true, user }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
      }
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

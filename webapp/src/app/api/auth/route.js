import { getDB } from '../../../lib/db';

export async function POST(request) {
  const { username, password } = await request.json();
  const db = getDB();

  const { data, error } = await db
    .from('admins')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .maybeSingle();

  if (error) return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });

  if (data) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    return new Response(JSON.stringify({ success: false, message: 'Invalid Credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

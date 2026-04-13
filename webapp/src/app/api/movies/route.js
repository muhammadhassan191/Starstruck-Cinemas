import { openDB } from '../../../lib/db';

export async function GET(request) {
  const db = await openDB();
  const movies = await db.all('SELECT * FROM Movies');
  return new Response(JSON.stringify(movies), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request) {
  const db = await openDB();
  const body = await request.json();
  try {
    await db.run(
      'INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES (?, ?, ?, ?, ?)',
      [body.name, body.price, body.available_seats, body.date, body.poster_path || '/placeholder.jpg']
    );
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

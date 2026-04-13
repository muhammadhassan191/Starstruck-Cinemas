import { openDB } from '../../../lib/db';

export async function POST(request) {
  const { id, seats } = await request.json();
  const db = await openDB();

  try {
    // Verify seats are available
    const movie = await db.get('SELECT * FROM Movies WHERE id = ?', [id]);
    if (!movie) return new Response(JSON.stringify({ error: 'Movie not found' }), { status: 404 });
    if ((movie.available_seats - movie.booked_seats) < seats) {
      return new Response(JSON.stringify({ error: 'Not enough seats available!' }), { status: 400 });
    }

    // Process Booking
    await db.run(
      'UPDATE Movies SET booked_seats = booked_seats + ? WHERE id = ?',
      [seats, id]
    );
    
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

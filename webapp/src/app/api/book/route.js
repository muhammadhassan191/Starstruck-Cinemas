import { openDB } from '../../../lib/db';

export async function POST(request) {
  const { id, seatIds } = await request.json(); // seatIds = array of strings e.g. ['A1', 'B2']
  const db = await openDB();

  try {
    const movie = await db.get('SELECT * FROM Movies WHERE id = ?', [id]);
    if (!movie) return new Response(JSON.stringify({ error: 'Movie not found' }), { status: 404 });
    
    // Process JSON Array of already booked seats
    let currentBooked = [];
    try {
        currentBooked = JSON.parse(movie.booked_seats_list || '[]');
    } catch(e) {}
    
    // Check overlaps to prevent duplicate booking!
    const conflict = seatIds.some(seat => currentBooked.includes(seat));
    if(conflict) {
      return new Response(JSON.stringify({ error: 'One or more selected seats were already booked by someone else!' }), { status: 400 });
    }

    const newBooked = [...currentBooked, ...seatIds];

    await db.run(
      'UPDATE Movies SET booked_seats = booked_seats + ?, booked_seats_list = ? WHERE id = ?',
      [seatIds.length, JSON.stringify(newBooked), id]
    );
    
    return new Response(JSON.stringify({ success: true, booked: newBooked }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

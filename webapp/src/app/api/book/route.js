import { getDB } from '../../../lib/db';

export async function POST(request) {
  const { id, seatIds, userId, totalPrice } = await request.json();
  const db = getDB();

  try {
    // Fetch the movie
    const { data: movie, error: fetchError } = await db
      .from('movies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !movie) {
      return new Response(JSON.stringify({ error: 'Movie not found' }), { status: 404 });
    }

    // Parse currently booked seats
    let currentBooked = [];
    try {
      currentBooked = JSON.parse(movie.booked_seats_list || '[]');
    } catch (e) {}

    // Check for seat conflicts
    const conflict = seatIds.some(seat => currentBooked.includes(seat));
    if (conflict) {
      return new Response(
        JSON.stringify({ error: 'One or more selected seats were already booked by someone else!' }),
        { status: 400 }
      );
    }

    const newBooked = [...currentBooked, ...seatIds];

    // Update movie row
    const { error: updateError } = await db
      .from('movies')
      .update({
        booked_seats: movie.booked_seats + seatIds.length,
        booked_seats_list: JSON.stringify(newBooked),
      })
      .eq('id', id);

    if (updateError) throw new Error(updateError.message);

    // Award reward points to user
    if (userId && totalPrice) {
      const earnedPoints = Math.floor(totalPrice * 0.1);

      const { data: userRow } = await db
        .from('users')
        .select('reward_points')
        .eq('id', userId)
        .maybeSingle();

      if (userRow) {
        await db
          .from('users')
          .update({ reward_points: userRow.reward_points + earnedPoints })
          .eq('id', userId);
      }
    }

    return new Response(JSON.stringify({ success: true, booked: newBooked }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

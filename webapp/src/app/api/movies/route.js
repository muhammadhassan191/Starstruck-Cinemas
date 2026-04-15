import { getDB } from '../../../lib/db';

export async function GET() {
  const db = getDB();

  const { data: movies, error: moviesError } = await db.from('movies').select('*');
  if (moviesError) return new Response(JSON.stringify({ error: moviesError.message }), { status: 500 });

  const { data: allReviews, error: reviewsError } = await db.from('reviews').select('*');
  if (reviewsError) return new Response(JSON.stringify({ error: reviewsError.message }), { status: 500 });

  const enrichedMovies = movies.map((m) => {
    let ai_consensus = '';
    let surge_price = 0;

    // 1. Algorithmic Surge Pricing Calculation (>70% capacity)
    if (m.available_seats > 0 && (m.booked_seats / m.available_seats) > 0.7) {
      surge_price = 300;
    }

    // 2. AI Review Summarization Logic
    const reviews = allReviews.filter(r => r.movie_id === m.id);
    if (reviews.length > 0) {
      const fullText = reviews.map(r => r.text.toLowerCase()).join(' ');
      let positives = [];
      let negatives = [];

      if (fullText.includes('visual') || fullText.includes('stunning')) positives.push('stunning visuals');
      if (fullText.includes('action')) positives.push('great action');
      if (fullText.includes('heartwarming') || fullText.includes('hilarious')) positives.push('emotional depth');

      if (fullText.includes('slow') || fullText.includes('pacing')) negatives.push('slow pacing');
      if (fullText.includes('confusing')) negatives.push('a confusing plot');

      if (positives.length > 0 || negatives.length > 0) {
        ai_consensus = `💡 AI Summary: `;
        if (positives.length > 0) ai_consensus += `Audiences praise the ${positives.join(' and ')}`;
        if (negatives.length > 0) ai_consensus += positives.length > 0 ? `, but note ${negatives.join(' and ')}.` : `Audiences complain about ${negatives.join(' and ')}.`;
      } else {
        ai_consensus = `💡 AI Summary: Mixed reception based on reviews.`;
      }
    } else {
      ai_consensus = `💡 AI Summary: No reviews available.`;
    }

    return { ...m, ai_consensus, surge_price };
  });

  return new Response(JSON.stringify(enrichedMovies), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request) {
  const db = getDB();
  const body = await request.json();

  const { error } = await db.from('movies').insert([{
    name: body.name,
    price: body.price,
    available_seats: body.available_seats,
    date: body.date,
    showtime: body.showtime || '18:00',
    cinema_location: body.cinema_location || 'Starstruck Central - New York',
    poster_path: body.poster_path || '/placeholder.jpg',
    genre: body.genre || 'General',
  }]);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ success: true }), { status: 201 });
}

import { openDB } from '../../../lib/db';

export async function GET(request) {
  const db = await openDB();
  const movies = await db.all('SELECT * FROM Movies');
  const enrichedMovies = [];

  for (let m of movies) {
    let ai_consensus = "";
    let surge_price = 0;

    // 1. Algorithmic Surge Pricing Calculation (>70% capacity)
    if (m.available_seats > 0 && (m.booked_seats / m.available_seats) > 0.7) {
      surge_price = 3; // $3 surge
    }

    // 2. AI Review Summarization Logic
    const reviews = await db.all('SELECT text FROM Reviews WHERE movie_id = ?', [m.id]);
    if (reviews.length > 0) {
      const fullText = reviews.map(r => r.text.toLowerCase()).join(" ");
      let positives = [];
      let negatives = [];

      if (fullText.includes("visual") || fullText.includes("stunning")) positives.push("stunning visuals");
      if (fullText.includes("action")) positives.push("great action");
      if (fullText.includes("heartwarming") || fullText.includes("hilarious")) positives.push("emotional depth");
      
      if (fullText.includes("slow") || fullText.includes("pacing")) negatives.push("slow pacing");
      if (fullText.includes("confusing")) negatives.push("a confusing plot");

      if (positives.length > 0 || negatives.length > 0) {
        ai_consensus = `💡 AI Summary: `;
        if (positives.length > 0) ai_consensus += `Audiences praise the ${positives.join(" and ")}`;
        if (negatives.length > 0) ai_consensus += positives.length > 0 ? `, but note ${negatives.join(" and ")}.` : `Audiences complain about ${negatives.join(" and ")}.`;
        if (positives.length === 0 && negatives.length === 0) ai_consensus += "General positive reception.";
      } else {
        ai_consensus = `💡 AI Summary: Mixed reception based on reviews.`;
      }
    } else {
      ai_consensus = `💡 AI Summary: No reviews available.`;
    }

    enrichedMovies.push({
      ...m,
      ai_consensus,
      surge_price
    });
  }

  return new Response(JSON.stringify(enrichedMovies), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request) {
  const db = await openDB();
  const body = await request.json();
  try {
    await db.run(
      'INSERT INTO Movies (name, price, available_seats, date, poster_path, genre) VALUES (?, ?, ?, ?, ?, ?)',
      [body.name, body.price, body.available_seats, body.date, body.poster_path || '/placeholder.jpg', body.genre || 'General']
    );
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

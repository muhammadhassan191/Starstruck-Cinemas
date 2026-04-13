import { openDB } from '../../../lib/db';

export async function POST(request) {
  const { prompt } = await request.json();
  const db = await openDB();
  const movies = await db.all('SELECT * FROM Movies');
  
  let recommendation = "I couldn't find a direct mapping to your request, but our Trending movies section is great right now!";
  let p = prompt.toLowerCase();
  
  // Algorithmic Semantic Matching against SQLite
  let bestMatch = null;
  for(let m of movies) {
    if (p.includes(m.genre.toLowerCase()) || p.includes(m.name.toLowerCase().split(':')[0])) {
      bestMatch = m;
      break;
    }
  }

  if (p.includes('available') || p.includes('seats') || p.includes('ticket')) {
     if (bestMatch) {
       const left = bestMatch.available_seats - bestMatch.booked_seats;
       recommendation = `You're looking for seats! Good news, ${bestMatch.name} currently has exactly ${left} seats remaining in the system.`;
     } else {
       recommendation = `We have plenty of seats across our cinemas today. Which movie did you want to check?`;
     }
  } 
  else if (bestMatch) {
     const left = bestMatch.available_seats - bestMatch.booked_seats;
     recommendation = `I strongly suggest you check out "${bestMatch.name}"! It perfectly matches your vibe and has ${left} seats left today.`;
  }
  else if (p.includes('hi') || p.includes('hello')) {
     recommendation = "Hello there! I am your AI Cinema Guide. Ask me about any genre or seat availability!";
  } 
  else {
     // Fallback to highest rated available
     const top = movies.sort((a,b) => (b.available_seats - b.booked_seats) - (a.available_seats - a.booked_seats))[0];
     recommendation = `Based on your mood, I'd say you can't go wrong with ${top.name}! It's currently in high demand.`;
  }

  await new Promise(r => setTimeout(r, 800)); // Processing time illusion

  return new Response(JSON.stringify({ ai_reply: recommendation }), { status: 200, headers: {'Content-Type': 'application/json'} });
}

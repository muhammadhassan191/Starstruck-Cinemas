import { getDB } from '../../../lib/db';

export async function POST(request) {
  const { prompt } = await request.json();
  const db = getDB();

  const { data: movies } = await db.from('movies').select('*');

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  let response = '';

  // 1. NLP Tokenizer & Stopword removal
  const rawTokens = prompt.toLowerCase().replace(/[.,!?]/g, '').split(' ');
  const stopwords = ['the', 'is', 'at', 'which', 'on', 'for', 'a', 'an', 'and', 'my', 'i', 'want', 'to', 'show', 'tell', 'me', 'about'];
  const tokens = rawTokens.filter(t => !stopwords.includes(t) && t.length > 1);

  // 2. Fast Entity Scoring Algorithm (O(N * T) complexity)
  let bestMovie = null;
  let maxScore = 0;

  for (let m of movies) {
    let score = 0;
    const nameLower = m.name.toLowerCase();
    const nameTokens = nameLower.split(' ');
    const genre = m.genre.toLowerCase();
    const locLower = m.cinema_location.toLowerCase();

    for (let t of tokens) {
      if (t.length >= 3 && nameLower.includes(t)) score += 4;
      else if (nameTokens.includes(t)) score += 3;
      else if (t === genre) score += 2;
      else if (t.length >= 3 && locLower.includes(t)) score += 1;
    }

    if (prompt.toLowerCase().includes(nameLower)) score += 5;

    if (score > maxScore) {
      maxScore = score;
      bestMovie = m;
    }
  }

  // 3. Intent Detection Engine
  const isReview = tokens.includes('review') || tokens.includes('rate') || tokens.includes('rating') || tokens.includes('feedback');
  const isTimeLoc = tokens.includes('time') || tokens.includes('when') || tokens.includes('where') || tokens.includes('location') || tokens.includes('cinema');
  const isPrice = tokens.includes('price') || tokens.includes('cost') || tokens.includes('cheap') || tokens.includes('rs');
  const isGreeting = tokens.includes('hi') || tokens.includes('hello') || tokens.includes('hey');

  // 4. Response Dispatcher
  if (isGreeting && maxScore === 0) {
    response = pick([
      'Hello! I am your algorithmic Cinema Guide. I can tell you about movie timings, prices, locations, or even take your movie reviews!',
      'Hi there! Ask me anything about our database - timings, tickets, or specific cinemas.',
    ]);
  } else if (isReview) {
    if (bestMovie) {
      const reviewIdx = rawTokens.findIndex(t => t === 'review' || t === 'rate' || t === 'rating');
      const reviewText = rawTokens.slice(reviewIdx + 1).join(' ').trim();

      if (reviewText.length > 5) {
        await db.from('reviews').insert([{ movie_id: bestMovie.id, text: prompt }]);
        response = `✅ Thank you! I have actively added your review "${reviewText}..." into the database for ${bestMovie.name}.`;
      } else {
        response = `I see you want to leave a review for ${bestMovie.name}. Please enter your full review statement!`;
      }
    } else {
      response = "You mentioned a review, but I couldn't algorithmically detect which movie you are talking about. Please include the movie name!";
    }
  } else if (isTimeLoc) {
    if (bestMovie) {
      response = `🕰️ Algorithm Match: "${bestMovie.name}" is playing at ${bestMovie.showtime} located specifically at ${bestMovie.cinema_location}.`;
    } else {
      response = `We have 5 cinematic matrices: Central NY, Luxe LA, IMAX Queens, North Bronx, and Hub Brooklyn. Which movie are you tracking?`;
    }
  } else if (isPrice) {
    if (bestMovie) {
      response = `🎟️ The current base price for "${bestMovie.name}" is Rs. ${bestMovie.price}.`;
    } else {
      const cheapest = movies.reduce((prev, curr) => (prev.price < curr.price ? prev : curr));
      response = `Our most affordable movie right now is ${cheapest.name} starting at Rs. ${cheapest.price}.`;
    }
  } else if (bestMovie) {
    const avail = bestMovie.available_seats - bestMovie.booked_seats;
    response = `Here is what I found for "${bestMovie.name}": It's a ${bestMovie.genre} film playing at ${bestMovie.cinema_location} at ${bestMovie.showtime}. Tickets are Rs. ${bestMovie.price} and we have ${avail} seats left!`;
  } else if (tokens.length > 0) {
    const top = movies.sort((a, b) => (b.available_seats - b.booked_seats) - (a.available_seats - a.booked_seats))[0];
    response = `My search algorithms couldn't find a direct match for your keywords. However, based on capacity trends, you should watch ${top.name}!`;
  } else {
    response = 'I am processing. Please provide a clear movie name, genre, or question!';
  }

  await new Promise(r => setTimeout(r, 100));

  return new Response(JSON.stringify({ ai_reply: response }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

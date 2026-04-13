export async function POST(request) {
  const { prompt } = await request.json();
  
  // This is a simulated AI response for the course project showing API integration.
  // In a production environment, you would call OpenAI/Gemini APIs here.
  let recommendation = "I recommend action and adventure.";
  
  if (prompt.toLowerCase().includes('sci-fi') || prompt.toLowerCase().includes('space')) {
    recommendation = "You should definitely watch 'Interstellar' or the latest Sci-Fi releases showing right now!";
  } else if (prompt.toLowerCase().includes('comedy')) {
     recommendation = "You need a good laugh! I recommend the latest Comedy showing right now.";
  } else if(prompt.toLowerCase().includes('avengers')) {
     recommendation = "'Avengers' is an excellent choice for a thrilling Marvel experience!";
  } else {
     recommendation = `Based on your mood: "${prompt}", I recommend checking out our top-rated movie this week! It has great reviews matching your vibe.`;
  }

  // Simulated latency for realism
  await new Promise(r => setTimeout(r, 1000));

  return new Response(JSON.stringify({ ai_reply: recommendation }), { status: 200, headers: {'Content-Type': 'application/json'} });
}

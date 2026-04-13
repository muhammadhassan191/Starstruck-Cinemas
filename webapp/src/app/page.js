'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => setMovies(data));
  }, []);

  const handleAiRecommend = async () => {
    if (!aiPrompt) return;
    setLoading(true);
    setAiResponse('');
    
    try {
      const res = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      setAiResponse(data.ai_reply);
    } catch(e) {
      setAiResponse("AI Service is currently down.");
    }
    
    setLoading(false);
  };

  return (
    <div>
      <header className="header">
        <h1>DAK's Cinemas</h1>
        <p style={{color: 'var(--text-muted)'}}>Book the best movies instantly. Enhanced with AI.</p>
      </header>

      <section className="glass-panel" style={{marginBottom: '3rem'}}>
        <h2 style={{marginBottom: '1rem'}}>Currently Showing</h2>
        <div className="movie-grid">
          {movies.map(movie => (
            <div key={movie.id} className="movie-card">
              <img src={movie.poster_path} alt={movie.name} className="movie-poster" onError={(e) => e.target.src='https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400'}/>
              <div className="movie-info">
                <h3 className="movie-title">{movie.name}</h3>
                <p>Date: {movie.date}</p>
                <p>Price: ${movie.price}</p>
                <p>Seats: {movie.available_seats - movie.booked_seats} / {movie.available_seats}</p>
                <button className="btn" onClick={() => alert(`Seat booked for ${movie.name}!`)}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
          {movies.length === 0 && <p>No movies available right now.</p>}
        </div>
      </section>

      <section className="ai-assistant">
        <h2>🤖 AI Cinema Assistant</h2>
        <p style={{marginBottom: '1.5rem'}}>Not sure what to watch? Tell the AI what you're in the mood for!</p>
        <div style={{display: 'flex', gap: '1rem', maxWidth: '600px', margin: '0 auto'}}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="E.g., I want to see an action movie in space..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
          <button className="btn" style={{width: 'auto', marginTop: 0}} onClick={handleAiRecommend}>
            {loading ? 'Thinking...' : 'Ask AI'}
          </button>
        </div>
        {aiResponse && (
          <div style={{marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '4px solid var(--primary)'}}>
            <p><strong>AI Suggests:</strong> {aiResponse}</p>
          </div>
        )}
      </section>
    </div>
  );
}

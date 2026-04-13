'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [movies, setMovies] = useState([]);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Booking Flow State
  const [bookingMovie, setBookingMovie] = useState(null);
  const [bookingStep, setBookingStep] = useState(0); // 0=none, 1=form, 2=receipt
  const [bName, setBName] = useState('');
  const [bSeats, setBSeats] = useState(1);
  const [bError, setBError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = () => {
    fetch('/api/movies').then(res => res.json()).then(data => setMovies(data));
  };

  const handleAiRecommend = async () => {
    if (!aiPrompt) return;
    setLoading(true); setAiResponse('');
    try {
      const res = await fetch('/api/ai-recommend', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      setAiResponse(data.ai_reply);
    } catch(e) { setAiResponse("AI Service is currently down."); }
    setLoading(false);
  };

  const startBooking = (movie) => {
    setBookingMovie(movie);
    setBName(''); setBSeats(1); setBError(''); setMsg('');
    setBookingStep(1);
  };

  const handleGenerateReceipt = () => {
    if(!bName) { setBError('Please enter your name.'); return; }
    if(bSeats < 1) { setBError('Must book at least 1 seat.'); return; }
    const avail = bookingMovie.available_seats - bookingMovie.booked_seats;
    if(bSeats > avail) { setBError('Not enough seats available.'); return; }
    
    setBError('');
    setBookingStep(2); // Go to receipt
  };

  const handlePayment = async () => {
    // Process Booking API
    try {
      const res = await fetch('/api/book', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id: bookingMovie.id, seats: bSeats })
      });
      if(res.ok) {
        setMsg('Payment Successful & Tickets Booked!');
        fetchMovies(); // reload seats
        setTimeout(() => setBookingStep(0), 3000); // close modal after 3s
      } else {
        const err = await res.json();
        setBError(err.error || 'Booking failed');
      }
    } catch (e) {
      setBError('Error connecting to processing server.');
    }
  };

  return (
    <div>
      <header className="header">
        <h1>DAK's Cinemas</h1>
        <p style={{color: 'var(--text-muted)'}}>IMPROVED AND TWEAKED BY ALI AND KISSA</p>
      </header>

      <section className="glass-panel" style={{marginBottom: '3rem'}}>
        <h2 style={{marginBottom: '1rem'}}>Currently Showing</h2>
        <div className="movie-grid">
          {movies.map(movie => {
            const avail = movie.available_seats - movie.booked_seats;
            return (
              <div key={movie.id} className="movie-card">
                <img src={movie.poster_path} alt={movie.name} className="movie-poster" onError={(e) => e.target.src='/placeholder.jpg'}/>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.name}</h3>
                  <p>Date: {movie.date}</p>
                  <p>Price: ${movie.price}</p>
                  <p>Slots Available: <span style={{color: avail > 0 ? '#4CAF50' : '#FF3366', fontWeight:'600'}}>{avail}</span></p>
                  <button className="btn" onClick={() => startBooking(movie)} disabled={avail <= 0}>
                    {avail > 0 ? 'Book Tickets' : 'Sold Out'}
                  </button>
                </div>
              </div>
            );
          })}
          {movies.length === 0 && <p>Loading database...</p>}
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
          <div style={{marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', borderLeft: '4px solid var(--primary)'}}>
            <p><strong>AI Suggests:</strong> {aiResponse}</p>
          </div>
        )}
      </section>

      {/* Booking Modal Overlay */}
      {bookingStep > 0 && bookingMovie && (
        <div style={{position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="glass-panel" style={{width: '90%', maxWidth: '500px', position: 'relative'}}>
            <button style={{position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem'}} onClick={() => setBookingStep(0)}>✖</button>
            
            {bookingStep === 1 && (
              <>
                <h2 style={{marginBottom: '1.5rem'}}>Book {bookingMovie.name}</h2>
                <div style={{marginBottom: '1rem'}}>
                  <p><strong>Price per ticket:</strong> ${bookingMovie.price}</p>
                  <p><strong>Available Slots:</strong> {bookingMovie.available_seats - bookingMovie.booked_seats}</p>
                </div>
                
                <input className="input-field" placeholder="Enter Your Full Name" value={bName} onChange={e => setBName(e.target.value)}/>
                <input className="input-field" placeholder="Number of Seats" type="number" min="1" value={bSeats} onChange={e => setBSeats(parseInt(e.target.value) || '')}/>
                
                {bName && bSeats > 0 && (
                  <div style={{background: 'rgba(255, 43, 94, 0.15)', padding: '15px', borderRadius: '12px', margin: '1rem 0'}}>
                    <h3 style={{margin: 0}}>Total Price: ${(bookingMovie.price * bSeats).toFixed(2)}</h3>
                  </div>
                )}
                
                {bError && <p style={{color: '#FF2B5E', margin: '10px 0'}}>{bError}</p>}
                
                <button className="btn" style={{background: 'var(--primary)', border: 'none'}} onClick={handleGenerateReceipt}>Generate Receipt</button>
              </>
            )}

            {bookingStep === 2 && (
              <>
                <h2 style={{marginBottom: '1.5rem'}}>Ticket Receipt</h2>
                <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', marginBottom: '1.5rem'}}>
                  <p style={{marginBottom: '10px'}}><span style={{color: 'var(--text-muted)'}}>Name:</span> {bName}</p>
                  <p style={{marginBottom: '10px'}}><span style={{color: 'var(--text-muted)'}}>Movie:</span> {bookingMovie.name}</p>
                  <p style={{marginBottom: '10px'}}><span style={{color: 'var(--text-muted)'}}>Seats Reserved:</span> {bSeats}</p>
                  <hr style={{border: '1px dashed rgba(255,255,255,0.2)', margin: '15px 0'}}/>
                  <h3 style={{margin: 0}}>Total Due: ${(bookingMovie.price * bSeats).toFixed(2)}</h3>
                </div>
                
                {msg ? (
                  <div style={{background: 'rgba(76, 175, 80, 0.2)', padding: '15px', borderRadius: '12px', textAlign: 'center'}}>
                    <p style={{color: '#4CAF50', fontWeight: 'bold'}}>{msg}</p>
                  </div>
                ) : (
                  <>
                    {bError && <p style={{color: '#FF2B5E', margin: '10px 0'}}>{bError}</p>}
                    <button className="btn" onClick={handlePayment}>💳 Proceed to Payment</button>
                    <button className="btn" style={{background: 'transparent', marginTop: '10px'}} onClick={() => setBookingStep(1)}>Go Back</button>
                  </>
                )}
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

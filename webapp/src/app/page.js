'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [user, setUser] = useState(null);
  
  // AI Chat State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChat, setAiChat] = useState([{ sender: 'bot', text: 'Hi! Tell me what you are in the mood for, and I will find the perfect movie!' }]);
  const [loading, setLoading] = useState(false);

  // Booking Flow State
  const [bookingMovie, setBookingMovie] = useState(null);
  const [bookingStep, setBookingStep] = useState(0); // 0=none, 1=seats, 2=receipt, 3=ticket
  const [bName, setBName] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bError, setBError] = useState('');
  const [msg, setMsg] = useState('');
  const [bookedSeatsList, setBookedSeatsList] = useState([]);
  const [bfsCount, setBfsCount] = useState(1);
  const [dijkstraResult, setDijkstraResult] = useState(null);

  // Cinema & Discovery Flow State
  const [cinema, setCinema] = useState('Starstruck Central - New York');
  const [activeMood, setActiveMood] = useState('All');

  // Custom Toast/Banner State
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchMovies();
    const loadedUser = localStorage.getItem('user');
    if (loadedUser) {
      setUser(JSON.parse(loadedUser));
      setBName(JSON.parse(loadedUser).name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setBName('');
  };

  const fetchMovies = () => {
    fetch('/api/movies').then(res => res.json()).then(data => setMovies(data));
  };

  const handleAiRecommend = async (e) => {
    e.preventDefault();
    if (!aiPrompt) return;
    
    const userText = aiPrompt;
    setAiChat(prev => [...prev, { sender: 'user', text: userText }]);
    setAiPrompt('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/ai-recommend', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText })
      });
      const data = await res.json();
      setAiChat(prev => [...prev, { sender: 'bot', text: data.ai_reply }]);
    } catch(err) {
      setAiChat(prev => [...prev, { sender: 'bot', text: "Sorry, my neural link is down right now." }]);
    }
    setLoading(false);
  };

  const startBooking = (movie) => {
    if (!user) {
      showToast('🔒 Access Restricted! You must be logged in to lock specific seats.', 'error');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }
    setBookingMovie(movie);
    setSelectedSeats([]); setTotalPrice(0); setBError(''); setMsg('');
    
    let parsed = [];
    try { parsed = JSON.parse(movie.booked_seats_list || '[]'); } catch(e){}
    setBookedSeatsList(parsed);
    
    setBookingStep(1);
  };

  const toggleSeat = (seatId, premiumMod, ecoMod) => {
    if (bookedSeatsList.includes(seatId)) return; // Locked by another
    
    let newSelection = [...selectedSeats];
    let newTotal = totalPrice;
    const basePrice = bookingMovie.price;
    
    let cost = basePrice;
    if (premiumMod) cost += 5;
    if (ecoMod) cost -= 2;

    if (newSelection.includes(seatId)) {
      newSelection = newSelection.filter(s => s !== seatId);
      newTotal -= cost;
    } else {
      newSelection.push(seatId);
      newTotal += cost;
    }

    setSelectedSeats(newSelection);
    setTotalPrice(newTotal);
  };

  const handleBfsAutoGroup = (numRequired) => {
    if(!numRequired || numRequired < 1) return;
    const Q = [];
    const visited = new Set();
    const R = 8; const C = 8;
    const starts = [[3,3], [3,4], [4,3], [4,4]]; // Screen Center Coordinates
    for(let s of starts) { Q.push(s); visited.add(`${s[0]}-${s[1]}`); }

    const isAvailable = (r, c) => {
      if(r<0||c<0||r>=R||c>=C) return false;
      const seatId = `${rows[r]}${cols[c]}`;
      return !bookedSeatsList.includes(seatId);
    };

    while(Q.length > 0) {
      const [r, c] = Q.shift();
      // Test sliding row window
      for(let startC = c - numRequired + 1; startC <= c; startC++) {
        if (startC < 0 || startC + numRequired - 1 >= C) continue;
        let valid = true;
        let candidateSeats = [];
        for(let i=0; i<numRequired; i++){
          if(!isAvailable(r, startC + i)) { valid = false; break; }
          candidateSeats.push(`${rows[r]}${cols[startC + i]}`);
        }
        if(valid) {
           let newTotal = 0;
           candidateSeats.forEach(sid => {
             let cost = bookingMovie.price;
             if(sid.startsWith('A')||sid.startsWith('B')) cost+=5;
             if(sid.startsWith('G')||sid.startsWith('H')) cost-=2;
             newTotal += cost;
           });
           setSelectedSeats(candidateSeats);
           setTotalPrice(newTotal);
           showToast(`🤖 Radial BFS algorithm successfully extracted ${numRequired} grouped optimal seats!`, 'success');
           return;
        }
      }

      // Add neighbors to Queue
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
      for(let d of dirs) {
        const nr = r + d[0]; const nc = c + d[1];
        if(nr>=0 && nr<R && nc>=0 && nc<C && !visited.has(`${nr}-${nc}`)) {
          visited.add(`${nr}-${nc}`);
          Q.push([nr, nc]);
        }
      }
    }
    showToast(`🤖 Matrix Capacity Error: BFS could not find ${numRequired} seats physically grouped!`, 'error');
  };

  const executeDijkstra = async (movie) => {
    setBookingMovie(movie);
    setBookingStep(4);
    setDijkstraResult(null);
    try {
      const res = await fetch('/api/dijkstra', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ sourceCinema: cinema })
      });
      const data = await res.json();
      setDijkstraResult(data);
    } catch(e) {
      setDijkstraResult({ error: 'Graph Traversal Runtime Exception' });
    }
  };

  const handleGenerateReceipt = () => {
    if(!bName) { setBError('Please enter your name.'); return; }
    if(selectedSeats.length < 1) { setBError('Please select at least 1 seat from the map.'); return; }
    
    setBError('');
    setBookingStep(2); // Go to receipt confirmation
  };

  const handlePayment = async () => {
    try {
      const res = await fetch('/api/book', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id: bookingMovie.id, seatIds: selectedSeats })
      });
      if(res.ok) {
        setMsg('Payment Successful!');
        fetchMovies(); 
        setBookingStep(3); // Go to Ticket Download
      } else {
        const err = await res.json();
        setBError(err.error || 'Server rejected booking due to conflict.');
      }
    } catch (e) {
      setBError('Error connecting to processing server.');
    }
  };

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  // 1. Personalized 'Because You Watched' Algorithm
  let favoriteGenre = null;
  if (user && movies.length > 0) {
     const pastBookings = movies.filter(m => {
       try { return JSON.parse(m.booked_seats_list || '[]').length > 0; } catch(e){} return false;
     });
     if (pastBookings.length > 0) {
       favoriteGenre = pastBookings[0].genre; // Simplified extraction
     }
  }

  // Handle Mood Filtering + Personalization Sorting
  let renderMovies = movies;
  if (activeMood !== 'All') {
    renderMovies = renderMovies.filter(m => m.genre === activeMood);
  } else if (favoriteGenre) {
    // Bring favorite genres to the front!
    renderMovies = [...renderMovies].sort((a,b) => (a.genre === favoriteGenre ? -1 : 1) - (b.genre === favoriteGenre ? -1 : 1));
  }

  return (
    <div className="container">
      
      {/* Trendy SVG Gradient Definition mapped to globals.css */}
      <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="100%" stopColor="#FF2B5E" />
        </linearGradient>
      </svg>

      {/* Global Interactive Banners */}
      {toast && (
        <div className="toast-container no-print">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'error' ? '⚠️' : '✅'} <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <nav className="nav" style={{ marginBottom: '2rem', borderRadius: '0 0 16px 16px' }}>
        <div className="trendy-logo" style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
          <svg className="trendy-logo-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.95,6.05l-1.41-1.41L17,6.17L15.59,4.76L14.17,6.17L12.76,4.76L11.34,6.17L9.93,4.76L8.51,6.17L7.1,4.76 L5.68,6.17L4.27,4.76L2.86,6.17C2.32,6.71,2,7.48,2,8.29V17h20V8.29C22,7.48,21.68,6.71,19.95,6.05z M20,15H4V8.29 C4,8.02,4.1,7.77,4.29,7.59l1.39-1.39l1.41,1.41l1.41-1.41l1.41,1.41l1.41-1.41l1.41,1.41l1.41-1.41l1.41,1.41l1.41-1.41 l1.39,1.39C19.9,7.77,20,8.02,20,8.29V15z" />
            <path d="M7,10h2v2H7V10z M11,10h2v2h-2V10z M15,10h2v2h-2V10z" />
          </svg>
          <span style={{letterSpacing: '-1.5px', textTransform: 'uppercase'}}>Starstruck Cinemas</span>
        </div>
        <div className="no-print">
          {user ? (
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span>Hello, <strong>{user.name}</strong></span>
              <span style={{ background: 'rgba(255, 215, 0, 0.2)', color: 'gold', padding: '4px 10px', borderRadius: '12px', fontSize: '0.9rem' }}>★ {user.reward_points} pts</span>
              <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem 1rem', marginTop: 0, width: 'auto' }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => router.push('/login')} className="btn" style={{ padding: '0.5rem 1rem', marginTop: 0, width: 'auto', background: 'transparent' }}>Login</button>
              <button onClick={() => router.push('/signup')} className="btn" style={{ padding: '0.5rem 1rem', marginTop: 0, width: 'auto', background: 'var(--primary)', border: 'none' }}>Sign Up</button>
            </div>
          )}
        </div>
      </nav>

      <header className="header no-print" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img 
          src="/background.jpg" 
          alt="Starstruck Cinemas Logo" 
          style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(255, 43, 94, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '1rem',
            objectFit: 'contain'
          }} 
        />
        <p style={{color: 'var(--text-muted)'}}>THEATER MANAGEMENT PLATFORM • AI ENHANCED</p>
      </header>

      {favoriteGenre && activeMood === 'All' && (
        <div className="no-print" style={{background: 'rgba(10, 132, 255, 0.1)', borderLeft: '4px solid #0A84FF', padding: '15px 20px', borderRadius: '12px', marginBottom: '20px'}}>
           <h3 style={{margin: 0, fontSize: '1.1rem'}}>🍿 Because you booked {favoriteGenre} movies:</h3>
           <p style={{margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem'}}>We've sorted your top recommendations to match your historical viewing profile!</p>
        </div>
      )}

      <section className="glass-panel no-print" style={{marginBottom: '3rem'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['All', 'Action', 'Sci-Fi', 'Comedy', 'Drama'].map(mood => (
              <button 
                key={mood} 
                onClick={() => setActiveMood(mood)}
                style={{
                  background: activeMood === mood ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  border: 'none', color: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', transition: '0.3s'
                }}
              >
                {mood}
              </button>
            ))}
          </div>

          <select 
            className="input-field" 
            style={{ width: 'auto', margin: 0, padding: '0.6rem 1rem', cursor: 'pointer', borderRadius: '20px' }}
            value={cinema}
            onChange={(e) => setCinema(e.target.value)}
          >
            <option style={{color:'black'}} value="Starstruck Central - New York">Starstruck Central</option>
            <option style={{color:'black'}} value="Starstruck Luxe - Los Angeles">Starstruck Luxe</option>
            <option style={{color:'black'}} value="Starstruck IMAX - Queens">Starstruck IMAX</option>
            <option style={{color:'black'}} value="Starstruck Hub - Brooklyn">Starstruck Hub</option>
            <option style={{color:'black'}} value="Starstruck North - Bronx">Starstruck North</option>
          </select>
        </div>

        <div className="movie-grid">
          {renderMovies.map(movie => {
            const avail = movie.available_seats - movie.booked_seats;
            const finalPrice = Math.max(0, movie.price - 2 + (movie.surge_price || 0));

            return (
              <div key={movie.id} className="movie-card">
                {movie.surge_price > 0 && (
                  <div style={{position: 'absolute', top: 15, right: 15, zIndex: 10, background: '#FF3B30', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold'}}>
                    High Demand 📈
                  </div>
                )}
                <img src={movie.poster_path} alt={movie.name} className="movie-poster" onError={(e) => e.target.src='/placeholder.jpg'}/>
                <div className="movie-info">
                  <div>
                    <h3 className="movie-title">{movie.name}</h3>
                    <p style={{fontSize: '0.85rem', color:'var(--text-muted)'}}>{movie.genre} • {movie.date}</p>
                    
                    {movie.ai_consensus && (
                      <p style={{fontSize: '0.8rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', marginTop: '10px', borderLeft: '2px solid gold'}}>
                        {movie.ai_consensus}
                      </p>
                    )}

                    <p style={{marginTop: '15px'}}>Starting at: <strong>${finalPrice}</strong> {movie.surge_price > 0 && <span style={{color: '#FF3B30', fontSize: '0.8rem'}}> (Surge Pricing applied)</span>}</p>
                    <p>Slots Available: <span style={{color: avail > 0 ? '#4CAF50' : '#FF3366', fontWeight:'600'}}>{avail}</span></p>
                  </div>
                  <button 
                    className="btn" 
                    onClick={() => avail > 0 ? startBooking(movie) : executeDijkstra(movie)} 
                    style={{ background: avail > 0 ? 'var(--primary)' : '#FF9933' }}
                  >
                    {avail > 0 ? 'Pick Seats' : 'Find via Dijkstra 🔭'}
                  </button>
                </div>
              </div>
            );
          })}
          {renderMovies.length === 0 && <p style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2rem'}}>No movies match your mood!</p>}
        </div>
      </section>

      {/* Booking Modal Overlay */}
      {bookingStep > 0 && bookingMovie && (
        <div className="printable-modal" style={{position: bookingStep === 3 ? 'static' : 'fixed', top:0, left:0, right:0, bottom:0, background: bookingStep === 3 ? 'transparent' : 'rgba(0,0,0,0.8)', backdropFilter: bookingStep === 3 ? 'none' : 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="glass-panel" style={{width: '95%', maxWidth: '550px', position: 'relative', maxHeight: '95vh', overflowY: 'auto'}}>
            {bookingStep !== 3 && <button className="no-print" style={{position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem'}} onClick={() => setBookingStep(0)}>✖</button>}
            
            {bookingStep === 1 && (
              <>
                <h2 style={{marginBottom: '1rem', fontSize: '1.5rem'}}>Select Seats: {bookingMovie.name}</h2>
                <div style={{marginBottom: '1rem'}}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color:'var(--text-muted)' }}>
                    <span><span style={{color:'gold'}}>■</span> VIP (+£5)</span>
                    <span><span style={{color:'#007AFF'}}>■</span> Regular</span>
                    <span><span style={{color:'#34C759'}}>■</span> Eco (-£2)</span>
                    <span><span style={{color:'#FF3B30'}}>■</span> Lock</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                  <input type="number" min="1" max="8" className="input-field" style={{margin: 0, width: '80px'}} value={bfsCount} onChange={e=>setBfsCount(parseInt(e.target.value))}/>
                  <button className="btn" style={{margin: 0, padding: '0.6rem', flex: 1}} onClick={() => handleBfsAutoGroup(bfsCount)}>🤖 BFS Auto-Group Focus</button>
                </div>
                
                <div style={{ background: '#111', padding: '10px', borderRadius: '12px', width: '100%', marginBottom: '1.5rem', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', marginBottom: '15px', boxShadow: '0 5px 15px rgba(255,255,255,0.2)' }}>SCREEN</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gap: '3px', width: '100%' }}>
                    {rows.map((r, rIndex) => 
                      cols.map((c) => {
                        const seatId = `${r}${c}`;
                        const isBooked = bookedSeatsList.includes(seatId);
                        const isSelected = selectedSeats.includes(seatId);
                        
                        let bgColor = '#007AFF'; 
                        const isVip = r === 'A' || r === 'B';
                        const isEco = r === 'G' || r === 'H';
                        if (isVip) bgColor = 'gold';
                        if (isEco) bgColor = '#34C759';
                        if (isSelected) bgColor = '#FFF';
                        if (isBooked) bgColor = '#FF3B30';

                        return (
                          <div 
                            key={seatId} 
                            onClick={() => toggleSeat(seatId, isVip, isEco)}
                            style={{
                              background: bgColor,
                              color: isSelected ? '#000' : (isBooked ? '#FFF' : '#333'),
                              padding: '5px 2px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              cursor: isBooked ? 'not-allowed' : 'pointer',
                              opacity: isBooked ? 0.5 : 1,
                              border: isSelected ? '2px solid #FF2B5E' : 'none'
                            }}
                          >
                            {seatId}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
                
                <input className="input-field" placeholder="Booking Name" value={bName} onChange={e => setBName(e.target.value)} disabled/>
                
                {selectedSeats.length > 0 && (
                  <div style={{background: 'rgba(255, 43, 94, 0.15)', padding: '15px', borderRadius: '12px', margin: '1rem 0'}}>
                    <p style={{margin: 0, fontSize: '0.9rem'}}>Seats: <strong>{selectedSeats.join(', ')}</strong></p>
                    <h3 style={{margin: '5px 0 0'}}>Total: ${totalPrice.toFixed(2)}</h3>
                  </div>
                )}
                
                {bError && <p style={{color: '#FF2B5E', margin: '10px 0'}}>{bError}</p>}
                <button className="btn" style={{background: 'var(--primary)', border: 'none'}} onClick={handleGenerateReceipt}>Review Checkout</button>
              </>
            )}

            {bookingStep === 2 && (
              <>
                <h2 style={{marginBottom: '1rem'}}>Confirm Transaction</h2>
                <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', marginBottom: '1.5rem', fontSize: '0.9rem'}}>
                  <p style={{marginBottom: '10px'}}><span style={{color: 'var(--text-muted)'}}>Name:</span> {bName}</p>
                  <p style={{marginBottom: '10px'}}><span style={{color: 'var(--text-muted)'}}>Movie:</span> {bookingMovie.name}</p>
                  <p style={{marginBottom: '10px'}}><span style={{color: 'var(--text-muted)'}}>Location:</span> {cinema}</p>
                  <p style={{marginBottom: '10px'}}><span style={{color: 'var(--text-muted)'}}>Locked Seats:</span> {selectedSeats.join(', ')}</p>
                  <hr style={{border: '1px dashed rgba(255,255,255,0.2)', margin: '15px 0'}}/>
                  <h3 style={{margin: 0}}>Final Payment: ${totalPrice.toFixed(2)}</h3>
                </div>
                
                {bError && <p style={{color: '#FF2B5E', margin: '10px 0'}}>{bError}</p>}
                <button className="btn" onClick={handlePayment}>💳 Pay Now</button>
                <button className="btn" style={{background: 'transparent', marginTop: '10px'}} onClick={() => setBookingStep(1)}>Modify Seats</button>
              </>
            )}

            {bookingStep === 3 && (
              <div id="pdf-ticket" style={{textAlign: 'center'}}>
                <h2 style={{color: '#4CAF50', marginBottom: '1rem'}} className="no-print">Ticket Secured!</h2>
                
                <div style={{background: 'white', color: 'black', padding: '1.5rem', borderRadius: '16px', border: '2px solid #ccc', margin: '0 auto', maxWidth: '400px'}}>
                  <h1 style={{fontSize: '1.3rem', marginBottom: '0.5rem'}}>{bookingMovie.name}</h1>
                  <h3 style={{color: '#666', fontSize:'1rem', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '10px'}}>{cinema}</h3>
                  <div style={{textAlign: 'left', fontSize: '0.9rem'}}>
                    <p><strong>Name:</strong> {bName}</p>
                    <p><strong>Date:</strong> {bookingMovie.date}</p>
                    <p><strong>Seats:</strong> {selectedSeats.join(', ')}</p>
                    <p><strong>Paid:</strong> ${totalPrice.toFixed(2)}</p>
                  </div>
                  
                  <div style={{marginTop: '15px', display: 'flex', justifyContent: 'center'}}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=Ticket:${bName}-${bookingMovie.name}-${selectedSeats.join('')}`} alt="QR Code" width="120" height="120" />
                  </div>
                  <p style={{fontSize: '0.7rem', marginTop: '10px', color: '#888'}}>Scan for entry</p>
                </div>
                
                <button className="btn no-print" onClick={() => window.print()} style={{background: '#007AFF', marginTop: '20px'}}>🖨️ Download PDF</button>
                <button className="btn no-print" onClick={() => { setBookingStep(0); setBookingMovie(null); }} style={{background: 'transparent', marginTop: '10px'}}>Close</button>
              </div>
            )}
            {bookingStep === 4 && (
              <div style={{textAlign: 'center', padding: '20px'}}>
                <h2 style={{color: '#FF9933', marginBottom: '1rem'}}>Graph Traversal Engine 🗺️</h2>
                <p style={{color: 'var(--text-muted)'}}>Executing Dijkstra's Algorithm mapping alternative inventory networks for: <strong>{bookingMovie.name}</strong></p>
                
                {!dijkstraResult ? (
                  <div style={{padding: '40px', fontSize: '2rem'}}>⚗️ Calculating Shortest Paths...</div>
                ) : dijkstraResult.error ? (
                  <div style={{padding: '20px', color: '#FF3B30'}}>{dijkstraResult.error}</div>
                ) : (
                  <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', marginTop: '20px', border: '1px solid rgba(255,153,51,0.3)', textAlign: 'left'}}>
                    <h3 style={{color: '#34C759'}}>✓ Lowest Graph Edge Cost Extracted!</h3>
                    <p style={{fontSize: '1.1rem', marginTop: '10px'}}>Optimal Branch: <strong>{dijkstraResult.destination}</strong></p>
                    <p style={{fontFamily: 'monospace', margin: '10px 0', background: '#000', padding: '10px', borderRadius: '8px', color: '#0A84FF'}}>
                      Shortest Path Vector:<br/> {dijkstraResult.path.join(' ➔ ')}<br/><br/>
                      Total Cost: {dijkstraResult.distance} Miles
                    </p>
                    <p style={{fontWeight: 'bold', marginTop: '15px'}}>Reservations Detected: <span style={{color: 'gold'}}>{dijkstraResult.reserve_seats_found} seats available!</span></p>
                    
                    <button className="btn" style={{marginTop: '20px', background: '#FF2B5E'}} onClick={() => { setCinema(dijkstraResult.destination); setBookingStep(0); fetchMovies(); showToast(`Relocating matrix context to ${dijkstraResult.destination}`); }}>
                      Jump to Branch Node
                    </button>
                  </div>
                )}
                
                <button className="btn" style={{background: 'transparent', marginTop: '15px'}} onClick={() => setBookingStep(0)}>Cancel Traversal</button>
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* Floating AI Chatbot */}
      <div className="floating-ai no-print">
        {aiOpen && (
          <div className="ai-window">
            <div className="ai-header">
              <span>🤖 Cinema AI Guide</span>
              <span style={{cursor:'pointer'}} onClick={() => setAiOpen(false)}>✖</span>
            </div>
            <div className="ai-body">
              {aiChat.map((msg, i) => (
                <div key={i} className={`ai-msg ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              {loading && <div className="ai-msg bot" style={{opacity: 0.7}}>Analyzing cinema matrix...</div>}
            </div>
            <form onSubmit={handleAiRecommend} className="ai-input-area">
              <input 
                className="ai-input" 
                placeholder="Ask me for movie ideas..." 
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
              />
              <button type="submit" className="btn" style={{marginTop: 0, width: 'auto', padding: '8px 15px', background: 'var(--primary)', border: 'none'}}>➤</button>
            </form>
          </div>
        )}
        <button className="ai-toggle" onClick={() => setAiOpen(!aiOpen)}>
          {aiOpen ? '✖' : '🤖'}
        </button>
      </div>

      <style jsx global>{`
        .floating-ai { position: fixed; bottom: 20px; right: 20px; z-index: 999; }
        .ai-toggle { width: 60px; height: 60px; border-radius: 50%; background: var(--primary); border: none; color: white; font-size: 1.5rem; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        .ai-window { width: 320px; height: 450px; background: #1a1a1a; border-radius: 16px; display: flex; flex-direction: column; margin-bottom: 10px; border: 1px solid #333; overflow: hidden; }
        .ai-header { padding: 15px; background: #222; display: flex; justify-content: space-between; font-weight: bold; }
        .ai-body { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
        .ai-msg { padding: 10px; border-radius: 10px; font-size: 0.9rem; max-width: 85%; }
        .ai-msg.bot { background: #333; align-self: flex-start; }
        .ai-msg.user { background: var(--primary); align-self: flex-end; }
        .ai-input-area { padding: 10px; display: flex; gap: 5px; background: #222; }
        .ai-input { flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #444; background: #000; color: white; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .printable-modal { position: static !important; background: white !important; }
          .glass-panel { box-shadow: none !important; border: none !important; margin: 0 !important; width: 100% !important; background: white !important; }
        }
      `}</style>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', available_seats: '', date: '', showtime: '', cinema_location: 'Starstruck Central - New York', poster_path: '', genre: 'General' });
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchMovies();
    }
  }, [isAuthenticated]);

  const fetchMovies = () => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => setMovies(data));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm)
    });
    const data = await res.json();
    if (data.success) {
      setIsAuthenticated(true);
    } else {
      setAuthError(data.message || 'Invalid Credentials');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ name: '', price: '', available_seats: '', date: '', showtime: '', cinema_location: 'Starstruck Central - New York', poster_path: '', genre: 'General' });
    fetchMovies();
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '2rem' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 600 }}>Admin Access</h2>
          <form onSubmit={handleLogin}>
            <input className="input-field" placeholder="Admin ID" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} required/>
            <input className="input-field" placeholder="Password" type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required/>
            {authError && <p style={{ color: '#FF2B5E', marginBottom: '1rem', textAlign: 'center' }}>{authError}</p>}
            <button className="btn" type="submit">Verify Credentials</button>
          </form>
        </div>
        <a href="/" style={{ color: '#FF2B5E', textDecoration: 'none', fontWeight: 600, border: '1px solid #FF2B5E', padding: '8px 16px', borderRadius: '20px' }}>
          ← Back to Movies
        </a>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Admin Control Panel</h1>
        <a href="/" style={{ color: '#FF2B5E', textDecoration: 'none', fontWeight: 600, border: '1px solid #FF2B5E', padding: '8px 16px', borderRadius: '20px' }}>
          ← Back to Movies
        </a>
      </div>
      
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '2rem'}}>
        <div className="glass-panel" style={{flex: '1 1 300px', alignSelf: 'start'}}>
          <h3 style={{marginBottom: '1rem'}}>Add Show</h3>
          <form onSubmit={handleAdd}>
            <input className="input-field" placeholder="Movie Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required/>
            <input className="input-field" placeholder="Ticket Price" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required/>
            <input className="input-field" placeholder="Seat Capacity" type="number" value={form.available_seats} onChange={e => setForm({...form, available_seats: e.target.value})} required/>
            <input className="input-field" placeholder="Date (e.g. 2026-05-10)" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required/>
            <input className="input-field" placeholder="Time (e.g. 18:00)" type="time" value={form.showtime} onChange={e => setForm({...form, showtime: e.target.value})} required/>
            <input className="input-field" placeholder="Genre (e.g. Action, Drama)" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} required/>
            <select className="input-field" value={form.cinema_location} onChange={e => setForm({...form, cinema_location: e.target.value})} required style={{cursor: 'pointer'}}>
              <option style={{color:'black'}} value="Starstruck Central - New York">Starstruck Central - New York</option>
              <option style={{color:'black'}} value="Starstruck Luxe - Los Angeles">Starstruck Luxe - Los Angeles</option>
              <option style={{color:'black'}} value="Starstruck IMAX - Queens">Starstruck IMAX - Queens</option>
              <option style={{color:'black'}} value="Starstruck North - Bronx">Starstruck North - Bronx</option>
              <option style={{color:'black'}} value="Starstruck Hub - Brooklyn">Starstruck Hub - Brooklyn</option>
            </select>
            <input className="input-field" placeholder="Poster Image URL (optional)" value={form.poster_path} onChange={e => setForm({...form, poster_path: e.target.value})}/>
            <button className="btn" type="submit">Deploy to Database</button>
          </form>
        </div>

        <div className="glass-panel" style={{flex: '2 1 500px', overflowX: 'auto'}}>
          <h3 style={{marginBottom: '1rem'}}>Secure Database View</h3>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px'}}>
            <thead>
              <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)'}}>
                <th style={{padding: '12px 10px'}}>Name</th>
                <th style={{padding: '12px 10px'}}>Genre & Time</th>
                <th style={{padding: '12px 10px'}}>Location</th>
                <th style={{padding: '12px 10px'}}>Price</th>
                <th style={{padding: '12px 10px'}}>Available</th>
                <th style={{padding: '12px 10px'}}>Bookings</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(m => (
                <tr key={m.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s'}}>
                  <td style={{padding: '12px 10px', fontWeight: 500}}>{m.name}</td>
                  <td style={{padding: '12px 10px'}}>{m.genre}<br/><span style={{fontSize: '0.8rem', color: '#aaa'}}>{m.date} {m.showtime}</span></td>
                  <td style={{padding: '12px 10px', fontSize: '0.85rem'}}>{m.cinema_location}</td>
                  <td style={{padding: '12px 10px'}}>Rs. {m.price}</td>
                  <td style={{padding: '12px 10px'}}>{m.available_seats}</td>
                  <td style={{padding: '12px 10px', color: m.booked_seats > 0 ? '#FF2B5E' : 'inherit'}}>{m.booked_seats}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

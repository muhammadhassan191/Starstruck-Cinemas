'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', available_seats: '', date: '', poster_path: '' });
  
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
    setForm({ name: '', price: '', available_seats: '', date: '', poster_path: '' });
    fetchMovies();
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 600 }}>Admin Access</h2>
          <form onSubmit={handleLogin}>
            <input className="input-field" placeholder="Admin ID" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} required/>
            <input className="input-field" placeholder="Password" type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required/>
            {authError && <p style={{ color: '#FF2B5E', marginBottom: '1rem', textAlign: 'center' }}>{authError}</p>}
            <button className="btn" type="submit">Verify Credentials</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{marginBottom: '2rem'}}>Admin Control Panel</h1>
      
      <div style={{display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem'}}>
        <div className="glass-panel" style={{alignSelf: 'start'}}>
          <h3 style={{marginBottom: '1rem'}}>Add Show</h3>
          <form onSubmit={handleAdd}>
            <input className="input-field" placeholder="Movie Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required/>
            <input className="input-field" placeholder="Ticket Price" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required/>
            <input className="input-field" placeholder="Seat Capacity" type="number" value={form.available_seats} onChange={e => setForm({...form, available_seats: e.target.value})} required/>
            <input className="input-field" placeholder="Date (e.g. 2026-05-10)" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required/>
            <input className="input-field" placeholder="Poster Image URL (optional)" value={form.poster_path} onChange={e => setForm({...form, poster_path: e.target.value})}/>
            <button className="btn" type="submit">Deploy to Database</button>
          </form>
        </div>

        <div className="glass-panel" style={{overflowX: 'auto'}}>
          <h3 style={{marginBottom: '1rem'}}>Secure Database View</h3>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px'}}>
            <thead>
              <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)'}}>
                <th style={{padding: '12px 10px'}}>ID</th>
                <th style={{padding: '12px 10px'}}>Name</th>
                <th style={{padding: '12px 10px'}}>Price</th>
                <th style={{padding: '12px 10px'}}>Seats</th>
                <th style={{padding: '12px 10px'}}>Bookings</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(m => (
                <tr key={m.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s'}}>
                  <td style={{padding: '12px 10px'}}>{m.id}</td>
                  <td style={{padding: '12px 10px', fontWeight: 500}}>{m.name}</td>
                  <td style={{padding: '12px 10px'}}>${m.price}</td>
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

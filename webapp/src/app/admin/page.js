'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', available_seats: '', date: '' });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = () => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => setMovies(data));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ name: '', price: '', available_seats: '', date: '' });
    fetchMovies();
  };

  return (
    <div>
      <h1 style={{marginBottom: '2rem'}}>Admin Dashboard</h1>
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem'}}>
        <div className="glass-panel">
          <h3>Add New Movie</h3>
          <form onSubmit={handleAdd} style={{marginTop: '1rem'}}>
            <input className="input-field" placeholder="Movie Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required/>
            <input className="input-field" placeholder="Price" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required/>
            <input className="input-field" placeholder="Available Seats" type="number" value={form.available_seats} onChange={e => setForm({...form, available_seats: e.target.value})} required/>
            <input className="input-field" placeholder="Date (e.g. 2026-05-10)" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required/>
            <button className="btn" type="submit">Add Movie to Database</button>
          </form>
        </div>

        <div className="glass-panel">
          <h3>Database (SQLite) View</h3>
          <table style={{width: '100%', marginTop: '1rem', borderCollapse: 'collapse', textAlign: 'left'}}>
            <thead>
              <tr style={{borderBottom: '1px solid rgba(255,255,255,0.2)'}}>
                <th style={{padding: '10px'}}>ID</th>
                <th style={{padding: '10px'}}>Name</th>
                <th style={{padding: '10px'}}>Price</th>
                <th style={{padding: '10px'}}>Seats Available</th>
                <th style={{padding: '10px'}}>Booked</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(m => (
                <tr key={m.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                  <td style={{padding: '10px'}}>{m.id}</td>
                  <td style={{padding: '10px'}}>{m.name}</td>
                  <td style={{padding: '10px'}}>${m.price}</td>
                  <td style={{padding: '10px'}}>{m.available_seats}</td>
                  <td style={{padding: '10px'}}>{m.booked_seats}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

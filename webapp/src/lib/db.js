import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

export async function openDB() {
  if (db) return db;
  const dbPath = path.join(process.cwd(), 'cinema.db');
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      preference_data TEXT DEFAULT '{}',
      reward_points INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS Cinemas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Screens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cinema_id INTEGER,
      name TEXT NOT NULL,
      FOREIGN KEY(cinema_id) REFERENCES Cinemas(id)
    );

    CREATE TABLE IF NOT EXISTS Movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      available_seats INTEGER NOT NULL,
      booked_seats INTEGER DEFAULT 0,
      date TEXT NOT NULL,
      poster_path TEXT,
      genre TEXT DEFAULT 'General',
      rating REAL DEFAULT 0.0
    );

    CREATE TABLE IF NOT EXISTS Showtimes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER,
      screen_id INTEGER,
      start_time TEXT NOT NULL,
      base_price INTEGER,
      FOREIGN KEY(movie_id) REFERENCES Movies(id),
      FOREIGN KEY(screen_id) REFERENCES Screens(id)
    );
    
    CREATE TABLE IF NOT EXISTS Reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER,
      text TEXT,
      FOREIGN KEY(movie_id) REFERENCES Movies(id)
    );
    
    CREATE TABLE IF NOT EXISTS Admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS CinemaRoutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      destination TEXT NOT NULL,
      distance_miles INTEGER NOT NULL
    );
  `);

  const admin = await db.get("SELECT * FROM Admins WHERE username = 'admin'");
  if (!admin) {
    await db.run("INSERT INTO Admins (username, password) VALUES ('admin', 'admin123')");
  }

  const countMovies = await db.get("SELECT COUNT(*) as c FROM Movies");
  if (countMovies.c === 0) {
    // Hollywood
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path, genre) VALUES ('Spider-Man: No Way Home', 15, 120, '2026-06-01', 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQSdnOkKE9dBN68bYDK4FNPszoUkeG4X7XCJCTsgpfCP-EY9GIx', 'Action')");
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path, genre) VALUES ('Dune: Part Two', 20, 200, '2026-06-15', 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRBu8Gzdygf5OOqBJUIJ3-ZxiPbLh62OhvLmtOvuR7x2gF3DucU', 'Sci-Fi')");
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path, genre) VALUES ('Inception', 12, 80, '2026-07-04', 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQovCe0H45fWwAtV31ajOdXRPTxSsMQgPIQ3lcZX_mAW0jXV3kH', 'Sci-Fi')");
    // Bollywood
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path, genre) VALUES ('3 Idiots', 10, 100, '2026-05-20', 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQV7sONOx4fl1xq9CbdWUmcTamWwzrPMzqKhZOGHh-V0zHpn0Ly', 'Comedy')");
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path, genre) VALUES ('Dangal', 14, 150, '2026-05-25', 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQMCj20Dhxm40PDsgiS1lMZaNj8lepMfMv9zn3LsbwLWu2ovzUk', 'Drama')");
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path, genre) VALUES ('Jawan', 18, 250, '2026-06-10', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA8fxJgOk6Q4UGjmsa1q3CQ1Q05Lt0Dn1leAl6_KexCEjqJAe6', 'Action')");

    // Phase 5 Route Overload: Force a sold out movie for Dijkstra validation testing
    await db.run("INSERT INTO Movies (name, price, available_seats, booked_seats, date, poster_path, genre) VALUES ('The Matrix (SOLD OUT TEST)', 20, 64, 64, '2026-10-10', 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQovCe0H45fWwAtV31ajOdXRPTxSsMQgPIQ3lcZX_mAW0jXV3kH', 'Sci-Fi')");
  }

  // Phase 4: AI Reviews Seeding
  const countReviews = await db.get("SELECT COUNT(*) as c FROM Reviews");
  if (countReviews.c === 0) {
    const reviewsToSeed = [
      "INSERT INTO Reviews (movie_id, text) VALUES (1, 'Amazing web-swinging visuals but the pacing gets slow in the second act.')",
      "INSERT INTO Reviews (movie_id, text) VALUES (1, 'Incredible action, visually stunning! Def slow towards the middle.')",
      "INSERT INTO Reviews (movie_id, text) VALUES (2, 'The world building is massive and visuals are breathtaking. Sometimes confusing story.')",
      "INSERT INTO Reviews (movie_id, text) VALUES (2, 'Breathtaking visuals. Soundtrack is wild.')",
      "INSERT INTO Reviews (movie_id, text) VALUES (3, 'A masterpiece plot, very confusing but visually amazing.')",
      "INSERT INTO Reviews (movie_id, text) VALUES (4, 'Hilarious and heartwarming. Perfect pacing.')",
      "INSERT INTO Reviews (movie_id, text) VALUES (5, 'Extremely motivational and well acted.')",
      "INSERT INTO Reviews (movie_id, text) VALUES (6, 'Non-stop action, incredible stunts but the story suffers a bit.')"
    ];
    for(let r of reviewsToSeed) await db.run(r);
  }

  // Initial Multi-Cinema & Algorithms Seeding
  const countCinemas = await db.get("SELECT COUNT(*) as c FROM Cinemas");
  if(countCinemas.c === 0){
    // Node Locations
    await db.run("INSERT INTO Cinemas (name, location) VALUES ('Starstruck Central - New York', 'New York')");
    await db.run("INSERT INTO Cinemas (name, location) VALUES ('Starstruck Luxe - Los Angeles', 'Los Angeles')");
    await db.run("INSERT INTO Cinemas (name, location) VALUES ('Starstruck IMAX - Queens', 'Queens')");
    await db.run("INSERT INTO Cinemas (name, location) VALUES ('Starstruck North - Bronx', 'Bronx')");
    await db.run("INSERT INTO Cinemas (name, location) VALUES ('Starstruck Hub - Brooklyn', 'Brooklyn')");

    // Bidirectional Graph Edges (Distances in miles)
    const routes = [
      // Central routing
      ['Starstruck Central - New York', 'Starstruck Hub - Brooklyn', 5],
      ['Starstruck Central - New York', 'Starstruck IMAX - Queens', 8],
      ['Starstruck Central - New York', 'Starstruck North - Bronx', 15],
      // Queens routing
      ['Starstruck IMAX - Queens', 'Starstruck Hub - Brooklyn', 6],
      ['Starstruck IMAX - Queens', 'Starstruck North - Bronx', 10],
      // Los Angeles routing (isolated sub-graph mock for distance scaling)
      ['Starstruck Central - New York', 'Starstruck Luxe - Los Angeles', 2800]
    ];
    for(let edge of routes) {
      await db.run("INSERT INTO CinemaRoutes (source, destination, distance_miles) VALUES (?, ?, ?)", [edge[0], edge[1], edge[2]]);
      await db.run("INSERT INTO CinemaRoutes (source, destination, distance_miles) VALUES (?, ?, ?)", [edge[1], edge[0], edge[2]]); // Reverse path
    }
  }

  // Phase 2 Migration (Safe append)
  try {
    await db.exec("ALTER TABLE Movies ADD COLUMN booked_seats_list TEXT DEFAULT '[]';");
  } catch(e) {
    // Column already exists, safe to continue
  }

  return db;
}

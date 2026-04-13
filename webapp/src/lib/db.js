import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

export async function openDB() {
  if (db) return db;
  // Initialize db at project root to act as shared db.
  const dbPath = path.join(process.cwd(), 'cinema.db');
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Init tables and default data
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      available_seats INTEGER NOT NULL,
      booked_seats INTEGER DEFAULT 0,
      date TEXT NOT NULL,
      poster_path TEXT
    );
    
    CREATE TABLE IF NOT EXISTS Admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL
    );
  `);

  // Default Admin
  const admin = await db.get("SELECT * FROM Admins WHERE username = 'admin'");
  if (!admin) {
    await db.run("INSERT INTO Admins (username, password) VALUES ('admin', 'admin123')");
  }

  // Default Movies
  const count = await db.get("SELECT COUNT(*) as c FROM Movies");
  if (count.c === 0) {
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('Spiderman', 15, 100, '2026-05-01', '/posters/spiderman.jpg')");
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('Avengers', 20, 150, '2026-05-05', '/posters/avengers.jpg')");
  }

  return db;
}

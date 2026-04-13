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

  const admin = await db.get("SELECT * FROM Admins WHERE username = 'admin'");
  if (!admin) {
    await db.run("INSERT INTO Admins (username, password) VALUES ('admin', 'admin123')");
  }

  const count = await db.get("SELECT COUNT(*) as c FROM Movies");
  if (count.c === 0) {
    // Hollywood
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('Spider-Man: No Way Home', 15, 120, '2026-06-01', 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1ZrsNdGELTXQgw.jpg')");
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('Dune: Part Two', 20, 200, '2026-06-15', 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2IGpbunSj.jpg')");
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('Inception', 12, 80, '2026-07-04', 'https://image.tmdb.org/t/p/w500/8kOWDBK6XlPUzckuHDo3xWVRJ1M.jpg')");
    // Bollywood
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('3 Idiots', 10, 100, '2026-05-20', 'https://image.tmdb.org/t/p/w500/66A90oEXt41ib1f2bIfxosR10nU.jpg')");
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('Dangal', 14, 150, '2026-05-25', 'https://image.tmdb.org/t/p/w500/aHkNJNWNqfF57wJHTcZtqH2Z4E3.jpg')");
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('Jawan', 18, 250, '2026-06-10', 'https://image.tmdb.org/t/p/w500/jpfkzbIXgKZqCZAkAezdEMtI1Y.jpg')");
  }

  return db;
}

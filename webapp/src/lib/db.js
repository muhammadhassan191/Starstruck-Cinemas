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
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('Spider-Man: No Way Home', 15, 120, '2026-06-01', 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQSdnOkKE9dBN68bYDK4FNPszoUkeG4X7XCJCTsgpfCP-EY9GIx')");
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('Dune: Part Two', 20, 200, '2026-06-15', 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRBu8Gzdygf5OOqBJUIJ3-ZxiPbLh62OhvLmtOvuR7x2gF3DucU')");
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('Inception', 12, 80, '2026-07-04', 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQovCe0H45fWwAtV31ajOdXRPTxSsMQgPIQ3lcZX_mAW0jXV3kH')");
    // Bollywood
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('3 Idiots', 10, 100, '2026-05-20', 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQV7sONOx4fl1xq9CbdWUmcTamWwzrPMzqKhZOGHh-V0zHpn0Ly')");
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('Dangal', 14, 150, '2026-05-25', 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQMCj20Dhxm40PDsgiS1lMZaNj8lepMfMv9zn3LsbwLWu2ovzUk')");
    await db.run("INSERT INTO Movies (name, price, available_seats, date, poster_path) VALUES ('Jawan', 18, 250, '2026-06-10', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA8fxJgOk6Q4UGjmsa1q3CQ1Q05Lt0Dn1leAl6_KexCEjqJAe6')");
  }

  return db;
}

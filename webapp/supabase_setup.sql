-- ============================================================
--  STARSTRUCK CINEMAS — Supabase Setup SQL
--  Paste this entire file into Supabase → SQL Editor → Run
-- ============================================================

-- 1. TABLES

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  preference_data TEXT DEFAULT '{}',
  reward_points INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cinemas (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS movies (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  booked_seats INTEGER DEFAULT 0,
  date TEXT NOT NULL,
  showtime TEXT DEFAULT '18:00',
  cinema_location TEXT DEFAULT 'Starstruck Central - New York',
  poster_path TEXT,
  genre TEXT DEFAULT 'General',
  rating REAL DEFAULT 0.0,
  booked_seats_list TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id),
  text TEXT
);

CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL
);

-- ============================================================
-- 2. SEED DATA
-- ============================================================

-- Admin account (username: admin / password: admin123)
INSERT INTO admins (username, password)
VALUES ('admin', 'admin123')
ON CONFLICT DO NOTHING;

-- Cinemas
INSERT INTO cinemas (name, location) VALUES
  ('Starstruck Central - New York', 'New York'),
  ('Starstruck Luxe - Los Angeles', 'Los Angeles'),
  ('Starstruck IMAX - Queens', 'Queens'),
  ('Starstruck North - Bronx', 'Bronx'),
  ('Starstruck Hub - Brooklyn', 'Brooklyn');

-- Movies
INSERT INTO movies (name, price, available_seats, date, showtime, cinema_location, poster_path, genre) VALUES
  ('Spider-Man: No Way Home', 1500, 120, '2026-06-01', '18:00', 'Starstruck Central - New York', 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQSdnOkKE9dBN68bYDK4FNPszoUkeG4X7XCJCTsgpfCP-EY9GIx', 'Action'),
  ('Dune: Part Two',          2000, 200, '2026-06-15', '21:00', 'Starstruck Central - New York', 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRBu8Gzdygf5OOqBJUIJ3-ZxiPbLh62OhvLmtOvuR7x2gF3DucU', 'Sci-Fi'),
  ('The Dark Knight',         2200, 150, '2026-07-01', '20:30', 'Starstruck Central - New York', 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQkUywIUXDjHSQJIaNHYVs08osgBpF5Ot-xmB_omyEZeeRP9Xug', 'Action'),
  ('The Matrix',              1200, 100, '2026-07-10', '15:00', 'Starstruck Central - New York', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5DoFtShSmClflZ0RzBj9JBMweU5IUVBCeEbbLeV2XPlCnTKNi', 'Sci-Fi'),
  ('Inception',               1800,  80, '2026-07-04', '19:30', 'Starstruck Luxe - Los Angeles',  'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQovCe0H45fWwAtV31ajOdXRPTxSsMQgPIQ3lcZX_mAW0jXV3kH', 'Sci-Fi'),
  ('Interstellar',            2500, 120, '2026-08-01', '16:00', 'Starstruck Luxe - Los Angeles',  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9oW0XQlu1lo1G_49M-YwGzKR6rUg-CtflZj07HfbT8d2GwKWg', 'Sci-Fi'),
  ('Barbie',                  1500, 140, '2026-08-15', '13:00', 'Starstruck Luxe - Los Angeles',  'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTY4Eyui9jNTpW7HSDEYhHSKRe_JtxiU-NJG5cCfQhvdf5LlCma', 'Comedy'),
  ('3 Idiots',                1000, 100, '2026-05-20', '14:00', 'Starstruck IMAX - Queens',       'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQV7sONOx4fl1xq9CbdWUmcTamWwzrPMzqKhZOGHh-V0zHpn0Ly', 'Comedy'),
  ('Avengers: Endgame',       3000, 300, '2026-09-01', '18:30', 'Starstruck IMAX - Queens',       'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRXef9DJnZiq5az0UnjkmvkQufOQ5MFnF7HATYRUXN913swRuH1', 'Action'),
  ('Pulp Fiction',            1400,  80, '2026-09-10', '23:00', 'Starstruck IMAX - Queens',       'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQZ1D6BbXnSWWpSOVNLpQYfopngAXDS9iWPgOQJQS0AtE--gDwa', 'Drama'),
  ('Dangal',                  1400, 150, '2026-05-25', '17:00', 'Starstruck Hub - Brooklyn',      'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQMCj20Dhxm40PDsgiS1lMZaNj8lepMfMv9zn3LsbwLWu2ovzUk', 'Drama'),
  ('Parasite',                1800, 120, '2026-10-01', '21:15', 'Starstruck Hub - Brooklyn',      'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRa9QXcKkW6fhivLE4LjAdeC7CvLFnJk5vRjkK7siVD5TkeXVfU', 'Drama'),
  ('The Lion King',           1200, 200, '2026-10-15', '11:00', 'Starstruck Hub - Brooklyn',      'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRu6K8z_pBKeeeG_ew9Xlk-JC0e4FEoE4Qx4nEpxP9dg88BuVze', 'Drama'),
  ('Jawan',                   1800, 250, '2026-06-10', '20:00', 'Starstruck North - Bronx',       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA8fxJgOk6Q4UGjmsa1q3CQ1Q05Lt0Dn1leAl6_KexCEjqJAe6', 'Action'),
  ('Oppenheimer',             2800, 180, '2026-11-01', '19:00', 'Starstruck North - Bronx',       'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcS-v82iAoNANJgZ6EATtRCYgJvaXN9L02Dg0V5-0oN9IFOQVluQ', 'Drama'),
  ('Gladiator',               1500, 100, '2026-11-20', '16:45', 'Starstruck North - Bronx',       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFabKsWv9ru_kpMttjPf2493GGI7L3LpW3XjgPTE9FyHdNDIwV', 'Action');

-- Reviews (movie_id matches the insert order above: Spider-Man=1, Dune=2, etc.)
INSERT INTO reviews (movie_id, text) VALUES
  (1, 'Amazing web-swinging visuals but the pacing gets slow in the second act.'),
  (1, 'Incredible action, visually stunning! Def slow towards the middle.'),
  (2, 'The world building is massive and visuals are breathtaking. Sometimes confusing story.'),
  (3, 'A masterpiece plot, very confusing but visually amazing.'),
  (4, 'Hilarious and heartwarming. Perfect pacing.'),
  (5, 'Extremely motivational and well acted.'),
  (6, 'Non-stop action, incredible stunts but the story suffers a bit.'),
  (7, 'The best action sequences and profound emotional depth.'),
  (8, 'Unbelievable visual scale but slightly slow pacing at times.'),
  (9, 'Epic conclusion, great action everywhere.'),
  (10, 'A masterful drama that holds a mirror to society.');

---
theme: default
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## Cinema Management System
  Presentation created for course project.
drawings:
  persist: false
title: Cinema Management System - Enhanced
---

# Cinema Management System
## Web Application Port & Enhanced Features

**Topics Highlighted:**
- Data Handling (SQL Lite)
- Web services & API

---

# 1. Introduction
## Why the changes?

The original application was built using Java Desktop/Swing with an absolute path to a local MS Access Database.
This presented a few critical issues:
- **Portability:** Hardcoding `C:\Users\INTEL\...` meant it only ran on one specific computer.
- **Mobility:** Users expect to book tickets on their phones or browsers, not through desktop installations.

**The Solution:**
We ported the application to a modern **Next.js Web Application** using **Vanilla CSS** and an embedded **SQLite Database**, making it 100% portable and accessible from any device.

---

# 2. Project Objectives

- **Refactor to Web**: Increase mobility by switching from a localized Java App to a responsive Next.js application.
- **Enhanced UI**: Move from basic Swing components to a premium, glassmorphism web-design with modern aesthetics.
- **Improved Data Handling**: Replace the fragile MS Access dependency with an embedded SQLite database (`sqlite3`) that requires zero installation.
- **Integration of API**: Fulfill the AI feature requirement by implementing a Movie Recommendation API.

---

# 3. Project Features

**User Features:**
- View currently showing movies with prices and available seats.
- Book movie tickets directly online.
- Get AI-powered movie recommendations based on mood.

**Admin Features:**
- Secure dashboard to add, view, and wipe movies.
- Directly manipulates the SQLite database through Next.js API endpoints.

---

# 4. Features/Activities Added By Me

- **Complete Language Pivot**: Migrated the entire codebase from Java to Javascript (React/Next.js) for enhanced reliability.
- **API Construction**: Built HTTP REST APIs (`/api/movies`, `/api/book`) to securely handle client-server communication.
- **AI Recommendation Engine**: Added an intelligent cinema assistant feature that prompts for user moods and suggests relevant movies using mock AI Data services.
- **Premium Design System**: Implemented a modern, responsive UI with smooth gradients, cards, and interactive hover effects (without using Tailwind as per guidelines, implemented exclusively with Vanilla CSS modules).

---

# 5. Explaining The Topic: Data Handling (SQL Lite) & API

For this project, we selected **Topics 2 (Data Handling) and 5 (API)**.

### Data Handling (SQL Lite):
- We chose SQLite over MS Access because SQLite natively integrates with Node.js via the `sqlite3` driver.
- Data is stored in `cinema.db` locally in the project folder, resolving all previous "Driver Not Found" or "Path Not Found" errors.
- We implemented proper CRUD (Create, Read, Update, Delete) operations in Javascript.

### APIs:
- Used Next.js API Routes to expose backend endpoints (`GET /api/movies`, `POST /api/movies`).
- Our Frontend requests data synchronously via modern `fetch()` APIs.

---

# 6. Screenshots of Running App

> *(Note: Insert your screenshots of the running Web App here! Be sure to include both the User view and Admin view.)*

![Home Screen Placeholder](./screenshots/home.png)
![AI Features Placeholder](./screenshots/ai.png)

---

# 7. Conclusion and Future Directions

**Conclusion:**
Moving the system from Java Swing to a mobile-first Web Application drastically improved its robustness. By implementing SQLite, the project can now be zipped and run instantly on any machine. The API layer provides a robust integration pattern for future extensions.

**Future Directions:**
- Incorporate a real payment gateway (Stripe API) for actual ticket purchases.
- Integrate the TMDB API to pull live movie ratings and high-resolution posters.
- Add user authentication / accounts so users can see their booking history.

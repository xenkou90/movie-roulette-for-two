# Movie Roulette for 2

A mobile-first, real-time two-player movie matching web app. Two people swipe through the same movies until they both say yes to the same one — that's movie night decided.

> Can't agree on what to watch tonight? Movie Roulette decides for you.

<!-- Add a screenshot or GIF here once deployed -->
<!-- ![Movie Roulette demo](./demo.gif) -->

<!-- Add your live link here once deployed -->
<!-- **Live demo:** https://your-domain.com -->

---

## Features

- **Real-time two-player rooms** — one player creates a room with a 5-digit code, the other joins with it
- **Independent swiping** — both players move through the same movie queue at their own pace
- **Hidden matching** — neither player ever sees which movies the other checked, only whether it was a match
- **Instant match celebration** — when both players check the same movie, both screens light up with the result, complete with a synthesized chime
- **Direct links to IMDB and Letterboxd** for every matched movie
- **Easy sharing** — copy the code, copy a join link, or use the native share sheet
- **Resilient by design** — handles player disconnects, abandoned rooms, idle sessions, and lost connections gracefully
- **Neo-brutalist UI** — bold, playful, fully responsive and mobile-first

---

## Tech stack

**Client**
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Socket.IO client

**Server**
- Node.js + Express
- Socket.IO
- TypeScript (ts-node + nodemon)

**External API**
- [TMDB](https://www.themoviedb.org/) for movie data

The client and server are two completely independent projects in one Git repository, with no shared `node_modules`.

---

## How it works

The server is the single source of truth. Clients send simple `skip` and `check` events and react to what the server sends back.

When both players join a room, the server fetches a batch of movies from several TMDB sources, deduplicates them, shuffles the result, and stores the queue in memory. Both players draw from the same queue in the same order, which is what makes the matching logic possible.

For every movie, the server tracks each player's state: `unseen`, `skipped`, or `checked`. When a player checks a movie, the server looks at the other player's state for that same movie:

- Other player also checked it → **match** (both screens celebrate)
- Other player already skipped it → **miss** (the checking player is told to keep looking)
- Other player hasn't reached it yet → **wait** (the checking player waits silently)

All of this logic lives on the server. Real-time communication is handled by Socket.IO, with the server emitting events like `movie:show`, `match:found`, and `match:missed`.

---

## Running locally

### Prerequisites

- Node.js 18 or newer
- A free TMDB API key — get one at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

### 1. Clone the repository

```bash
git clone https://github.com/xenkou90/movie-roulette-for-two.git
cd movie-roulette-for-two
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

```
TMDB_API_KEY=your_tmdb_api_key_here
PORT=3001
```

Start the server:

```bash
npm run dev
```

The server runs on `http://localhost:3001`. You can verify it's running by visiting `http://localhost:3001/health`, which should return `{"status":"ok"}`.

### 3. Set up the client

In a second terminal:

```bash
cd client
npm install
```

Create a `.env.local` file in the `client/` folder:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Start the client:

```bash
npm run dev
```

The client runs on `http://localhost:3000`.

### 4. Play

Open two browser windows (or two devices on the same network). In the first, create a room. In the second, join with the same code. Once both are in, start swiping.

---

## Project structure

```
movie-roulette-for-two/
├── client/                      # Next.js front-end
│   └── src/
│       ├── app/
│       │   ├── page.tsx         # Landing page
│       │   ├── create/          # Create a room
│       │   ├── join/            # Enter a room
│       │   └── room/[code]/
│       │       ├── wait/        # Waiting screen
│       │       ├── game/        # Swiping screen
│       │       └── match/       # Match celebration
│       └── lib/
│           └── socket.ts        # Shared Socket.IO client instance
│
├── server/                      # Express + Socket.IO back-end
│   └── src/
│       ├── index.ts             # Server entry, Socket.IO event handlers
│       ├── rooms.ts             # In-memory room state management
│       ├── tmdb.ts              # TMDB API calls and rate limiting
│       └── gameLogic.ts         # Skip / check / match logic
│
└── README.md
```

---

## Credits

- Movie data provided by [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.
- Imagined, created, and designed by Xeno.

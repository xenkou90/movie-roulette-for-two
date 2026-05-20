const TMDB_BASE = "https://api.themoviedb.org/3";

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

const RATE_LIMIT_PER_SECOND = 30;
const QUEUE_INTERVAL_MS = 1000 / RATE_LIMIT_PER_SECOND;

let lastRequestTime = 0;
const requestQueue: Array<() =>void> = [];
let processing = false;

async function processQueue() {
  if (processing) return;
  processing = true;

  while (requestQueue.length > 0) {
    const now = Date.now();
    const wait = Math.max(0, QUEUE_INTERVAL_MS - (now - lastRequestTime));

    if (wait > 0) {
      await new Promise((r) => setTimeout(r, wait));
    }

    const next = requestQueue.shift();
    if (next) {
      lastRequestTime = Date.now();
      next();
    }
  }

  processing = false;
}

function rateLimitedFetch(url: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    requestQueue.push(() => {
      fetch(url).then(resolve).catch(reject);
    });
    processQueue();
  });
}

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  overview: string;
  vote_average: number;
  genre_ids: number[];
  genres?: string[];
  runtime?: number | null;
  imdb_id?: string | null;
  details_fetched?: boolean;
}

export async function fetchMovieQueue(apiKey: string): Promise<Movie[]> {
  const sources = [
    // Currently popular
    `${TMDB_BASE}/movie/popular?api_key=${apiKey}&language=en-US&page=1`,
    `${TMDB_BASE}/movie/popular?api_key=${apiKey}&language=en-US&page=2`,

    // Highly rated since 2000 - modern classics
    `${TMDB_BASE}/discover/movie?api_key=${apiKey}&language=en-US&sort_by=vote_average.desc&vote_count.gte=500&primary_release_date.gte=2000-01-01&page=1`,
    `${TMDB_BASE}/discover/movie?api_key=${apiKey}&language=en-US&sort_by=vote_average.desc&vote_count.gte=500&primary_release_date.gte=2000-01-01&pagr=2`,

    // Currently in cinemas
    `${TMDB_BASE}/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`,
  ];

  const requests = sources.map((url) =>
    rateLimitedFetch(url).then((res) => res.json())
  );

  const results = await Promise.all(requests) as Array<{ results: Movie[] }>;

  const allMovies = results
    .flatMap((res) => res.results)
    .filter((m: Movie) => {
      if (!m.poster_path) return false;
      const year = m.release_date ? new Date(m.release_date).getFullYear() : 0;
      return year >= 2000;
    });

  // Deduplicate by ID — same movie can appear in multiple sources
  const seen = new Set<number>();
  const unique: Movie[] = [];
  for (const movie of allMovies) {
    if (!seen.has(movie.id)) {
      seen.add(movie.id);
      unique.push({
        ...movie,
        genres: movie.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean),
      });
    }
  }

  return shuffle(unique);
}

export async function enrichMovieDetails(movie: Movie, apiKey: string): Promise<Movie> {
  try {
    const res = await rateLimitedFetch(
      `${TMDB_BASE}/movie/${movie.id}?api_key=${apiKey}&append_to_response=external_ids`
    );

    if (res.status === 429) {
      console.warn(`TMDB rate limit hit for ${movie.title}, marking as fetched anyway.`);
      return { ...movie, details_fetched: true };
    }

    const data = await res.json() as {
      runtime: number;
      external_ids: { imdb_id: string };
    };
    return {
      ...movie,
      runtime: data.runtime || null,
      imdb_id: data.external_ids?.imdb_id || null,
      details_fetched: true,
    };
  } catch {
    return { ...movie, details_fetched: true };
  }
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
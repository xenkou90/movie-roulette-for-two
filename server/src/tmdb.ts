const TMDB_BASE = "https://api.themoviedb.org/3";

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

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

export async function fetchMovieQueue(): Promise<Movie[]> {
  const apiKey = process.env.TMDB_API_KEY;
  const pages = [1, 2, 3];

  const requests = pages.map((page) =>
    fetch(
      `${TMDB_BASE}/movie/popular?api_key=${apiKey}&language=en-US&page=${page}`
    ).then((res) => res.json())
  );

  const results = await Promise.all(requests) as Array<{ results: Movie[] }>;

  const movies: Movie[] = results
    .flatMap((res) => res.results)
    .filter((m: Movie) => m.poster_path)
    .map((m: Movie) => ({
      ...m,
      genres: m.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean),
    }));

  return shuffle(movies);
}

export async function enrichMovieDetails(movie: Movie): Promise<Movie> {
  const apiKey = process.env.TMDB_API_KEY;
  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${movie.id}?api_key=${apiKey}&append_to_response=external_ids`
    );
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
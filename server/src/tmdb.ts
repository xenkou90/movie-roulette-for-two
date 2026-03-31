const TMDB_BASE = "https://api.themoviedb.org/3";

export interface Movie {
    id: number;
    title: string;
    poster_path: string;
    release_date: string;
    overview: string;
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
        .filter((m: Movie) => m.poster_path);

    return shuffle(movies);
}

function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
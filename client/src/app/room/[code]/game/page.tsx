"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import socket from "@/lib/socket";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  overview: string;
  vote_average: number;
  genres: string[];
  runtime: number | null;
  imdb_id: string | null;
}

function formatReleaseDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

export default function GameScreen() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;
  const name = searchParams.get("name") || "Player";
  const router = useRouter();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    socket.connect();

    socket.on("movie:show", ({ movie }: { movie: Movie }) => {
      setMovie(movie);
      setIsWaiting(false);
    });

    socket.on("match:missed", () => {
      showToast("They passed on that one — keep looking!");
      setIsWaiting(false);
    });

    socket.emit("game:ready", { code });

    socket.on("match:found", ({ movie }: { movie: Movie }) => {
      router.push(
        `/room/${code}/match?name=${encodeURIComponent(name)}&movieId=${movie.id}&movieTitle=${encodeURIComponent(movie.title)}&moviePoster=${encodeURIComponent(movie.poster_path)}&movieYear=${movie.release_date.split("-")[0]}&imdbId=${movie.imdb_id ?? ""}`
      );
    });

    return () => {
      socket.off("movie:show");
      socket.off("match:missed");
      socket.off("match:found");
    };
  }, [code]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }

  function handleSkip() {
    if (isWaiting || !movie) return;
    socket.emit("movie:skip", { code, movieId: movie.id });
  }

  function handleCheck() {
    if (isWaiting || !movie) return;
    setIsWaiting(true);
    socket.emit("movie:check", { code, movieId: movie.id });
  }

  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const imdbUrl = movie?.imdb_id
    ? `https://www.imdb.com/title/${movie.imdb_id}/`
    : `https://www.imdb.com/find/?q=${encodeURIComponent(movie?.title || "")}`;

  const letterboxdUrl = `https://letterboxd.com/tmdb/${movie?.id ?? ""}/`;

  return (
    <main className="min-h-screen bg-[#0D9488] flex flex-col items-center justify-center p-4 relative">

      {/* Toast */}
      {toast && (
        <div
          className="
            absolute top-6 left-1/2 -translate-x-1/2
            bg-black text-white
            font-[family-name:var(--font-mono)] text-sm
            px-5 py-3 rounded-xl
            border-[2px] border-[#FFE500]
            shadow-[4px_4px_0px_#FFE500]
            z-50 whitespace-nowrap
          "
        >
          {toast}
        </div>
      )}

      {/* Player name tag */}
      <div
        className="
          mb-5
          bg-[#FFE500] border-[2px] border-black
          rounded-lg px-4 py-1
          font-[family-name:var(--font-mono)]
          text-xs uppercase tracking-widest text-black
        "
      >
        {name}
      </div>

      {/* Card + side buttons */}
      <div className="flex items-center gap-3 w-full max-w-sm">

        {/* X button */}
        <button
          onClick={handleSkip}
          disabled={isWaiting || !movie}
          className="
            shrink-0
            shadow-[4px_4px_0px_#0EA5E9]
            active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
            transition-all duration-75
            disabled:opacity-30 disabled:cursor-not-allowed
          "
        >
          <Image src="/icons/icon-skip.png" alt="Skip" width={52} height={52} />
        </button>

        {/* Card */}
        <div
          className="
            flex-1 relative
            bg-[#FFFDF4]
            border-[3px] border-black
            shadow-[5px_5px_0px_#000000]
            rounded-xl overflow-hidden
          "
        >
          {/* Waiting overlay */}
          {isWaiting && (
            <div
              className="
                absolute inset-0 bg-black/50 rounded-xl
                flex flex-col items-center justify-center z-10 gap-2
              "
            >
              <div className="w-4 h-4 rounded-full bg-[#FFE500] animate-ping" />
              <p className="font-[family-name:var(--font-mono)] text-white text-xs tracking-widest uppercase">
                Waiting...
              </p>
            </div>
          )}

          {movie ? (
            <>
              {/* Poster — centered in white padded area */}
              <div className="bg-white p-4 pb-3">
                <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden border border-black/10">
                  {posterUrl ? (
                    <Image
                      src={posterUrl}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 384px) 80vw, 260px"
                    />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <span className="text-white text-xs font-[family-name:var(--font-heading)] uppercase">
                        No Poster
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="px-4 py-3 flex flex-col gap-2">

                {/* Title */}
                <h2
                  className="
                    font-[family-name:var(--font-heading)]
                    text-sm text-black text-center leading-tight
                  "
                >
                  {movie.title}
                </h2>

                {/* Overview */}
                {movie.overview && (
                  <p
                    className="
                      font-[family-name:var(--font-mono)]
                      text-[10px] text-black/60
                      text-center leading-relaxed line-clamp-3
                    "
                  >
                    {movie.overview}
                  </p>
                )}

                {/* Details grid */}
                <div
                  className="
                    font-[family-name:var(--font-mono)]
                    text-[10px] text-black/70
                    flex flex-col gap-0.5 text-center
                    border-t border-black/10 pt-2
                  "
                >
                  <span>Release Date: {formatReleaseDate(movie.release_date)}</span>
                  {movie.genres?.length > 0 && (
                    <span>Genres: {movie.genres.join(", ")}</span>
                  )}
                  <span>
                    Runtime: {movie.runtime ? `${movie.runtime} min` : "—"}
                  </span>
                  <span>TMDB Rating: ⭐ {movie.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </>
          ) : (
            /* Loading state while waiting for first movie */
            <div className="flex items-center justify-center h-64">
              <div className="w-5 h-5 rounded-full bg-[#0D9488] animate-ping" />
            </div>
          )}
        </div>

        {/* Check button */}
        <button
          onClick={handleCheck}
          disabled={isWaiting || !movie}
          className="
            shrink-0
            shadow-[4px_4px_0px_#FF3CAC]
            active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
            transition-all duration-75
            disabled:opacity-30 disabled:cursor-not-allowed
          "
        >
          <Image src="/icons/icon-check.png" alt="Check" width={52} height={52} />
        </button>

      </div>

      {/* IMDB + Letterboxd — under the card */}
      {movie && (
        <div className="flex gap-3 w-full max-w-sm mt-4">
          <a
            href={imdbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex-1 text-center
              bg-[#FFE500]
              border-[3px] border-black
              shadow-[4px_4px_0px_#000000]
              rounded-xl py-3
              font-[family-name:var(--font-heading)]
              text-base text-black uppercase tracking-wide
              active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
              transition-all duration-75
            "
          >
            IMDB
          </a>
          
          <a
            href={letterboxdUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex-1 text-center
              bg-[#FFFDF4]
              border-[3px] border-black
              shadow-[4px_4px_0px_#000000]
              rounded-xl py-3
              font-[family-name:var(--font-heading)]
              text-base text-black uppercase tracking-wide
              active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
              transition-all duration-75
            "
          >
            Letterboxd
          </a>
        </div>
      )}

      <div className="flex gap-2 mt-6">
        <div className="w-8 h-2 rounded-full bg-[#FFE500] border border-black" />
        <div className="w-4 h-2 rounded-full bg-white border border-black" />
        <div className="w-8 h-2 rounded-full bg-[#FF3CAC] border border-black" />
      </div>
    </main>
  );
}
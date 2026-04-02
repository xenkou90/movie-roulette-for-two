"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import socket from "@/lib/socket";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  year: string;
}

export default function GameScreen() {
  const params = useParams();
  const searchParams = useSearchParams();

  const code = params.code as string;
  const name = searchParams.get("name") || "Player";

  const [currentMovie, setCurrentMovie] = useState<Movie>({
    id: Number(searchParams.get("firstMovieId")),
    title: searchParams.get("firstMovieTitle") || "",
    poster_path: searchParams.get("firstMoviePoster") || "",
    year: searchParams.get("firstMovieYear") || "",
  });

  const [isWaiting, setIsWaiting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    socket.connect();

    return () => {
      socket.off("movie:show");
      socket.off("match:missed");
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }

  function handleSkip() {
    if (isWaiting) return;
    socket.emit("movie:skip", { code, movieId: currentMovie.id });
  }

  function handleCheck() {
    if (isWaiting) return;
    setIsWaiting(true);
    socket.emit("movie:check", { code, movieId: currentMovie.id });
  }

  const posterUrl = currentMovie.poster_path
    ? `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`
    : null;

  const imdbUrl = `https://www.imdb.com/find/?q=${encodeURIComponent(currentMovie.title)}`;
  const letterboxdUrl = `https://letterboxd.com/search/${encodeURIComponent(currentMovie.title)}/`;

  return (
    <main className="min-h-screen bg-[#0D9488] flex flex-col items-center justify-center p-4 relative">

      {/* Toast */}
      {toast && (
        <div
          className="
            absolute top-6 left-1/2 -translate-x-1/2
            bg-black text-white
            font-[family-name:var(--font-mono)]
            text-sm px-5 py-3
            rounded-xl border-[2px] border-[#FFE500]
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
          bg-[#FFE500]
          border-[2px] border-black
          rounded-lg px-4 py-1
          font-[family-name:var(--font-mono)]
          text-xs uppercase tracking-widest text-black
        "
      >
        {name}
      </div>

      {/* Card + buttons row */}
      <div className="flex items-center gap-4 w-full max-w-xs">

        {/* X button — just the icon */}
        <button
          onClick={handleSkip}
          disabled={isWaiting}
          className="
            shrink-0
            disabled:opacity-30
            active:scale-90
            transition-transform duration-75
          "
        >
          <Image
            src="/icons/icon-skip.svg"
            alt="Skip"
            width={52}
            height={52}
          />
        </button>

        {/* Card */}
        <div
          className="
            flex-1
            relative
            bg-[#FFFDF4]
            border-[3px] border-black
            shadow-[5px_5px_0px_#000000]
            rounded-xl
            overflow-hidden
            flex flex-col
          "
        >
          {/* Waiting overlay */}
          {isWaiting && (
            <div
              className="
                absolute inset-0
                bg-black/50
                rounded-xl
                flex flex-col items-center justify-center
                z-10 gap-2
              "
            >
              <div className="w-4 h-4 rounded-full bg-[#FFE500] animate-ping" />
              <p className="font-[family-name:var(--font-mono)] text-white text-xs tracking-widest uppercase">
                Waiting...
              </p>
            </div>
          )}

          {/* Poster */}
          <div className="relative w-full aspect-[2/3] bg-black">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={currentMovie.title}
                fill
                className="object-cover"
                sizes="240px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white font-[family-name:var(--font-heading)] text-sm uppercase">
                  No Poster
                </span>
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="flex flex-col items-center gap-2 px-3 py-3">

            <h2
              className="
                font-[family-name:var(--font-heading)]
                text-base text-black text-center uppercase leading-tight
              "
            >
              {currentMovie.title}
            </h2>

            {currentMovie.year && (
              <span className="font-[family-name:var(--font-mono)] text-xs text-black/50">
                {currentMovie.year}
              </span>
            )}

            {/* IMDB + Letterboxd */}
            <div className="flex gap-2 mt-1 w-full">
              <a
                href={imdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex-1 text-center
                  bg-[#FFE500]
                  border-[2px] border-black
                  shadow-[3px_3px_0px_#000000]
                  rounded-lg py-1
                  font-[family-name:var(--font-heading)]
                  text-xs text-black uppercase tracking-wide
                  active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
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
                  border-[2px] border-black
                  shadow-[3px_3px_0px_#000000]
                  rounded-lg py-1
                  font-[family-name:var(--font-heading)]
                  text-xs text-black uppercase tracking-wide
                  active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                  transition-all duration-75
                "
              >
                Letterboxd
              </a>
            </div>

          </div>
        </div>

        {/* Check button — just the icon */}
        <button
          onClick={handleCheck}
          disabled={isWaiting}
          className="
            shrink-0
            disabled:opacity-30
            active:scale-90
            transition-transform duration-75
          "
        >
          <Image
            src="/icons/icon-check.svg"
            alt="Check"
            width={52}
            height={52}
          />
        </button>

      </div>

      <div className="flex gap-2 mt-6">
        <div className="w-8 h-2 rounded-full bg-[#FFE500] border border-black" />
        <div className="w-4 h-2 rounded-full bg-white border border-black" />
        <div className="w-8 h-2 rounded-full bg-[#FF3CAC] border border-black" />
      </div>
    </main>
  );
}
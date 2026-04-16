"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function MatchScreen() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = params.code as string;
  const name = searchParams.get("name") || "Player";
  const movieTitle = searchParams.get("movieTitle") || "";
  const moviePoster = searchParams.get("moviePoster") || "";
  const movieYear = searchParams.get("movieYear") || "";
  const imdbId = searchParams.get("imdbId") || "";

  const movieId = searchParams.get("movieId") || "";

  const posterUrl = moviePoster
  ? `https://image.tmdb.org/t/p/w500${moviePoster}`
  : null;

  const imdbUrl = imdbId
  ? `https://www.imdb.com/title/${imdbId}/`
  : `https://www.imdb.com/find/?q=${encodeURIComponent(movieTitle)}`;

  const letterboxdUrl = `https://letterboxd.com/tmdb/${movieId}/`;

  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="full-height bg-[#FF3CAC] flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Background decoratvie blobs */}
      <div className="absolute top-[-60px] left-[-60px] w-48 h-48 rounded-full bg-[#FFE500] border-[3px] border-black opacity-60" />
      <div className="absolute bottom-[-40px] right-[-40px] w-36 h-36 rounded-full bg-[#0D9488] border-[3px] border-black opacity-60" />
      <div className="absolute top-1/2 right-[-30px] w-24 h-24 rounded-full bg-[#FFFDF4] border-[3px] border-black opacity-40" />

      {/* Match badge */}
      <div
        className={`
          mb-5 transition-all duration-500
          ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
        `}
      >
        <div
          className="
            bg-[#FFE500]
            border-[3px] border-black
            shadow-[5px_5px_0px_#000000]
            rounded-xl px-6 py-2
            font-[family-name:var(--font-heading)]
            text-2xl uppercase tracking-wide text-black
          "
        >
          🎬 It's a match!
        </div>
      </div>

      {/* Card */}
      <div
        className={`
          w-full max-w-sm
          bg-[#FFFDF4]
          border-[3px] border-black
          shadow-[6px_6px_0px_#000000]
          rounded-xl overflow-hidden
          transition-all duration-700 delay-100
          ${show ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
      >
        {/* Poster */}
        {posterUrl && (
          <div className="bg-white p-4 pb-3">
            <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden border border-black/10">
              <Image
                src={posterUrl}
                alt={movieTitle}
                fill
                className="object-cover"
                sizes="(max-width: 384px) 80vw, 320px"
              />
            </div>
          </div>
        )}

        {/* Info */}
        <div className="px-5 py-4 flex flex-col items-center gap-2">
          <h2
            className="
              font-[family-name:var(--font-heading)]
              text-xl text-black text-center uppercase leading-tight
            "
          >
            {movieTitle}
          </h2>

          {movieYear && (
            <span className="font-[family-name:var(--font-mono)] text-xs text-black/50">
              {movieYear}
            </span>
          )}

          {/* IMDB + Letterboxd */}
          <div className="flex gap-3 w-full mt-2">
            <a
              href={imdbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex-1 text-center
                bg-[#FFE500]
                border-[3px] border-black
                rounded-xl py-3
                font-[family-name:var(--font-heading)]
                text-sm text-black uppercase tracking-wide
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
                text-sm text-black uppercase tracking-wide
                active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
                transition-all duration-75
              "
            >
              Letterboxd
            </a>
          </div>
        </div>
      </div>

      {/* Play Again */}
      <button
        onClick={() => router.push("/")}
        className={`
          mt-6 w-full max-w-sm
          bg-black
          border-[3px] border-black
          shadow-[5px_5px_0px_#FFE500]
          rounded-xl py-4
          font-[family-name:var(--font-heading)]
          text-xl text-white uppercase tracking-wide
          active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
          transition-all duration-75
          ${show ? "opacity-100" : "opacity-0"}
        `}
      >
        Play Again
      </button>

      <div className="flex gap-2 mt-6">
        <div className="w-8 h-2 rounded-full bg-[#FFE500] border border-black" />
        <div className="w-4 h-2 rounded-full bg-white border border-black" />
        <div className="w-8 h-2 rounded-full bg-[#0D9488] border border-black" />
      </div>
    </main>
  );
}
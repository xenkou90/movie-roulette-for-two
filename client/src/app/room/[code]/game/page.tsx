"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import socket from "@/lib/socket";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
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

  return (
    <main className="min-h-screen bg-[#0D9488] flex flex-col items-center justify-center p-6 relative">

      {/* Toast notification */}
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
          mb-6
          bg-[#FFE500]
          border-[2px] border-black
          rounded-lg px-4 py-1
          font-[family-name:var(--font-mono)]
          text-xs uppercase tracking-widest text-black
        "
      >
        {name}
      </div>

      {/* Main card */}
      <div
        className="
          relative
          bg-[#FFFDF4]
          border-[3px] border-black
          shadow-[6px_6px_0px_#000000]
          rounded-xl
          p-4
          w-full max-w-sm
          flex flex-col items-center gap-4
        "
      >
        {/* Waiting overlay */}
        {isWaiting && (
          <div
            className="
              absolute inset-0
              bg-black/60
              rounded-xl
              flex flex-col items-center justify-center
              z-10
              gap-2
            "
          >
            <div className="w-4 h-4 rounded-full bg-[#FFE500] animate-ping" />
            <p className="font-[family-name:var(--font-mono)] text-white text-sm tracking-widest uppercase">
              Waiting...
            </p>
          </div>
        )}

        {/* Movie poster */}
        <div
          className="
            w-full aspect-[2/3]
            bg-black
            border-[2px] border-black
            rounded-lg
            overflow-hidden
            relative
          "
        >
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={currentMovie.title}
              fill
              className="object-cover"
              sizes="(max-width: 384px) 100vw, 384px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white font-[family-name:var(--font-heading)] text-lg uppercase">
                No Poster
              </span>
            </div>
          )}
        </div>

        {/* Movie Title */}
        <h2
          className="
            font-[family-name:var(--font-heading)]
            text-xl text-black text-center uppercase leading-tight
          "
        >
          {currentMovie.title}
        </h2>

        {/* X and Check buttons */}
        <div className="flex items-center justify-between w-full px-4 pb-2">

          {/* X button */}
          <button
            onClick={handleSkip}
            disabled={isWaiting}
            className="
              w-16 h-16 rounded-full
              bg-black
              border-[3px] border-black
              shadow-[4px_4px_0px_#FF3CAC]
              flex items-center justify-center
              active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
              transition-all duration-75
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            <Image
              src="/icons/icon-skip.png"
              alt="Skip"
              width={28}
              height={28}
            />
          </button>

          {/* Check button */}
          <button
            onClick={handleCheck}
            disabled={isWaiting}
            className="
              w-16 h-16 rounded-full
              bg-[#0EA5E9]
              border-[3px] border-black
              shadow-[4px_4px_0px_#FFE500]
              flex items-center justify-center
              active:translate-x-[3px] active:translate-y-[3px] active: shadow-none
              transition-all duration-75
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            <Image
              src="/icons/icon-check.png"
              alt="Check"
              width={28}
              height={28}
            />
          </button>

        </div>
      </div>

      <div className="flex gap-2 mt-8">
        <div className="w-8 h-2 rounded-full bg-[#FFE500] border border-black" />
        <div className="w-4 h-2 rounded-full bg-white border border-black" />
        <div className="w-8 h-2 rounded-full bg-[#FF3CAC] border border-black" />
      </div>
    </main>
  );
}
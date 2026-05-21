"use client";

import { useEffect, useState, useRef } from "react";
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
  const router = useRouter();

  const code = params.code as string;
  const name = searchParams.get("name") || "Player";

  const [partnerLeft, setPartnerLeft] = useState(false);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [toast, setToast] = useState("");
  const [loadingNext, setLoadingNext] = useState(false);
  const [idlePrompt, setIdlePrompt] = useState(false);
  const [abandoned, setAbandoned] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "reconnecting">("connected");

  const [connectionLost, setConnectionLost] = useState(false);
  const disconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const codeRef = useRef(code);
  const nameRef = useRef(name);
  const gameReadySent = useRef(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function showToast(message: string) {
    setToast(message);
    const t = setTimeout(() => setToast(""), 3000);
    timeoutsRef.current.push(t);
  }

  function resetIdleTimer() {
    setIdlePrompt(false);

    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (finalTimeoutRef.current) clearTimeout(finalTimeoutRef.current);

    idleTimeoutRef.current = setTimeout(() => {
      setIdlePrompt(true);

      finalTimeoutRef.current = setTimeout(() => {
        setIdlePrompt(false);
        setAbandoned(true);
        setTimeout(() => {
          router.replace("/");
        }, 4000);
      }, 2 * 60 * 1000);
    }, 10 * 60 * 1000);
  }

  useEffect(() => {
    socket.connect();
    resetIdleTimer();

    if (!gameReadySent.current) {
      gameReadySent.current = true;
      socket.emit("game:ready", { code: codeRef.current });
    }

    socket.on("movie:show", ({ movie }: { movie: Movie }) => {
      setMovie(movie);
      setIsWaiting(false);
      setLoadingNext(false);
    });

    socket.on("match:missed", () => {
      showToast("They passed on that one — keep looking!");
      setIsWaiting(false);
      setLoadingNext(false);
    });

    socket.on("match:found", ({ movie }: { movie: Movie }) => {
      router.replace(
        `/room/${codeRef.current}/match?name=${encodeURIComponent(nameRef.current)}&movieId=${movie.id}&movieTitle=${encodeURIComponent(movie.title)}&moviePoster=${encodeURIComponent(movie.poster_path)}&movieYear=${movie.release_date.split("-")[0]}&imdbId=${movie.imdb_id ?? ""}`
      );
    });

    socket.on("room:playerLeft", () => {
      showToast("Your partner left the room.");
      const overlayTimeout = setTimeout(() => {
        setPartnerLeft(true);
        const redirectTimeout = setTimeout(() => {
          router.replace("/");
        }, 3000);
        timeoutsRef.current.push(redirectTimeout);
      }, 3000);
      timeoutsRef.current.push(overlayTimeout);
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");

      disconnectTimeoutRef.current = setTimeout(() => {
        setConnectionLost(true);
        setTimeout(() => {
          router.replace("/");
        }, 3000);
      }, 4000);
    });

    socket.io.on("reconnect_attempt", () => {
      setConnectionStatus("reconnecting");
    });

    socket.io.on("reconnect", () => {
      setConnectionStatus("connected");
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
        disconnectTimeoutRef.current = null;
      }
    });

    return () => {
      socket.off("movie:show");
      socket.off("match:missed");
      socket.off("match:found");
      socket.off("room:playerLeft");
      socket.off("disconnect");
      socket.io.off("reconnect_attempt");
      socket.io.off("reconnect");
      timeoutsRef.current.forEach((t: NodeJS.Timeout) => clearTimeout(t));
      timeoutsRef.current = [];
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (finalTimeoutRef.current) clearTimeout(finalTimeoutRef.current);
      if (disconnectTimeoutRef.current) clearTimeout(disconnectTimeoutRef.current);
    };
  }, [router]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") handleSkip();
      if (e.key === "ArrowRight") handleCheck();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movie, isWaiting]);

  function handleSkip() {
    if (isWaiting || !movie) return;
    resetIdleTimer();
    setLoadingNext(true);
    socket.emit("movie:skip", { code, movieId: movie.id });
  }

  function handleCheck() {
    if (isWaiting || !movie) return;
    resetIdleTimer();
    setIsWaiting(true);
    socket.emit("movie:check", { code, movieId: movie.id });
  }

  const buttonsDisabled = isWaiting || !movie || loadingNext;

  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const imdbUrl = movie?.imdb_id
    ? `https://www.imdb.com/title/${movie.imdb_id}/`
    : `https://www.imdb.com/find/?q=${encodeURIComponent(movie?.title || "")}`;

  const letterboxdUrl = `https://letterboxd.com/tmdb/${movie?.id ?? ""}/`;

  return (
    <main className="full-height bg-[#0D9488] flex flex-col items-center justify-center p-4 relative">

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

      {/* Connection status banner */}
      {connectionStatus !== "connected" && (
        <div
          className="
            absolute top-0 left-0 right-0
            bg-[#FF3CAC] text-white
            font-[family-name:var(--font-mono)] text-xs
            uppercase tracking-widest
            py-2 text-center
            border-b-[3px] border-black
            z-50
            flex items-center justify-center gap-2
          "
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {connectionStatus === "reconnecting" ? "Reconnecting..." : "Connection lost"}
        </div>
      )}

      {/* Partner left overlay */}
      {partnerLeft && (
        <div
          className="
            absolute inset-0
            bg-black/70
            backdrop-blur-sm
            flex items-center justify-center
            z-50
            rounded-none
            p-6
          "
        >
          <div
            className="
              bg-[#FFFDF4]
              border-[3px] border-black
              shadow-[6px_6px_0px_#000000]
              rounded-xl
              px-6 py-8
              w-full max-w-xs
              flex flex-col items-center gap-4
              text-center
            "
          >
            <div
              className="
                bg-[#FFE500]
                border-[2px] border-black
                rounded-lg px-3 py-1
                font-[family-name:var(--font-heading)]
                text-sm uppercase tracking-wide text-black
              "
            >
              Game Over
            </div>

            <p
              className="
                font-[family-name:var(--font-mono)]
                text-sm text-black/80
                leading-relaxed
              "
            >
              Returning home — create or join a room to continue.
            </p>

            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}

      {/* Connection lost overlay */}
      {connectionLost && (
        <div
          className="
            absolute inset-0
            bg-black/70 backdrop-blur-sm
            flex items-center justify-center
            z-50 p-6
          "
        >
          <div
            className="
              bg-[#FFFDF4]
              border-[3px] border-black
              shadow-[6px_6px_0px_#000000]
              rounded-xl
              px-6 py-8
              w-full max-w-xs
              flex flex-col items-center gap-4
              text-center
            "
          >
            <div
              className="
                bg-[#FF3CAC]
                border-[2px] border-black
                rounded-lg px-3 py-1
                font-[family-name:var(--font-heading)]
                text-sm uppercase tracking-wide text-white
              "
            >
              Connection lost
            </div>

            <p
              className="
                font-[family-name:var(--font-mono)]
                text-sm text-black/80 leading-relaxed
              "
            >
              We&apos;ve lost the signal. Heading home — start a new room when you&apos;re ready.
            </p>

            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}

      {/* Idle prompt - soft toast in the middle */}
      {idlePrompt && !abandoned && (
        <button
          onClick={resetIdleTimer}
          className="
            absolute inset-0
            bg-black/40 backdrop-blur-[2px]
            flex items-center justify-center
            z-40 p-6
            cursor-pointer
          "
        >
          <div
            className="
              bg-[#FFE500]
              border-[3px] border-black
              shadow-[5px_5px_0px_#000000]
              rounded-xl
              px-6 py-5
              max-w-xs
              flex flex-col items-center gap-3
              text-center
              active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
              transition-all duration-75
            "
          >
            <p
              className="
                font-[family-name:var(--font-heading)]
                text-lg uppercase text-black leading-tight
              "
            >
              Popcorn break?
            </p>

            <p
              className="
                font-[family-name:var(--font-mono)]
                text-xs text-black/70 leading-relaxed
              "
            >
              We&apos;ll close the room soon if no one moves.
              Tap anywhere to keep watching.
            </p>
          </div>
        </button>
      )}

      {/* Abandoned overlay - final goodbye */}
      {abandoned && (
        <div
          className="
            absolute inset-0
            bg-black/70 backdrop-blur-sm
            flex items-center justify-center
            z-50 p-6
          "
        >
          <div
            className="
              bg-[#FFFDF4]
              border-[3px] border-black
              shadow-[6px_6px_0px_#000000]
              rounded-xl
              px-6 py-8
              w-full max-w-xs
              flex flex-col items-center gap-4
              text-center
            "
          >
            <div
              className="
                bg-[#FF3CAC]
                border-[2px] border-black
                rounded-lg px-3 py-1
                font-[family-name:var(--font-heading)]
                text-sm uppercase tracking-wide text-white
              "
            >
              Movie night paused
            </div>

            <p
              className="
                font-[family-name:var(--font-mono)]
                text-sm text-black/80 leading-relaxed
              "
            >
              Looks like the popcorn won. Heading home — start a new room when you&apos;re both ready.
            </p>

            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
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
          disabled={buttonsDisabled}
          className="
            shrink-0
            shadow-[4px_4px_0px_#0EA5E9]
            active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
            transition-all duration-75
            disabled:opacity-30 disabled:cursor-not-allowed
          "
        >
          <Image src="/icons/icon-skip.png" alt="Skip" width={52} height={52} loading="eager" />
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

          {loadingNext && !isWaiting && (
            <div
              className="
                absolute inset-0 bg-white/80 rounded-xl
                flex flex-col items-center justify-center z-10 gap-2
              "
            >
              <div className="w-4 h-4 rounded-full bg-[#0D9488] animate-pulse" />
              <p className="font-[family-name:var(--font-mono)] text-black/70 text-xs tracking-widest uppercase">
                Loading next...
              </p>
            </div>
          )}

          {movie ? (
            <div key={movie.id} className="animate-slide-in">
              {/* Poster — centered in white padded area */}
              <div className="bg-white p-4 pb-0">
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
              <div className="px-4 py-2 flex flex-col gap-2">

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
                      text-center leading-relaxed line-clamp-5
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
            </div>
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
          disabled={buttonsDisabled}
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
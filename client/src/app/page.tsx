"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <main
      className="
        full-height
        bg-[#0D9488]
        flex flex-col items-center justify-center
        p-6
        font-[family-name:var(--font-mono)]
        relative
        overflow-hidden
      "
    >
      {/* Info button - top right corner */}
      <button
        onClick={() => setShowInfo(true)}
        className="
          absolute top-5 right-5
          w-10 h-10 rounded-full
          bg-[#FFE500]
          border-[2px] border-black
          shadow-[3px_3px_0px_#000000]
          font-[family-name:var(--font-heading)]
          text-lg text-black
          active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
          transition-all duration-75
          flex items-center justify-center
        "
        aria-label="How to play"
      >
        ?
      </button>

      {/* Three decorative dots at the top */}
      <div className="flex gap-2 mb-8 fade-in-1">
        <div className="w-3 h-3 rounded-full bg-[#FF3CAC] border-2 border-black" />
        <div className="w-3 h-3 rounded-full bg-[#FFE500] border-2 border-black" />
        <div className="w-3 h-3 rounded-full bg-white border-2 border-black" />
      </div>

      {/* Title card */}
      <div
        className="
          bg-[#FFFDF4]
          border-[3px] border-black
          shadow-[6px_6px_0px_#000000]
          rounded-xl
          px-8 py-6
          mb-6
          w-full max-w-sm
          text-center
          fade-in-2
        "
      >
        <h1
          className="
            font-[family-name:var(--font-heading)]
            text-5xl leading-tight
            text-black uppercase tracking-tight
          "
        >
          Movie
          <br />
          Roulette
        </h1>

        <span
          className="
            inline-block
            bg-[#FFE500]
            border-[2px] border-black
            rounded-md
            px-3 py-1
            mt-2
            font-[family-name:var(--font-heading)]
            text-2xl text-black
          "
        >
          for 2
        </span>

        <p className="mt-4 text-xs tracking-[0.25em] uppercase text-black/60">
          swipe · match · watch
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-sm fade-in-3">
        <button
          onClick={() => router.push("/create")}
          className="
            w-full
            bg-[#FF3CAC]
            border-[3px] border-black
            shadow-[5px_5px_0px_#000000]
            rounded-xl py-4
            font-[family-name:var(--font-heading)]
            text-xl text-white uppercase tracking-wide
            active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
            transition-all duration-75
          "
        >
          Create a Room
        </button>

        <button
          onClick={() => router.push("/join")}
          className="
            w-full
            bg-[#FFFDF4]
            border-[3px] border-black
            shadow-[5px_5px_0px_#000000]
            rounded-xl py-4
            font-[family-name:var(--font-heading)]
            text-xl text-black uppercase tracking-wide
            active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
            transition-all duration-75
          "
        >
          Enter a Room
        </button>
      </div>

      {/* Decorative pills */}
      <div className="flex gap-2 mt-8 fade-in-4">
        <div className="w-8 h-2 rounded-full bg-[#FFE500] border border-black" />
        <div className="w-4 h-2 rounded-full bg-white border border-black" />
        <div className="w-8 h-2 rounded-full bg-[#FF3CAC] border border-black" />
      </div>

      {/* Xeno credit */}
      <p
        className="
          mt-6
          font-[family-name:var(--font-mono)]
          text-[10px] uppercase tracking-[0.2em]
          text-black/40 text-center
          fade-in-5
        "
      >
        Imagined, created, designed by Xeno
      </p>

      {/* Info modal */}
      {showInfo && (
        <div
          onClick={() => setShowInfo(false)}
          className="
            absolute inset-0
            bg-black/70 backdrop-blur-sm
            flex items-center justify-center
            z-50 p-6
            overflow-y-auto
          "
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              bg-[#FFFDF4]
              border-[3px] border-black
              shadow-[6px_6px_0px_#000000]
              rounded-xl
              px-6 py-7
              w-full max-w-sm
              flex flex-col gap-4
              my-auto
            "
          >
            {/* Header with close button */}
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl uppercase text-black leading-tight">
                How it works
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                className="
                  shrink-0 w-8 h-8 rounded-full
                  bg-black text-white
                  font-[family-name:var(--font-heading)]
                  text-sm
                  flex items-center justify-center
                  active:scale-90
                  transition-transform duration-75
                "
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* What the game is */}
            <div
              className="
                bg-[#FFE500]
                border-[2px] border-black
                rounded-lg px-3 py-2
                font-[family-name:var(--font-mono)]
                text-xs text-black leading-relaxed
              "
            >
              Can&apos;t agree on what to watch tonight? Movie Roulette decides for you. You swipe through movies — when you both say yes to the same one, that&apos;s movie night.
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-3">

              <div className="flex gap-3 items-start">
                <div
                  className="
                    shrink-0 w-7 h-7 rounded-full
                    bg-[#FF3CAC] border-[2px] border-black
                    font-[family-name:var(--font-heading)]
                    text-sm text-white
                    flex items-center justify-center
                  "
                >
                  1
                </div>
                <div>
                  <p className="font-[family-name:var(--font-heading)] text-sm uppercase text-black">
                    One creates
                  </p>
                  <p className="font-[family-name:var(--font-mono)] text-xs text-black/60 leading-relaxed mt-0.5">
                    Pick a 5-digit code and share it with your friend.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div
                  className="
                    shrink-0 w-7 h-7 rounded-full
                    bg-[#FF3CAC] border-[2px] border-black
                    font-[family-name:var(--font-heading)]
                    text-sm text-white
                    flex items-center justify-center
                  "
                >
                  2
                </div>
                <div>
                  <p className="font-[family-name:var(--font-heading)] text-sm uppercase text-black">
                    The other joins
                  </p>
                  <p className="font-[family-name:var(--font-mono)] text-xs text-black/60 leading-relaxed mt-0.5">
                    Type the same code, hit Join. The game begins.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div
                  className="
                    shrink-0 w-7 h-7 rounded-full
                    bg-[#FF3CAC] border-[2px] border-black
                    font-[family-name:var(--font-heading)]
                    text-sm text-white
                    flex items-center justify-center
                  "
                >
                  3
                </div>
                <div>
                  <p className="font-[family-name:var(--font-heading)] text-sm uppercase text-black">
                    You both swipe
                  </p>
                  <p className="font-[family-name:var(--font-mono)] text-xs text-black/60 leading-relaxed mt-0.5">
                    ✕ to skip, ✓ to say &quot;I&apos;d watch this.&quot; Neither of you sees the other&apos;s picks.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div
                  className="
                    shrink-0 w-7 h-7 rounded-full
                    bg-[#22c55e] border-[2px] border-black
                    font-[family-name:var(--font-heading)]
                    text-sm text-white
                    flex items-center justify-center
                  "
                >
                  ✓
                </div>
                <div>
                  <p className="font-[family-name:var(--font-heading)] text-sm uppercase text-black">
                    Match found
                  </p>
                  <p className="font-[family-name:var(--font-mono)] text-xs text-black/60 leading-relaxed mt-0.5">
                    When you both checkmark the same movie, that&apos;s the one. Movie night decided.
                  </p>
                </div>
              </div>
            </div>


            {/* Tip */}
            <p
              className="
                font-[family-name:var(--font-mono)]
                text-[10px] text-black/40 text-center
                border-t border-black/10 pt-3 mt-1
                leading-relaxed
              "
            >
              Tip: on desktop, use ← and → arrow keys to swipe.
            </p>


            {/* Privacy note */}
            <div
              className="
                bg-[#0D9488]/10
                border-[2px] border-black/20
                rounded-lg px-3 py-2
                font-[family-name:var(--font-mono)]
                text-[10px] text-black/70 leading-relaxed
                text-center
              "
            >
              No accounts. No tracking. Your name lives in server memory while you play, then it&apos;s gone.
            </div>

            {/* TMDB credit */}
            <p className="font-[family-name:var(--font-mono)] text-[10px] text-black/40 text-center leading-relaxed">
              Movie data from{" "}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-black/60 transition-colors duration-150"
              >
                TMDB
              </a>
            </p>
        </div>
      </div>
      )}
    </main>
  );
}
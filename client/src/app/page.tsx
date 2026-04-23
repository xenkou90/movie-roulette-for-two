"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main
      className="
        full-height
        bg-[#0D9488]
        flex flex-col items-center justify-center
        p-6
        font-[family-name:var(--font-mono)]
      "
    >
      {/* Three decorative dots at the top */}
      <div className="flex gap-2 mb-8">
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
      <div className="flex flex-col gap-4 w-full max-w-sm">
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
      <div className="flex gap-2 mt-8">
        <div className="w-8 h-2 rounded-full bg-[#FFE500] border border-black" />
        <div className="w-4 h-2 rounded-full bg-white border border-black" />
        <div className="w-8 h-2 rounded-full bg-[#FF3CAC] border border-black" />
      </div>
    </main>
  );
}
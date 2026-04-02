"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import socket from "@/lib/socket";

export default function WaitingRoom() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = params.code as string;
  const name = searchParams.get("name") || "Player";
  const isHost = searchParams.get("host") === "true";

  const [friendJoined, setFriendJoined] = useState(false);
  const [statusText, setStatusText] = useState(
    isHost ? "Waiting for your friend..." : "Your friend is getting things ready..."
  );

  useEffect(() => {
    socket.connect();

    socket.on("room:ready", ({ players }: { players: string[] }) => {
      setFriendJoined(true);
      setStatusText("Both players in! Loading movies...");
    });

    socket.on("game:start", ({ firstMovie }: { firstMovie: { id: number, title: string; poster_path: string; release_date: string } }) => {
      router.push(
        `/room/${code}/game?name=${encodeURIComponent(name)}&firstMovieId=${firstMovie.id}&firstMovieTitle=${encodeURIComponent(firstMovie.title)}&firstMoviePoster=${encodeURIComponent(firstMovie.poster_path)}&firstMovieYear=${firstMovie.release_date.split("-")[0]}`
      );
    });

    return () => {
      socket.off("room:ready");
      socket.off("game:start");
    };
  }, [code, name, router]);

return (
    <main className="min-h-screen bg-[#0D9488] flex flex-col items-center justify-center p-6">

      <div className="flex gap-2 mb-8">
        <div className="w-3 h-3 rounded-full bg-[#FF3CAC] border-2 border-black" />
        <div className="w-3 h-3 rounded-full bg-[#FFE500] border-2 border-black" />
        <div className="w-3 h-3 rounded-full bg-white border-2 border-black" />
      </div>

      <div
        className="
          bg-[#FFFDF4]
          border-[3px] border-black
          shadow-[6px_6px_0px_#000000]
          rounded-xl
          px-8 py-8
          w-full max-w-sm
          flex flex-col items-center gap-6
        "
      >
        <h2 className="font-[family-name:var(--font-heading)] text-3xl uppercase text-black text-center">
          {isHost ? "Your Room" : "Joined!"}
        </h2>

        {isHost && (
          <div className="flex flex-col items-center gap-2 w-full">
            <p className="text-xs uppercase tracking-widest text-black/60 font-[family-name:var(--font-mono)]">
              Share this code
            </p>
            <div
              className="
                bg-[#FFE500]
                border-[3px] border-black
                shadow-[4px_4px_0px_#000000]
                rounded-xl
                px-6 py-3
                font-[family-name:var(--font-heading)]
                text-5xl tracking-[0.3em] text-black
              "
            >
              {code}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center gap-3">
            <div
              className={`
                w-3 h-3 rounded-full border-2 border-black
                ${friendJoined ? "bg-[#22c55e]" : "bg-[#FFE500] animate-pulse"}
              `}
            />
            <p className="font-[family-name:var(--font-mono)] text-sm text-black">
              {statusText}
            </p>
          </div>
        </div>

        <div className="w-full border-t-[2px] border-black/10 pt-4 text-center">
          <p className="font-[family-name:var(--font-mono)] text-xs text-black/40 uppercase tracking-widest">
            Playing as
          </p>
          <p className="font-[family-name:var(--font-heading)] text-2xl text-black mt-1">
            {name}
          </p>
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
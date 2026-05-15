"use client";

import { useEffect, useState, useRef } from "react";
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
  const [abandoned, setAbandoned] = useState(false);

  const [copyStatus, setCopyStatus] = useState("");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const shareUrl = `${appUrl}/join?code=${code}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("Failed");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  }

  async function handleShare() {
    const shareData = {
      title: "Movie Roulette for 2",
      text: "Let's pick a movie tonight. Join my room.",
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the share dialog — silent, no action
      }
    } else {
      handleCopy();
    }
  }

  const codeRef = useRef(code);
  const nameRef = useRef(name);

  useEffect(() => {
    socket.connect();
    socket.emit("wait:ready", { code: codeRef.current });

    socket.on("room:ready", () => {
      setFriendJoined(true);
      setStatusText("Both players in! Loading movies...");
    });

    socket.on("game:start", () => {
      router.replace(`/room/${codeRef.current}/game?name=${encodeURIComponent(nameRef.current)}`);
    });

    socket.on("room:abandoned", () => {
      setAbandoned(true);
      setTimeout(() => {
        router.replace("/");
      }, 4000);
    });

    return () => {
      socket.off("room:ready");
      socket.off("game:start");
      socket.off("room:abandoned");
    };
  }, [router]);

return (
    <main className="full-height bg-[#0D9488] flex flex-col items-center justify-center p-6 relative">

      {abandoned && (
        <div
          className="
          absolute inset-0
          bg-black/70
          backdrop-blur-sm
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
              Movie night cancelled
            </div>

            <p
              className="
                font-[family-name:var(--font-mono)]
                text-sm text-black/80
                leading-relaxed
              "
            >
              Looks like your friend never made it. Heading back home — try again when you&apos;re both ready.
            </p>

            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}

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

            <div className="flex gap-2 w-full">
              <button
                onClick={handleCopy}
                className="
                  flex-1
                  bg-[#FFFDF4]
                  border-[3px] border-black
                  shadow-[3px_3px_0px_#000000]
                  rounded-lg py-2
                  font-[family-name:var(--font-heading)]
                  text-sm text-black uppercase tracking-wide
                  active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                  transition-all duration-75
                "
              >
                {copyStatus || "Copy Link"}
              </button>
              <button
                onClick={handleShare}
                className="
                  flex-1
                  bg-[#FF3CAC]
                  border-[3px] border-black
                  shadow-[3px_3px_0px_#000000]
                  rounded-lg py-2
                  font-[family-name:var(--font-heading)]
                  text-sm text-white uppercase tracking-wide
                  active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                  transition-all duration-75
                "
              >
                Share
              </button>
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
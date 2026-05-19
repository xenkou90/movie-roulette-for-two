"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import socket from "@/lib/socket";

export default function CreateRoom() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shakeField, setShakeField] = useState<"name" | "code" | "">("");
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef(name);
  useEffect(() => {
    nameRef.current = name;
  }, [name]);

  useEffect(() => {
    socket.connect();

    socket.on("room:created", ({ code }: { code: string }) => {
      router.replace(`/room/${code}/wait?name=${encodeURIComponent(nameRef.current)}&host=true`);
    });

    socket.on("room:error", ({ message }: { message: string }) => {
      setError(message);
      setSubmitting(false);
    });

    return () => {
      socket.off("room:created");
      socket.off("room:error");
    };
  }, [router]);

  function handleSubmit() {
    if (!name.trim()) {
      setError("Enter your name.");
      setShakeField("name");
      setTimeout(() => setShakeField(""), 500);
      return;
    }
    if (!/^\d{5}$/.test(code)) {
      setError("Code must be exactly 5 digits.");
      setShakeField("code");
      setTimeout(() => setShakeField(""), 500);
      return;
    }
    setError("");
    setSubmitting(true);
    socket.emit("room:create", { code, name: name.trim() });
  }

  return (
    <main className="full-height bg-[#0D9488] flex flex-col items-center justify-center p-6">
      <div
        className="
          bg-[#FFFDF4]
          border-[3px] border-black
          shadow-[6px_6px_0px_#000000]
          rounded-xl
          px-8 py-8
          w-full max-w-sm
          flex flex-col gap-5
          "
        >
          <button
            onClick={() => router.replace("/")}
            className="
              self-start
              font-[family-name:var(--font-mono)]
              text-xs uppercase tracking-widest
              text-black/50 hover:text-black
              transition-colors duration-150
            "
          >
            ← Back
          </button>

          <h2 className="font-[family-name:var(--font-heading)] text-3xl uppercase text-black text-center">
            Create a Room
          </h2>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-black/60 font-[family-name:var(--font-mono)]">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sofia"
              maxLength={15}
              autoFocus
              className={`
                border-[3px] border-black
                rounded-lg px-4 py-3
                font-[family-name:var(--font-mono)]
                text-black bg-white
                focus:outline-none focus:shadow-[3px_3px_0px_#000000]
                placeholder:text-black/30
                ${shakeField === "name" ? "animate-shake" : ""}
              `}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-black/60 font-[family-name:var(--font-mono)]">
              Room Code (5 digits)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="e.g. 42068"
              className={`
                border-[3px] border-black
                rounded-lg px-4 py-3
                font-[family-name:var(--font-mono)]
                text-black bg-white text-center text-2xl tracking-[0.5em]
                focus:outline-none focus:shadow-[3px_3px_0px_#000000]
                placeholder:text-black/30 placeholder:text-base placeholder:tracking-normal
                ${shakeField === "code" ? "animate-shake" : ""}
              `}
            />
          </div>

          {error && (
            <p className="text-sm font-[family-name:var(--font-mono)] text-red-600 text-center">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
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
              disabled:opacitgy-60 disabled:cursor-not-allowed
            "
          >
            {submitting ? "Creating..." : "Create Room"}
          </button>
        </div>
    </main>
  );
}
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        console.error("Global error caught:", error);
    }, [error]);

    return (
        <main className="full-height bg-[#0D9488] flex flex-col items-center justify-center p-6 relative overflow0hidden">

            {/* Background blobs for visual consistency */}
            <div className="absolute top-[-60px] left-[-60px] w-48 h-48 rounded-full bg-[#FFE500] border-[3px] border-black opacity-40" />
            <div className="absolute bottom-[-40px] right-[-40px] w-36 h-36 rounded-full bg-[#FF3CAC] border-[3px] border-black opacity-40" />

            <div
                className="
                    bg-[#FFFDF4]
                    border-[3px] border-black
                    shadow-[6px_6px_0px_#000000]
                    rounded-xl
                    px-8 py-8
                    w-full max-w-sm
                    flex flex-col items-center gap-5
                    text-center
                    relative
                "
            >
                <div
                    className="
                        bg-[#FF3CAC]
                        border-[3px] border-black
                        shadow-[4px_4px_0px_#000000]
                        rounded-xl px-5 py-2
                        font-[family-name:var(--font-heading)]
                        text-xl uppercase tracking-wide text-white
                    "
                >
                    Something broke
                </div>

                <p className="font-[family-name:var(--font-mono)] text-sm text-black/70 leading-relaxed">
                    Movie night hit a snag. Try again or head back home — we&apos;ll get the popcorn back on track.
                </p>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={reset}
                        className="
                            w-full
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
                        Try Again
                    </button>

                    <button
                        onClick={() => router.replace("/")}
                        className="
                            w-full
                            bg-black
                            border-[3px] border-black
                            shadow-[4px_4px_0px_#000000]
                            rounded-xl py-3
                            font-[family-name:var(--font-heading)]
                            text-base text-white uppercase tracking-wide
                            active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
                            transition-all duration-75
                        "
                    >
                        Back to Home
                    </button>
                </div>
            </div>

            <p
                className="
                    mt-6
                    font-[family-name:var(--font-mono)]
                    text-[10px] uppercase tracking-[0.2em]
                    text-black/40 text-center
                "
            >
                Imagined, created, designed by Xeno
            </p>
        </main>
    );
}
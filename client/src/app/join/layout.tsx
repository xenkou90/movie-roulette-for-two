import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Enter a Room — Movie Roulette",
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
    return children;
}
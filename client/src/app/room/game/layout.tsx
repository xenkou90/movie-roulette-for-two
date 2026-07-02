import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Picking a Movie — Movie Roulette",
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
    return children;
}
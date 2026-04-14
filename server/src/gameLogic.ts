import { Room } from "./rooms";

export type MovieState = "unseen" | "skipped" | "checked";

export interface PlayerChoices {
    [movieId: number]: MovieState;
}

const playerChoices: Record<string, PlayerChoices> = {};

export function initPlayerChoices(socketId: string): void {
    playerChoices[socketId] = {};
}

export function getPlayerChoices(socketId: string): PlayerChoices {
    return playerChoices[socketId] || {};
}

export function setMovieState(
    socketId: string,
    movieId: number,
    state: MovieState
): void {
    if (!playerChoices[socketId]) {
        playerChoices[socketId] = {};
    }
    playerChoices[socketId][movieId] = state;
}

export function getMovieState(
    socketId: string,
    movieId: number
): MovieState {
    return playerChoices[socketId]?.[movieId] || "unseen";
}

export function cleanupPlayer(socketId: string): void {
    delete playerChoices[socketId];
}

export interface CheckResult {
    outcome: "match" | "missed" | "waiting";
    otherPlayerId?: string;
}

export function processCheck(
    room: Room,
    checkingPlayerId: string,
    movieId: number
): CheckResult {
    setMovieState(checkingPlayerId, movieId, "checked");

    const otherPlayer = room.players.find((p) => p.id !== checkingPlayerId);
    if (!otherPlayer) return { outcome: "waiting" };

    const otherState = getMovieState(otherPlayer.id, movieId);

    if (otherState === "checked") {
        return { outcome: "match", otherPlayerId: otherPlayer.id };
    }

    if (otherState === "skipped") {
        return { outcome: "missed", otherPlayerId: otherPlayer.id };
    }

    return { outcome: "waiting", otherPlayerId: otherPlayer.id };
}

export function processSkip(
    room: Room,
    skippingPlayerId: string,
    movieId: number
): { waitingPlayerId: string | null } {
    setMovieState(skippingPlayerId, movieId, "skipped");

    const otherPlayer = room.players.find((p) => p.id !== skippingPlayerId);
    if (!otherPlayer) return { waitingPlayerId: null };

    const otherState = getMovieState(otherPlayer.id, movieId);

    if (otherState === "checked") {
        return { waitingPlayerId: otherPlayer.id };
    }

    return { waitingPlayerId: null };
}
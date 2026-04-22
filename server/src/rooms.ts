import { Movie } from "./tmdb";

export interface Player {
  id: string;
  name: string;
  movieIndex: number;
}

export interface Room {
  code: string;
  players: Player[];
  movies: Movie[];
}

const rooms: Record<string, Room> = {};

export function createRoom(code: string, player: Omit<Player, "movieIndex">): Room {
  const room: Room = {
    code,
    players: [{ ...player, movieIndex: 0 }],
    movies: [],
  };
  rooms[code] = room;
  return room;
}

export function joinRoom(code: string, player: Omit<Player, "movieIndex">): Room | null {
  const room = rooms[code];
  if (!room) return null;
  if (room.players.length >= 2) return null;
  room.players.push({ ...player, movieIndex: 0 });
  return room;
}

export function getRoom(code: string): Room | null {
  return rooms[code] || null;
}

export function setMovieQueue(code: string, movies: Movie[]): void {
  const room = rooms[code];
  if (!room) return;
  room.movies = movies;
}

export function updateMovieInQueue(code: string, index: number, movie: Movie): void {
  const room = rooms[code];
  if (!room) return;
  room.movies[index] = movie;
}

export function removePlayerFromRoom(code: string, playerId: string): void {
  const room = rooms[code];
  if (!room) return;
  room.players = room.players.filter((p) => p.id !== playerId);
  if (room.players.length === 0) {
    delete rooms[code];
  }
}

export function deleteRoom(code: string): void {
  delete rooms[code];
}
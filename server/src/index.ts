import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import {
  createRoom,
  joinRoom,
  getRoom,
  setMovieQueue,
  updateMovieInQueue,
  removePlayerFromRoom,
} from "./rooms";
import { fetchMovieQueue, enrichMovieDetails } from "./tmdb";
import {
  initPlayerChoices,
  processCheck,
  processSkip,
  cleanupPlayer,
  setMovieState,
} from "./gameLogic";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"]
});

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function getEnrichedMovie(code: string, index: number) {
  const room = getRoom(code);
  if (!room || !room.movies[index]) return null;

  let movie = room.movies[index];
  if (!movie.details_fetched) {
    console.log(`Enriching: ${movie.title}`);
    movie = await enrichMovieDetails(movie);
    updateMovieInQueue(code, index, movie);
  }
  return movie;
}

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("room:create", (data: { code: string; name: string }) => {
    const existingRoom = getRoom(data.code);
    if (existingRoom) {
      socket.emit("room:error", { message: "Room code already in use." });
      return;
    }
    const player = { id: socket.id, name: data.name };
    const room = createRoom(data.code, player);
    socket.join(data.code);
    initPlayerChoices(socket.id);
    console.log(`Room created: ${room.code} by ${player.name}`);
    socket.emit("room:created", { code: room.code });
  });

  socket.on("room:join", async (data: { code: string; name: string }) => {
    const room = joinRoom(data.code, { id: socket.id, name: data.name });
    if (!room) {
      socket.emit("room:error", { message: "Room not found or already full." });
      return;
    }
    socket.join(data.code);
    initPlayerChoices(socket.id);
    console.log(`${data.name} joined room ${data.code}`);

    io.to(data.code).emit("room:ready", {
      players: room.players.map((p) => p.name),
    });

    console.log(`Fetching movies for room ${data.code}...`);
    const movies = await fetchMovieQueue();
    setMovieQueue(data.code, movies);
    console.log(`Movies ready for room ${data.code}. Starting game.`);

    io.to(data.code).emit("game:start");
  });

  socket.on("game:ready", async ({ code }: { code: string }) => {
    const room = getRoom(code);
    if (!room || room.movies.length === 0) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    const movie = await getEnrichedMovie(code, player.movieIndex);
    if (!movie) return;

    socket.emit("movie:show", { movie });
  });

  socket.on("movie:skip", async ({ code, movieId }: { code: string; movieId: number }) => {
    const room = getRoom(code);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    const { waitingPlayerId } = processSkip(room, socket.id, movieId);

    if (waitingPlayerId) {
      io.to(waitingPlayerId).emit("match:missed");

      const waitingPlayer = room.players.find((p) => p.id === waitingPlayerId);
      if (waitingPlayer) {
        waitingPlayer.movieIndex += 1;
        const nextMovieForWaiter = await getEnrichedMovie(code, waitingPlayer.movieIndex);
        if (nextMovieForWaiter) {
          io.to(waitingPlayer.id).emit("movie:show", { movie: nextMovieForWaiter });
        }
      }
    }

    player.movieIndex += 1;

    if (player.movieIndex >= room.movies.length) {
      console.log(`Fetching more movies for room ${code}...`);
      const moreMovies = await fetchMovieQueue();
      moreMovies.forEach((m) => room.movies.push(m));
    }

    const nextMovie = await getEnrichedMovie(code, player.movieIndex);
    if (!nextMovie) return;

    socket.emit("movie:show", { movie: nextMovie });
  });

  socket.on("movie:check", async ({ code, movieId }: { code: string; movieId: number }) => {
    const room = getRoom(code);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    const result = processCheck(room, socket.id, movieId);

    if (result.outcome === "match") {
      const movie = room.movies.find((m) => m.id === movieId);
      io.to(code).emit("match:found", { movie });
      return;
    }

    if (result.outcome === "missed") {
      socket.emit("match:missed");
      player.movieIndex += 1;
      const nextMovie = await getEnrichedMovie(code, player.movieIndex);
      if (nextMovie) socket.emit("movie:show", { movie: nextMovie });
      return;
    }

    // outcome === "waiting" - do nothing, hold state until other player acts
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    cleanupPlayer(socket.id);

    const allRoomCodes = Object.keys(
      (io.sockets.adapter.rooms as Map<string, Set<string>>)
    );

    allRoomCodes.forEach((code) => {
      removePlayerFromRoom(code, socket.id);
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
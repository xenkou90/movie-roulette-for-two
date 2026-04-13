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

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
});

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

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

    let movie = room.movies[player.movieIndex];
    if (!movie) return;

    if (!movie.details_fetched) {
      console.log(`Enriching movie details for: ${movie.title}`);
      movie = await enrichMovieDetails(movie);
      updateMovieInQueue(code, player.movieIndex, movie);
    }

    socket.emit("movie:show", { movie });
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
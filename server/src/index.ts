import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { createRoom, joinRoom, getRoom, removePlayerFromRoom } from "./rooms";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://loclahost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"]
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

  socket.on("room:join", (data: { code: string; name: string }) => {
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
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});


const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
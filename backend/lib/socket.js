import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

//List of online users
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("connected", socket.id);

  const userId = socket.handshake.query.userId;

  console.log(userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("disconnected", socket.id);

    delete userSocketMap[userId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server, getReceiverSocketId };

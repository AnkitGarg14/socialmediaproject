import { Server } from "socket.io";

export const userSocketMap = {};
let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;
    }

    socket.on("disconnect", () => {
      for (const id in userSocketMap) {
        if (userSocketMap[id] === socket.id) {
          delete userSocketMap[id];
          break;
        }
      }
    });
  });
};

export const getIO = () => io;

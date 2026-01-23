import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  autoConnect: false,
  transports: ["websocket"],
});

// Update query when userId is available
export const updateSocketUserId = (userId) => {
  socket.io.opts.query = { userId };
};

export default socket;


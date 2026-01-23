

import Message from "../models/Message.js";
import imagekit from "../configs/imagekit.js";
import { userSocketMap, getIO } from "../socket/socket.js";

// ================= SEND MESSAGE =================
export const sendMessage = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { to_user_id, text } = req.body;
    const image = req.file;

    console.log("Sending message from:", userId, "to:", to_user_id);

    let media_url = "";
    let message_type = image ? "image" : "text";

    if (image) {
      const response = await imagekit.upload({
        file: image.buffer,
        fileName: image.originalname,
      });

      media_url = imagekit.url({
        path: response.filePath,
        transformation: [{ quality: "auto" }, { format: "webp" }],
      });
    }

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
      seen: false,
    });

    console.log("Message created:", message._id, "Socket map:", Object.keys(userSocketMap));

    // 🔥 SOCKET EMIT
    const io = getIO();
    const receiverSocketId = userSocketMap[to_user_id];

    console.log("Receiver socket ID:", receiverSocketId, "for user:", to_user_id);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
      console.log("Message emitted to receiver");
    }

    res.json({ success: true, message });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ================= GET CHAT =================
export const getChatMessage = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { to_user_id } = req.query;

    if (!to_user_id) {
      return res.json({ success: false, message: "to_user_id is required" });
    }

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id: to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ],
    }).sort({ createdAt: 1 });

    // mark as seen
    await Message.updateMany(
      { from_user_id: to_user_id, to_user_id: userId, seen: false },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ================= RECENT MESSAGES =================
export const getUserRecentMessages = async (req, res) => {
  try {
    const { userId } = await req.auth();

    const messages = await Message.find({
      to_user_id: userId 
    })
      .populate("from_user_id to_user_id")
      .sort({ createdAt: -1 });

    console.log("Recent messages fetched:", messages.length);
    res.json({ success: true, messages });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

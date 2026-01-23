import React, { useState, useRef, useEffect } from "react";
import { ImageIcon, SendHorizontal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import socket, { updateSocketUserId } from "../../socket";
import api from "../api/axios";
import {
  fetchMessages,
  addMessage,
} from "../features/messages/messagesSlice";
import { useAuth } from "@clerk/clerk-react";
import { fetchUser } from "../features/user/userSlice";
import { useParams } from "react-router-dom";

const ChatBox = () => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const {userId}=useParams();

  const { messages } = useSelector((state) => state.messages);

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  const { getToken } = useAuth();
  const user=useSelector((state)=>state.user.value)

  // ================= FETCH OTHER USER =================
  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const token = await getToken();
        const { data } = await api.post('/api/user/profiles', { profileId: userId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          setOtherUser(data.profile);
        }
      } catch (error) {
        console.error("Error fetching other user:", error);
      }
    };
    if (userId) {
      fetchOtherUser();
    }
  }, [userId, getToken]);

  // ================= SOCKET CONNECT (ONLY ONCE) =================
  useEffect(() => {
    if (user?._id) {
      updateSocketUserId(user._id);
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  // ================= SOCKET LISTENER =================
  useEffect(() => {
    const handleNewMessage = (message) => {
      console.log("New message received:", message, "userId:", userId, "user._id:", user?._id);
      if (
        String(message.from_user_id) === String(userId) ||
        String(message.to_user_id) === String(userId)
      ) {
        console.log("Message matches current chat, adding to state");
        dispatch(addMessage(message));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [userId, dispatch]);

  // ================= FETCH CHAT =================
  useEffect(() => {
    if (userId) {
      const loadMessages = async () => {
        const token = await getToken();
        dispatch(fetchMessages({ token, userId }));
      };
      loadMessages();
    }
  }, [userId, dispatch, getToken]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {
    if (!text && !image ) return;

    const token = await getToken();

    const formData = new FormData();
    formData.append("to_user_id", userId);
    if (text) formData.append("text", text);
    if (image) formData.append("image", image);

    try {
      const { data } = await api.post("/api/message/send", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type':'multipart/form-data'
        },
      });

      if (data.success) {
        console.log("Message sent successfully:", data.message);
        dispatch(addMessage(data.message));
        setText("");
        setImage(null);
      } else {
        console.error("Failed to send message:", data);
      }
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error.message);
    }
  };

  if (!user) return null;

  return user && (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300">
        <img
          src={otherUser?.profile_picture}
          className="size-8 rounded-full"
          alt=""
        />
        <div>
          <p className="font-medium">{otherUser?.full_name || 'Loading...'}</p>
          <p className="text-sm text-gray-500 -mt-1.5">
            @{otherUser?.username || ''}
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="p-5 md:px-10 h-full overflow-y-scroll">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.toSorted((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)).map((message, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                message.from_user_id === user._id
                  ? "items-end "
                  : "items-start"
              }`}
            >
              <div
                className={`p-2 text-sm max-w-sm  rounded-lg shadow ${
                  message.from_user_id === user._id
                    ? "bg-[#dcf8c6] text-slate-800 rounded-br-none"
                    : "bg-white text-slate-700 rounded-bl-none"
                }`}
              >
                {message.message_type === "image" && (
                  <img
                    src={message.media_url}
                    className="w-full max-w-sm rounded-lg mb-1"
                    alt=""
                  />
                )}
                <p>{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="w-full flex justify-center px-4 pb-3 mt-auto">
        <div className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5">
          <input
            type="text"
            className="flex-1 outline-none text-slate-700"
            placeholder="Type a message...."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <label htmlFor="image">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                className="h-8 rounded"
                alt=""
              />
            ) : (
              <ImageIcon className="size-7 text-gray-400 cursor-pointer" />
            )}
            <input
              type="file"
              id="image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>

          <button
            onClick={sendMessage}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full"
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;

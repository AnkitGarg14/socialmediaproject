
import Message from "../models/Message.js";
import fs from "fs";
import imagekit from "../configs/imagekit.js";
import { userSocketMap, getIO } from "../socket/socket.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;
    const image = req.file;

    let media_url = "";
    let message_type = image ? "image" : "text";

    if (image) {
      const fileBuffer = fs.readFileSync(image.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: image.originalname,
      });

      media_url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
    }

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });

    // 🔥 SOCKET EMIT
    const receiverSocketId = userSocketMap[to_user_id];
    const io = getIO();

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.json({ success: true, message });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


//MESSAGE DEKHNE KE LIYE

 export const getChatMessage=async(req,res)=>{
  try{
    const {userId}=req.auth();
    const {to_user_id}=req.body;

    const messages=await Message.find({
      $or:[
        {from_user_id:userId,to_user_id},
        {from_user_id:to_user_id,to_user_id:userId},
      ]
    }).sort({created_at:-1})

    //mark message as seen;
    await Message.updateMany({from_user_id:to_user_id,to_user_id:userId},{seen:true})

    res.json({success:true,messages});

  }catch(error){
    res.json({success:false,message:error.message});

  }
 }

 
 export const getUserRecentMessages=async(req,res)=>{
      try{
        const {userId}=req.auth();
        const messages=(await Message.find({to_user_id:userId}).populate('from_user_id to_user_id')).toSorted({created_at:-1});

        res.json({success:true,messages});

      }catch(error){
        res.json({success:false,message:error.message});
      }
 }
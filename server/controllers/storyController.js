import imagekit from "../configs/imagekit.js";
import Story from "../models/Story.js";
import User from "../models/User.js";
import { inngest } from "../inngest/index.js";
//Add User Story;
  export const addUserStory=async(req,res)=>{
    try{
      const {userId}=await req.auth();
      const {content ,media_type,background_color}=req.body;
      const media=req.file
      let media_url=""

      //upload media to imagekit
      if(media_type==="image"||media_type==="video"){
        if(media){
          const response =await imagekit.upload({
            file:media.buffer,
            fileName:media.originalname,
          })
          media_url=response.url;
        }
      }
      //create Story
      const story=await Story.create({
        user:userId,
        content,
        media_type,
        media_url,
        background_color,
      })
      res.json({success:true})
    }catch(error){
      console.log(error);
      res.json({success:false,message:error.message});
    }
  }

//get user story;
export const getStories=async(req,res)=>{
  try{
     const {userId}=await req.auth();
     const user=await User.findById(userId);

     //User connection and followings
     const userIds=[userId,...user.connections,...user.following]

     const stories=await Story.find({
        user:{$in:userIds}
     }).populate('user').sort({createdAt:-1});

     res.json({success:true,stories});

  }catch(error){
    console.log(error);
    res.json({success:false,message:error.message});
  }
}

import fs from 'fs';
import Post from '../models/Post.js';
import imagekit from '../configs/imagekit.js';
import User from '../models/User.js';
//Add post
export const addPost=async(req,res)=>{
  try{
     const {userId}=req.auth();
     const {content,post_type}=req.body;
     const images=req.files  //upload middle ware se aagya;

     let image_urls=[]  //post ki images lo store jarenge iss arre me unke url ko

     if(images.length){
        image_urls=await Promise.all(
          images.map(async(image)=>{
            const fileBuffer=fs.readFileSync(length.path)
            const response=await imagekit.upload({
              file:buffer,
              fileName:image.originalname,
              folder:"posts",
            })
            const url=imagekit.url({
              path:response.filePath,
              transformation:[
                {quality:"auto"},
                {format:"webp"},
                {width:'1280'}
              ]
            })
            return url
          })
        )
     }
     await Post.create({
      user:userId,
      content,
      image_urls,
      post_type,
     })
     res.json({success:true,message:"post created Successfully"})
  }catch(error){
    console.log(error);
    res.json({success:false,message:error.message});

  }
}

//Get post 
export const getFeedPosts=async(req,res)=>{
  try{
    const {userId}=req.auth();
    const user=await User.findById(userId);

    //User connection and following
    const userIds=[userId,...user.connections,...user.following] //in sab ke id store kar rahe;

    const post =await Post.find({user:{$in:userIds}}).populate('user').sort({createdAt:-1});

    res.json({success:true,posts})
  }catch(error){
     console.log(error);
    res.json({success:false,message:error.message});
  }

}

//like  & dislike post 
export const likePost=async (req,res)=>{

  try{
    const {userId}=req.auth()
    const {postId}=req.body;
    const post=await Post.findById(postId);

    if(post.likes_count.includes(userId)){
      post.likes_count=post.likes_count.filter(user=>user!==userId); //unlike kar diye pahle like thi
      await post.save();
      res.json({success:true,message:"post unliked"});
    }else{
      post.likes_count.push(userId);
      await post.save();
      res.json({success:true,message:'post liked'});
    }
  }catch(error){
    console.log(error);
    res.json({success:false,message:error.message});
  }

}



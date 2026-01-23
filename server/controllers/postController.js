import Post from '../models/Post.js';
import imagekit from '../configs/imagekit.js';
import User from '../models/User.js';
//Add post
export const addPost=async(req,res)=>{
  try{
     const {userId}=await req.auth();
     const {content,post_type}=req.body;
     const images=req.files  //upload middle ware se aagya;

     let image_urls=[]  //post ki images lo store jarenge iss arre me unke url ko

     if(images && images.length){
        image_urls=await Promise.all(
          images.map(async(image)=>{
            const response=await imagekit.upload({
              file:image.buffer,
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
    const {userId}=await req.auth();
    const user=await User.findById(userId);

    //User connection and following
    const userIds=[userId,...user.connections,...user.following] //in sab ke id store kar rahe;

    const posts =await Post.find({user:{$in:userIds}}).populate('user').sort({createdAt:-1});

    res.json({success:true,posts})
  }catch(error){
     console.log(error);
    res.json({success:false,message:error.message});
  }

}

//like  & dislike post 
export const likePost=async (req,res)=>{

  try{
    const {userId}=await req.auth()
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

// Add comment to post
export const addComment=async(req,res)=>{
  try{
    const {userId}=await req.auth();
    const {postId,text}=req.body;

    const post=await Post.findById(postId);
    if(!post){
      return res.json({success:false,message:"Post not found"});
    }

    post.comments.push({user:userId,text});
    await post.save();

    // Populate the new comment with user data
    await post.populate('comments.user');

    res.json({success:true,message:"Comment added",post});
  }catch(error){
    console.log(error);
    res.json({success:false,message:error.message});
  }
}

// Get comments for a post
export const getComments=async(req,res)=>{
  try{
    const {postId}=req.body;
    const post=await Post.findById(postId).populate('comments.user');

    if(!post){
      return res.json({success:false,message:"Post not found"});
    }

    res.json({success:true,comments:post.comments});
  }catch(error){
    console.log(error);
    res.json({success:false,message:error.message});
  }
}

// Delete comment from post
export const deleteComment=async(req,res)=>{
  try{
    const {userId}=await req.auth();
    const {postId,commentId}=req.body;

    const post=await Post.findById(postId);
    if(!post){
      return res.json({success:false,message:"Post not found"});
    }

    const comment=post.comments.id(commentId);
    if(!comment){
      return res.json({success:false,message:"Comment not found"});
    }

    if(comment.user.toString()!==userId){
      return res.json({success:false,message:"You can only delete your own comments"});
    }

    post.comments.pull(commentId);
    await post.save();

    res.json({success:true,message:"Comment deleted"});
  }catch(error){
    console.log(error);
    res.json({success:false,message:error.message});
  }
}



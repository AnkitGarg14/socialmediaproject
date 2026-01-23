import express from "express";
import {upload} from "../configs/multer.js";
import { protect } from "../middlewares/auth.js";
import {addPost, getFeedPosts, likePost, addComment, getComments, deleteComment} from "../controllers/postController.js"


const postRouter=express.Router();

postRouter.post('/add',upload.array('images',4),protect,addPost);
postRouter.get('/feed',protect,getFeedPosts);
postRouter.post('/like',protect,likePost);
postRouter.post('/comment/add',protect,addComment);
postRouter.post('/comment/get',getComments);
postRouter.post('/comment/delete',protect,deleteComment);

export default postRouter;

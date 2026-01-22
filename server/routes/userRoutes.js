import express from "express";
import {getUserData,updateUserData,discoverUsers, followUser, unfollowUser, sendConnectionRequest, acceptConnectionRequest, getUserConnection} from "../controllers/userController.js"
import { protect } from "../middlewares/auth.js";
import {upload} from "../configs/multer.js"

const userRouter=express.Router();

userRouter.get('/data',protect,getUserData)
userRouter.post("/update",upload.fields([{name:'profile',maxCunt:1},{name:'cover',maxCount:1}]),protect,updateUserData);

userRouter.post('/discover',protect,discoverUsers);
userRouter.post('follow',protect,followUser);
userRouter.post("/unfollow",protect,unfollowUser);
userRouter.post("/connection",protect,sendConnectionRequest);
userRouter.post('/accept',protect,acceptConnectionRequest);
userRouter.get('/connections',protect,getUserConnection);


export default userRouter

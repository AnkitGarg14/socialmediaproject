import express from 'express';
import {upload} from "../configs/multer.js";
import {protect} from "../middlewares/auth.js"
import { getChatMessage, sendMessage } from '../controllers/messageController.js';

const messageRouter=express.Router();

messageRouter.post('/send',upload.single('image'),protect,sendMessage)
messageRouter.get('/send',protect,getChatMessage);

export default messageRouter;
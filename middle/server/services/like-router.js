import express from "express";
import asyncHandler from 'express-async-handler';

import likesHandler from './likes-handler';

let likeRouter = express.Router();

likeRouter.put('/', asyncHandler(likesHandler.addLike));

likeRouter.delete('/:id', asyncHandler(likesHandler.removeLike));

export default likeRouter;
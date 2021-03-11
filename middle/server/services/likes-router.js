import express from "express";
import asyncHandler from 'express-async-handler';

import likesHandler from './likes-handler';

let likesRouter = express.Router();

likesRouter.put('/', asyncHandler(likesHandler.addLike));

likesRouter.delete('/:id', asyncHandler(likesHandler.removeLike));

export default likesRouter;
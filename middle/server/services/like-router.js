import express from "express";
import asyncHandler from 'express-async-handler';

import usersHandler from './users-handler';

let likeRouter = express.Router();

likeRouter.put('/', asyncHandler(usersHandler.addLike));

likeRouter.delete('/:id', asyncHandler(usersHandler.removeLike));

export default likeRouter;
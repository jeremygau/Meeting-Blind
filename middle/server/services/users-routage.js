import express from "express";
import asyncHandler from 'express-async-handler';

import usersHandler from './users-handler';

let usersRouter = express.Router();

usersRouter.post('/', asyncHandler(usersHandler.create));

usersRouter.get('/:id', asyncHandler(usersHandler.getUserById));

export default usersRouter;

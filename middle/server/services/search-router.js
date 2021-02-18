import express from "express";
import asyncHandler from 'express-async-handler';

import usersHandler from './users-handler';

let searchRouter = express.Router();

//searchRouter.get('/:city', asyncHandler(usersHandler.getUsersFromTown));

export default searchRouter;
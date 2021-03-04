import asyncHandler from "express-async-handler";
import connectionHandler from './connection-handler';

const express = require("express");

const connectionRouter = express.Router();

connectionRouter.post('/connect', asyncHandler(connectionHandler));
connectionRouter.get('/disconnect', (req, res) => {
    req.session.requesterId = undefined;
    res.status(200).end();
});

export default connectionRouter;
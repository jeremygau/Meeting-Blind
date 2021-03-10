import express from "express";
import asyncHandler from 'express-async-handler';
import conversationsHandler from './conversations-handler';

let conversationsRouter = express.Router();

conversationsRouter.get('/:id', asyncHandler(conversationsHandler.getConversation));
conversationsRouter.delete('/:id', asyncHandler(conversationsHandler.deleteConversation));
conversationsRouter.post('/', asyncHandler(conversationsHandler.addMessage));
conversationsRouter.delete('/', asyncHandler(conversationsHandler.deleteMessage));
conversationsRouter.get('/check/newMessages', asyncHandler(conversationsHandler.hasNewMessages));
conversationsRouter.get('/', asyncHandler(conversationsHandler.getAllConversations));



export default conversationsRouter;
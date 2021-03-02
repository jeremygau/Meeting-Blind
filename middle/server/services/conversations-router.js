import express from "express";
import asyncHandler from 'express-async-handler';
import conversationsHandler from './conversations-handler';

let conversationsRouter = express.Router();

conversationsRouter.get('/', asyncHandler(conversationsHandler.getAllConversations));
conversationsRouter.get('/:id', asyncHandler(conversationsHandler.getConversation));
conversationsRouter.delete('/:id', asyncHandler(conversationsHandler.deleteConversation));
conversationsRouter.post('/', asyncHandler(conversationsHandler.addMessage));
//TODO faire la route pour la suppression d'un message, idealement en delete.
/*Pour ça : vérifier la tronche de l'URL envoyé avec delete et les params.*/


export default conversationsRouter;
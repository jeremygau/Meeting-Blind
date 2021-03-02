import convRep from './conversations-repository';
import usersHandler from './users-handler';

async function createConversation(userId) {
    let requesterId = 0 //TODO récupérer l'id via les cookies
    if (!await usersHandler.likeEachOther(requesterId, userId)) {
        return false;
    }
    if (await conversationExist(requesterId, userId)) {
        return false;
    }
    await convRep.createEmptyConversation(requesterId, userId)
    return true;
}

async function deleteConversation(req, res) {
    try {
        let requesterId = 0 //TODO récupérer id via cookie
        let userId = req.params.id;
        await convRep.deleteConversation(requesterId, userId);
        res.status(200).end();
    } catch (error) {
        res.status(400).end();
    }
}

async function blockConversation(requesterId, userId) {
    let result = await convRep.getConversation(requesterId, userId);
    if (result.body.hits.total.value === 0) return false;
    let conv = result.body.hits.hits._source;
    conv.blocked = true;
    await convRep.deleteConversation(requesterId, userId);
    await convRep.store(conv);
    return true;
}

function markAsReadIfValid(conversation, requesterId) {
    if(! conversation.hasUnreadMessages) return;
    let message = getLastMessage(conversation);
    if (parseInt(message.sender) !== requesterId){
        conversation.hasUnreadMessages = false;
    }
}

async function getConversation(req, res) {
    try {
        res.set('Content-Type', 'application/json');
        let requesterId = 0; //TODO récupérer l'id via cookie
        let userId = req.params.id;
        let conv = await getConversationGeneric(userId, requesterId);
        if (conv === null) res.status(403).end();
        markAsReadIfValid(conversation, requesterId);
        res.send(conv)
    } catch (error) {
        res.status(400).end();
    }
}

async function getConversationGeneric(userId, requesterId) {
    let result = await convRep.getConversation(requesterId, userId);
    if (result.body.hits.total.value === 0) {
        return null;
    }
    let conv = result.body.hits.hits._source;
    sortMessagesByTimestamp(conv);
    conv.user1 = await usersHandler.getUserByIdGeneric(requesterId);
    conv.user2 = await usersHandler.getUserByIdGeneric(userId);
    return conv;
}

async function getAllConversations(req, res) {
    try {
        let requesterId = 0 //TODO récupérer Id via cookie
        let results = await convRep.getAllConversationsFor(requesterId);
        let conversations = [];
        for (let conversation of results.body.hits.hits) {
            conversations.push(conversation._source);
        }

        for (let conversation of conversations) {
            sortMessagesByTimestamp(conversation);
            conversation.messages = [getLastMessage(conversation)];
            if (parseInt(conversation.user1) === requesterId) {
                conversation.user2 = await usersHandler.getUserByIdGeneric(conversation.user2);
            } else {
                conversation.user2 = await usersHandler.getUserByIdGeneric(conversation.user1);
            }
            conversation.user1 = await usersHandler.getUserByIdGeneric(requesterId);
        }
    } catch (error) {
        res.status(400).end();
    }
}

function getLastMessage(conversation) {
    return conversation.messages[conversation.messages.length - 1];
}

async function addMessage(req, res) {
    try {
        let requesterId = 0; //TODO récupérer Id via cookie;
        let userId = req.body.id;
        let message = req.body.message;

        let conv = await getConversationGeneric(userId);
        if (conv === null) res.status(404).end();
        message.id = conv.messages.length;
        conv.messages.push(message);
        conv.hasUnreadMessages = true;
        await convRep.deleteConversation(requesterId, userId);
        await convRep.store(conv);
        res.status(201).end();
    } catch (error) {
        res.status(400).end();
    }
}

async function deleteMessage(req, res) {
    try {
        let requesterId = 0; //TODO récupérer Id via cookie;
        let userId = req.params.userId;
        let messageId = req.params.messageId;

        let conv = await getConversationGeneric(userId);
        if (conv === null) {
            res.status(404).end();
        }
        let index = getIndexOfMessage(messageId, conv);
        let message = conv.messages[index];
        if (parseInt(message.sender) !== requesterId) {
            res.status(403).end();
        }
        conv.messages.remove(index);
        await convRep.deleteConversation(requesterId, userId);
        await convRep.store(conv);
        res.status(204).end();
    } catch (error) {
        res.status(400).end();
    }
}

function sortMessagesByTimestamp(conversation) {
    conversation.messages.sort(function (a, b) {
        return (new Date(b.timestamp) - new Date(a.timestamp));
    })
}

function getIndexOfMessage(messageId, conv) {
    let index = 0;
    for (let convMessage of conv.messages) {
        if (convMessage.id !== messageId)
            index++;
        else {
            return index
        }
    }
    return -1;
}

async function conversationExist(user1Id, user2Id) {
    const result = await convRep.getConversation(user1Id, user2Id);
    return result.body.hits.total.value > 0;
}

export default {
    createConversation,
    deleteConversation,
    getConversation,
    getAllConversations,
    addMessage,
    deleteMessage,
    blockConversation
}
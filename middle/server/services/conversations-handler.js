import convRep from './conversations-repository';
import usersHandler from './users-handler';

async function createConversation(userId, requesterId) {
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
        let requesterId = req.session.requesterId;
        let userId = req.params.id;
        await deleteConversationGeneric(requesterId, userId);
        res.status(200).end();
    } catch (error) {
        res.status(400).end();
    }
}

async function deleteConversationGeneric(requesterId, userId) {
    await deleteConvWithoutLikeUpdate(requesterId, userId);
    await usersHandler.updateLikesFor(userId, requesterId, usersHandler.removeFromArray);
}

async function deleteConvWithoutLikeUpdate(requesterId, userId) {
    await convRep.deleteConversation(requesterId, userId);
}

async function setBlockStatusToConversation(requesterId, userId, isBlocked) {
    let conv = await getConversationGeneric(requesterId, userId);
    if (conv === null || conv.isBlocked === isBlocked) { return; }
    conv.isBlocked = isBlocked;
    await updateConversation(conv);
}


async function markAsReadIfValid(conversation, requesterId) {
    if(! conversation.hasUnreadMessages) return;
    let message = getLastMessage(conversation);
    if (parseInt(message.sender) !== requesterId){
        conversation.hasUnreadMessages = false;
    }
    await updateConversation(conversation);
}

async function getConversation(req, res) {
    try {
        res.set('Content-Type', 'application/json');
        let requesterId = req.session.requesterId;
        let userId = req.params.id;
        let conv = await getConversationGeneric(userId, requesterId);
        if (conv === null) res.status(404).end();
        await markAsReadIfValid(conv, requesterId);
        sortMessagesByTimestamp(conv);
        await fillWithFullUsersIntel(conv, userId, requesterId);
        res.send(conv)
    } catch (error) {
        res.status(400).end();
    }
}

async function fillWithFullUsersIntel(conv, userId, requesterId) {
    conv.user1 = await usersHandler.getUserByIdGeneric(requesterId);
    conv.user2 = await usersHandler.getUserByIdGeneric(userId);
}

/**
 * Find all the conversations the requester is involved in and send them as an array. Put the whole user object for user1
 * and user2, with the convention that user1 is always the requester.
 */

async function getAllConversations(req, res) {
    try {
        let requesterId = req.session.requesterId;
        const conversations = await getAllConversationsGeneric(requesterId);
        res.send(conversations);
    } catch (error) {
        res.status(400).end();
    }
}

async function getAllConversationsGeneric(requesterId) {
    let results = await convRep.getAllConversationsFor(requesterId);
    let conversations = [];
    if(results.body.hits.total.value === 0) { return conversations; }
    for (let conversation of results.body.hits.hits) {
        conversations.push(conversation._source);
    }

    for (let conversation of conversations) {
        sortMessagesByTimestamp(conversation);
        conversation.messages = getLastMessage(conversation);
        if (parseInt(conversation.user1) === requesterId) {
            conversation.user2 = await usersHandler.getUserByIdGeneric(conversation.user2);
        } else {
            conversation.user2 = await usersHandler.getUserByIdGeneric(conversation.user1);
        }
        conversation.user1 = await usersHandler.getUserByIdGeneric(requesterId);
    }
    return conversations;
}

function getLastMessage(conversation) {
    if(conversation.messages.length === 0) return [];
    let message = conversation.messages[conversation.messages.length - 1]
    return [message];
}

async function addMessage(req, res) {
    try {
        res.set('Content-Type', 'application/json');
        let errorMessage = {'user1': {'id': ''} };
        let requesterId = req.session.requesterId;
        let message = req.body;
        let userId = message.receiver;

        let conv = await getConversationGeneric(userId, requesterId);
        if (conv === null) {
            errorMessage.user1.id = -404;
            res.send(errorMessage);
        }
        message.id = conv.messages.length === 0 ? 0 : conv.messages[conv.messages.length - 1].id + 1;
        conv.messages.push(message);
        conv.hasUnreadMessages = true;

        await updateConversation(conv);
        sortMessagesByTimestamp(conv);
        await fillWithFullUsersIntel(conv, userId, requesterId);
        res.send(conv);
    } catch (error) {
        console.log('error in add message : ' + error);
        res.status(400).end();
    }
}

async function getConversationGeneric(user1Id, user2Id) {
    const result = await convRep.getConversation(user1Id, user2Id);
    if(result.body.hits.total.value === 0) { return null; }
    return result.body.hits.hits[0]._source;
}

async function deleteMessage(req, res) {
    try {
        res.set('Content-Type', 'application/json');
        let errorMessage = {'user1': {'id': ''} };
        let requesterId = req.session.requesterId;
        let userId = req.query.userId;
        let messageId = req.query.messageId;
        let conv = await getConversationGeneric(userId, requesterId);
        if (conv === null) {
            errorMessage.user1.id = -404;
            res.send(errorMessage);
        }
        let index = getIndexOfMessage(messageId, conv);
        if(index === -1) {
            errorMessage.user1.id = -404;
            res.send(errorMessage);
        }
        let message = conv.messages[index];
        if (message.sender !== requesterId) {
            errorMessage.user1.id = -403;
            res.send(errorMessage);
        }

        conv.messages.splice(index, 1);
        await updateConversation(conv);
        sortMessagesByTimestamp(conv);
        await fillWithFullUsersIntel(conv, userId, requesterId);
        res.send(conv);
    } catch (error) {
        console.log('error in deleteMessage : ' + error);
        res.status(400).end();
    }
}

async function updateConversation(conv) {
    await convRep.deleteConversation(conv.user1, conv.user2);
    await convRep.store(conv);
}

async function hasNewMessages(req, res) {
    try {
        const requesterId = req.session.requesterId;

        if(requesterId === undefined) { res.send('false'); }
        const conversations = await getAllConversationsGeneric(requesterId);
        for (const conv of conversations) {
            if (conv.hasUnreadMessages && conv.messages[0].sender !== requesterId) {
                return res.send('true');
            }
        }
        res.send('false');
    }catch(error) {
        console.log(error);
        res.status(400).end();
    }
}

function sortMessagesByTimestamp(conversation) {
    conversation.messages.sort(function (a, b) {
        return (new Date(a.timestamp) - new Date(b.timestamp));
    })
}

function getIndexOfMessage(messageId, conv) {
    let index = 0;
    for (let convMessage of conv.messages) {
        if (convMessage.id !== parseInt(messageId))
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
    setBlockStatusToConversation,
    hasNewMessages,
    getConversationGeneric,
    deleteConversationGeneric,
    deleteConvWithoutLikeUpdate
}
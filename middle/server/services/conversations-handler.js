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
        await convRep.deleteConversation(requesterId, userId);
        res.status(200).end();
    } catch (error) {
        res.status(400).end();
    }
}

async function blockConversation(requesterId, userId) {
    let result = await convRep.getConversation(requesterId, userId);
    if (result.body.hits.total.value === 0) return false;
    let conv = result.body.hits.hits[0]._source;
    conv.isBlocked = true;
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
        console.log('got to get Conversation');
        let requesterId = req.session.requesterId;
        let userId = req.params.id;
        console.log('id for conv : ' + userId);
        let conv = await getConversationGeneric(userId, requesterId);
        console.log('got to conv without conv');
        if (conv === null) res.status(403).end();
        markAsReadIfValid(conv, requesterId);
        console.log('got to end of Conversation');
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
    let conv = result.body.hits.hits[0]._source;
    sortMessagesByTimestamp(conv);
    conv.user1 = await usersHandler.getUserByIdGeneric(requesterId);
    conv.user2 = await usersHandler.getUserByIdGeneric(userId);
    return conv;
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
    if(message.content.length > 50) {
        message.content = message.content.substring(0, 51) + ' ...';
    }
    return [message];
}

async function addMessage(req, res) {
    try {
        let requesterId = req.session.requesterId;
        console.log('passed in addMessage');
        let userId = req.body.id;
        let message = req.body.message;

        let conv = await getConversationGeneric(userId);
        console.log('passed after getConversation addMessage');
        if (conv === null) res.status(404).end();
        message.id = conv.messages.length === 0 ? 0 : conv.messages[conv.messages.length - 1] + 1;
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
        let requesterId = req.session.requesterId;
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
    blockConversation,
    hasNewMessages
}
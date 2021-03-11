import convRep from './conversations-repository';
import usersHandler from './users-handler';
import likesHandler from './likes-handler';


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

async function getConversation(req, res) {
    try {
        res.set('Content-Type', 'application/json');
        let requesterId = req.session.requesterId;
        let userId = req.params.id;
        let conv = await getConversationGeneric(userId, requesterId);
        if (conv === null) res.status(404).end();
        await markAsReadIfValid(conv, requesterId);
        sortMessagesByDate(conv);
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
 * Gather all the conversations in which the requester is involved. The user1 and user2 field of all the conversations
 * are completed with all the user informations. By convention, user1 is always the requester.
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

        await updateConversationInDatabase(conv);
        sortMessagesByDate(conv);
        await fillWithFullUsersIntel(conv, userId, requesterId);
        res.send(conv);
    } catch (error) {
        console.log('error in add message : ' + error);
        res.status(400).end();
    }
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
        await updateConversationInDatabase(conv);
        sortMessagesByDate(conv);
        await fillWithFullUsersIntel(conv, userId, requesterId);
        res.send(conv);
    } catch (error) {
        console.log('error in deleteMessage : ' + error);
        res.status(400).end();
    }
}

/**
 * Check the presence of a new message by check the boolean "hasNewMessages" of the conv and checking if the last message
 * is not from the sender.
 */
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

/*********************** UTILITIES ****************************/




/**
 * Deletes the conversation if it exists, and make the requester unlike the other participant in the conversation.
 * WARNING : the order of the parameters matters.
 * @param requesterId the id of the requester.
 * @param userId the id of the other participant in the conversation to delete.
 */
async function deleteConversationGeneric(requesterId, userId) {
    await deleteConvWithoutLikeUpdate(requesterId, userId);
    await likesHandler.updateLikesFor(userId, requesterId, usersHandler.removeFromArray);
}

async function deleteConvWithoutLikeUpdate(requesterId, userId) {
    await convRep.deleteConversation(requesterId, userId);
}


/**
 * Gather all the conversations in which the requester is involved. The user1 and user2 field of all the conversations
 * are completed with all the user informations. By convention, user1 is always the requester.
 * @param requesterId the requester id.
 */
async function getAllConversationsGeneric(requesterId) {
    let results = await convRep.getAllConversationsFor(requesterId);
    let conversations = [];
    if(results.body.hits.total.value === 0) { return conversations; }
    for (let conversation of results.body.hits.hits) {
        conversations.push(conversation._source);
    }

    for (let conversation of conversations) {
        sortMessagesByDate(conversation);
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



/**
 * Get the conversation between the two users given in parameter and returns it. Returns null if there is no conversation.
 * WARNING : the conversation returns contains only user1 and user2 ids in the "user1" and "user2" fields.
 * @param user1Id the id of one of the user allegedly involved in the conversation.
 * @param user2Id the id of the other user allegedly involved in the conversation.
 * @returns {Promise<null|string|string[]>} the conversation or null if it does not exists.
 */
async function getConversationGeneric(user1Id, user2Id) {
    const result = await convRep.getConversation(user1Id, user2Id);
    if(result.body.hits.total.value === 0) { return null; }
    return result.body.hits.hits[0]._source;
}

/**
 * Unblock a existing conversation between the two users in parameter. If no conversation exists, creates a new one.
 */
async function createOrUnblockConv(userId, requesterId) {
    let alreadyExists = await conversationExist(userId, requesterId);
    if (alreadyExists) {
        await setBlockStatusToConversation(userId, requesterId, false);
        return true;
    } else {
        return await createConversation(userId, requesterId);
    }
}

/**
 * Determine if a conversation between the users in parameter exists in the database. The order in with the users id
 * are given does not matter.
 * @param user1Id the id of one of the user allegedly involved in the conversation.
 * @param user2Id the id of the other user allegedly involved in the conversation.
 * @returns {Promise<boolean>} true if a conversation between those two users exists, false otherwise.
 */
async function conversationExist(user1Id, user2Id) {
    const result = await convRep.getConversation(user1Id, user2Id);
    return result.body.hits.total.value > 0;
}

/**
 * Retrieve the index of a message in the array of a conversation messages. Return the position or -1 is the message was
 * not found.
 * @param messageId the id of the message to find.
 * @param conv the conversation in which to look for the message
 * @returns {number} the position of the message in the array, or -1 if the message was not found.
 */
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


/**
 * Sort the messages in an ascending order, comparing the dates stores, in order to have the latest messages at the end
 * of the array.
 * @param conversation the conversation in which to sort the messages.
 */
function sortMessagesByDate(conversation) {
    conversation.messages.sort(function (a, b) {
        return (new Date(a.timestamp) - new Date(b.timestamp));
    })
}


async function updateConversationInDatabase(conv) {
    await convRep.deleteConversation(conv.user1, conv.user2);
    await convRep.store(conv);
}


function getLastMessage(conversation) {
    if(conversation.messages.length === 0) return [];
    let message = conversation.messages[conversation.messages.length - 1]
    return [message];
}



async function setBlockStatusToConversation(requesterId, userId, isBlocked) {
    let conv = await getConversationGeneric(requesterId, userId);
    if (conv === null || conv.isBlocked === isBlocked) { return; }
    conv.isBlocked = isBlocked;
    await updateConversationInDatabase(conv);
}

/**
 * Change the "hasUnreadMessages" if the requester is not the last person to have sent a message. To be use only in
 * a situation when the alert should disapear (when the requester requests the conversation involved for example).
 * @param conversation the conversation to check.
 * @param requesterId the requester id.
 */
async function markAsReadIfValid(conversation, requesterId) {
    if(! conversation.hasUnreadMessages) return;
    let message = getLastMessage(conversation);
    if (parseInt(message.sender) !== requesterId){
        conversation.hasUnreadMessages = false;
    }
    await updateConversationInDatabase(conversation);
}

/**
 * Create a new empty conversation between the two users in parameter, if they like each other and the conversation
 * does not already exists. The order of the parameters does not matter.
 * @param userId the id of the other user involved in the conversation.
 * @param requesterId the requester id.
 */
async function createConversation(userId, requesterId) {
    if (!await likesHandler.likeEachOther(requesterId, userId)) {
        return false;
    }
    if (await conversationExist(requesterId, userId)) {
        return false;
    }
    await convRep.createEmptyConversation(requesterId, userId)
    return true;
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
    deleteConvWithoutLikeUpdate,
    createOrUnblockConv
}
import convHandler from './conversations-handler';
import usersHandler from './users-handler';


async function addLike(req, res) {
    res.set('Content-Type', 'application/json');

    try {
        let response = {result: ''};
        const requesterId = req.session.requesterId;
        const likedUserId = req.body.id;
        const message = await updateLikesFor(likedUserId, requesterId, addToArray);
        if (message !== '') {
            response.result = message;
            res.send(response);
        }

        if (await likeEachOther(requesterId, likedUserId)) {
            const succeeded = await convHandler.createOrUnblockConv(likedUserId, requesterId);
            if (! succeeded) {
                response.result = 'conversation not created';
                res.send(response);
            }
        }
        response.result = 'ok';
        res.send(response);
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}

async function removeLike(req, res) {
    res.set('Content-Type', 'application/json');
    try {
        let response = {result: ''};
        const requesterId = req.session.requesterId;
        const likedUserId = req.params.id;
        const message = await updateLikesFor(likedUserId, requesterId, removeFromArray);
        if (message !== '') {
            response.result = message;
            res.send(response);
        }
        await convHandler.setBlockStatusToConversation(requesterId, likedUserId, true);
        response.result = 'ok';
        res.send(response);
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }

}


async function removeUserFromAllLikesArray(requesterId) {
    const requester = await usersHandler.getUserByIdGeneric(requesterId);
    if (requester === null) { return false; }
    for (let likingUser of requester.likedBy) {
        let message = await updateRequesterLikes(requesterId, likingUser, removeFromArray);
        if(message !== '') return false;
        await convHandler.deleteConvWithoutLikeUpdate(requesterId, likingUser);
    }

    for (let likedUser of requester.likedUsers) {
        let message = await updateLikesFor(likedUser, requesterId, removeFromArray);
        if(message !== '') return false;
    }

    return true;
}


/*********************** UTILITIES ****************************/

/**
 * Add or remove likes depending on the actionOnArray function given in parameter.
 * Makes sure the database stays consistent by removing the likes for both users.
 * WARNING : the order of the parameters matters.
 * @param userId the id of the user to like/unlike.
 * @param requesterId the requester id.
 * @param actionOnArray the function to use to change the array of likes.
 * @returns {Promise<string|string>} a empty tring if everything went well, an error message otherwise.
 */
async function updateLikesFor(userId, requesterId, actionOnArray) {
    userId = parseInt(userId);
    requesterId = parseInt(requesterId);
    let message = await updateRequesterLikes(userId, requesterId, actionOnArray);
    if (message !== '') { return message; }
    message = await updateLikedUserLikes(userId, requesterId, actionOnArray);
    return message !== '' ? message : '';
}


async function updateRequesterLikes(likedUserId, requesterId, actionOnArray) {
    let requester = await usersHandler.getUserByIdGeneric(requesterId);
    if (requester === null) {
        return 'requester unknown';
    }
    actionOnArray(requester.likedUsers, likedUserId);
    await usersHandler.updateUserGeneric(requester);
    return '';
}

async function updateLikedUserLikes(likedUserId, requesterId, actionOnArray) {
    let likedUser = await usersHandler.getUserByIdGeneric(likedUserId);
    if (likedUser === null) {
        return 'liked user unknown';
    }
    actionOnArray(likedUser.likedBy, requesterId);
    await usersHandler.updateUserGeneric(likedUser);
    return '';
}

function addToArray(array, item) {
    if (! array.includes(item)) {
        array.push(item);
    }
}

function removeFromArray(array, item) {
    let index = array.indexOf(item);
    if (index >= 0)
        array.splice(index, 1);
}

async function likeEachOther(user1Id, user2Id) {
    let user = await usersHandler.getUserByIdGeneric(user1Id);
    if (user === null) { return false; }
    user2Id = parseInt(user2Id);
    return (user.likedUsers.includes(user2Id) && user.likedBy.includes(user2Id));
}




export default {
    removeLike,
    removeFromArray,
    addLike,
    updateLikesFor,
    removeUserFromAllLikesArray,
    likeEachOther
}
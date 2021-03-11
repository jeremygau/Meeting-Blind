import usersRep from './users-repository';
import convHandler from './conversations-handler';


async function create(req, res) {
    res.set('Content-Type', 'application/json');
    try {
        const userBool = await userExist(req.body.email);
        if (userBool) {
            res.send({});
        } else {
            const newId = await getIdMax() + 1;
            req.session.requesterId = newId;
            req.body.id = newId;
            await usersRep.store(req.body);
            res.send({email: 'ok'});
        }
    } catch (e) {
        res.status(400).end();
    }
}

async function userExist(email) {
    try {
        const result = await usersRep.getUser(email);
        return result.body.hits.total.value > 0;
    } catch (e) {
        console.log('error getting user', e);
        return false;
    }
}

async function getUserById(req, res) {
    res.set('Content-Type', 'application/json');
    try {
        const user = await getUserByIdGeneric(req.params.id);
        if (user === null) {
            res.send({});
        } else {
            res.send(user);
        }
    } catch (error) {
        res.status(400).end();
    }
}

async function getUserByIdGeneric(userId) {
    const result = await usersRep.getUserById(userId);
    if (result.body.hits.total.value === 0) {
        return null;
    }
    return result.body.hits.hits[0]._source;
}

async function likeEachOther(user1Id, user2Id) {
    let result = await usersRep.getUserById(user1Id);
    if (result.body.hits.total.value === 0) {
        return false;
    }
    let user = result.body.hits.hits[0]._source;
    user2Id = parseInt(user2Id);
    return (user.likedUsers.includes(user2Id) && user.likedBy.includes(user2Id));
}


function addToArray(array, item) {
    array.push(item);
}

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
            let message = await createOrUpdateConv(likedUserId, requesterId);
            if (message !== '') {
                response.result = message;
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

async function createOrUpdateConv(userId, requesterId) {
    let existingConv = await convHandler.getConversationGeneric(userId, requesterId);
    if (existingConv !== null) {
        await convHandler.setBlockStatusToConversation(existingConv.user1, existingConv.user2, false);
    } else {
        let created = await convHandler.createConversation(userId, requesterId);
        if (!created) {
            return 'conversation not created';
        }
    }
    return '';
}

function removeFromArray(array, item) {
    let index = array.indexOf(item);
    if (index >= 0)
        array.splice(index, 1);
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

async function getIdMax() {
    const result = await usersRep.getIdMax();
    if(result.body.hits.total.value === 0) {
        return -1;
    }
    return result.body.aggregations.max_id.value;
}

async function updateLikesFor(userId, requesterId, actionOnArray) {
    userId = parseInt(userId);
    requesterId = parseInt(requesterId);
    let message = await updateRequesterLikes(userId, requesterId, actionOnArray);
    if (message !== '') { return message; }
    message = await updateLikedUserLikes(userId, requesterId, actionOnArray);
    return message !== '' ? message : '';
}

async function updateRequesterLikes(likedUserId, requesterId, actionOnArray) {
    let requester = await getUserByIdGeneric(requesterId);
    if (requester === null) {
        return 'requester unknown';
    }
    actionOnArray(requester.likedUsers, likedUserId);
    await updateUserGeneric(requester);
    return '';
}

async function updateLikedUserLikes(likedUserId, requesterId, actionOnArray) {
    let likedUser = await getUserByIdGeneric(likedUserId);
    if (likedUser === null) {
        return 'liked user unknown';
    }
    actionOnArray(likedUser.likedBy, requesterId);
    await updateUserGeneric(likedUser);
    return '';
}

async function getUsersFromTown(req, res) {
    try {
        let requesterId = req.session.requesterId;
        let requester = await getUserByIdGeneric(requesterId);
        if (requester === null) {
            res.status(404).end();
        }
        let result;
        if(requester.desiredGender === 'homme/femme') {
            result = await usersRep.getAllUsersForCity(req.params.city, requester);
        } else {
            result = await usersRep.getSpecificUsersForCity(req.params.city, requester);
        }
        let users = [];
        for (let obj of result.body.hits.hits) {
            users.push(obj._source);
        }
        res.send(users);
    } catch (error) {
        res.status(400).end();
    }
}

async function updateUser(req, res) {
    res.set('Content-Type', 'application/json');
    try {
        await updateUserGeneric(req.body);
        res.send({});
    } catch (e) {
        console.log('error on update User : ', e)
        res.status(400).end();
    }
}

async function updateUserGeneric(user) {
    await usersRep.deleteUserById(user.id);
    await usersRep.store(user);
}

async function deleteUser(req, res) {
    res.set('Content-Type', 'application/json');
    try {
        console.log('entened in delete');
        const requesterId = req.session.requesterId;
        console.log(requesterId);
        const allDeleted = await removeUserFromAllLikesArray(requesterId);
        console.log(allDeleted);
        if (! allDeleted) { res.send({}); }
        let result = await usersRep.deleteUserById(requesterId);
        if (result.body.deleted === 1) {
            res.send({delete: 'ok'});
        } else {
            res.send({});
        }
    } catch (error) {
        res.status(400).end();
    }
}

async function removeUserFromAllLikesArray(requesterId) {
    const requester = await getUserByIdGeneric(requesterId);
    if (requester === null) { return false; }
    for (let likingUser of requester.likedBy) {
        let message = await updateRequesterLikes(requesterId, likingUser, removeFromArray);
        if(message !== '') return false;
        console.log('on for loop, before delete');
        await convHandler.deleteConvWithoutLikeUpdate(requesterId, likingUser);
        console.log('on for loop, after delete');
    }

    for (let likedUser of requester.likedUsers) {
        let message = await updateLikesFor(likedUser, requesterId, removeFromArray);
        console.log('on second loop');
        if(message !== '') return false;
    }

    return true;
}


export default {
    create,
    userExist,
    updateUser,
    deleteUser,
    getUserById,
    addLike,
    removeLike,
    likeEachOther,
    getUserByIdGeneric,
    getUsersFromTown,
    removeFromArray,
    updateLikesFor
};



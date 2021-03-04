import usersRep from './users-repository';
import conversationsHandler from './conversations-handler';

async function create(req, res) {
    res.set('Content-Type', 'application/json');
    try {
        const userBool = await userExist(req.body.email);
        if (userBool) {
            res.send({});
        } else {
            let newId = 0;
            let result = await usersRep.getAll();
            if (result.body.hits.total.value !== null) {
                newId = result.body.hits.total.value + 1;
            }
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
        if(user === null) {
            res.send({});
        } else {
            res.send(user);
        }
    }catch (error) {
        res.status(400).end();
    }
}

async function getUserByIdGeneric(userId) {
    try {
        const result = await usersRep.getUserById(userId);
        if (result.body.hits.total.value === 0) {
            return null;
        }
        return result.body.hits.hits[0]._source;
    }catch (error) {
        res.status(400).end();
    }
}

async function likeEachOther(user1Id, user2Id) {
    let result = await usersRep.getUserById(user1Id);
    if(result.body.hits.total.value === 0) {
        return false;
    }
    let user = result.body.hits.hits[0]._source;
    return (user.likedUsers.includes(user2Id) && user.likedBy.includes(user2Id));
}

async function addLike(req, res) {
    res.set('Content-Type', 'application/json');
    let requesterId = req.session.requesterId;
    let likedUserId = req.body.id;
    await updateLike(requesterId, likedUserId, addFromArray, res);
    if(await likeEachOther(requesterId, likedUserId)) {
        let created = await conversationsHandler.createConversation(likedUserId, requesterId);
        if(! created) res.send({status: 'conversation not created'});
    }
    res.send({status: 'ok'});
}

async function removeLike(req, res) {
    res.set('Content-Type', 'application/json');
    let requesterId = req.session.requesterId;
    let likedUserId = req.params.id;
    await updateLike(requesterId, likedUserId, removeFromArray, res);
    await conversationsHandler.blockConversation(requesterId, likedUserId);
    res.send({status: 'ok'});
}


async function updateLike(requesterId, likedUserId, updateArrayFunction, res) {
    await updateLikeForRequester(requesterId, likedUserId, updateArrayFunction, res);
    await updateLikeForLikedUser(requesterId, likedUserId, updateArrayFunction, res);
}

async function updateLikeForRequester(requesterId, likedUserId, updateArrayFunction, res) {
    try {
        let result = await usersRep.getUserById(requesterId);
        if (result.body.hits.total.value === 0) {
            res.send({status: 'requester unknown'});
        }
        let requester = result.body.hits.hits[0]._source;
        updateArrayFunction(requester.likedUsers, likedUserId);
        await usersRep.removeUserById(requesterId);
        await usersRep.store(requester);
    }catch (e) {
        res.status(400).end();
    }
}

async function updateLikeForLikedUser(requesterId, likedUserId, updateArrayFunction, res) {
    try {
        let result = await usersRep.getUserById(likedUserId);
        if (result.body.hits.total.value === 0) {
            res.send({status: 'user unknown'});
        }
        let likedUser = result.body.hits.hits[0]._source;
        updateArrayFunction(likedUser.likedBy, requesterId);
        await usersRep.removeUserById(likedUserId);
        await usersRep.store(likedUser);
    }catch (e) {
        res.status(400).end();
    }
}

async function getUsersFromTown(req, res) {
    try {
        let requesterId = req.session.requesterId;
        let requester = await getUserByIdGeneric(requesterId);
        if (requester === null) {
            res.status(404).end();
        }
        let result = await usersRep.getUsersForCity(req.params.city, requester.desiredGender, requester.gender);
        let users = [];
        for (let obj of result.body.hits.hits) {
            users.push(obj._source);
        }
        res.send(users);
    }catch(error) {
        res.status(400).end();
    }
}

function removeFromArray(array, item) {
    let index = array.indexOf(item);
    if (index > 1)
        array.remove(index);
}

function addFromArray(array, item) {
    array.push(item);
}

export default {create, userExist, getUserById, addLike, removeLike, likeEachOther, getUserByIdGeneric, getUsersFromTown};

import usersRep from './users-repository';

async function create(req, res) {
    res.set('Content-Type', 'application/json');
    try {
        const userBool = await userExist(req.body.email);
        if (userBool) {
            res.send({});
        } else {
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
    try {
        const result = await usersRep.getUserById(req.params.id);
        if (result.body.hits.total.value === 0) {
            res.send({});
        }
        const user = result.body.hits.hits._source;
        res.send(user);
    }catch (error) {
        res.status(400).end();
    }
}

async function addLike(req, res) {
    let requesterId = 0//TODO get the id contains in the cookie.
    let likedUserId = req.body.id;
    await updateLike(requesterId, likedUserId, addFromArray, res);
    res.send({status: 'ok'});
}

async function removeLike(req, res) {
    let requesterId = 0//TODO get the id contains in the cookie.
    let likedUserId = req.params.id;
    await updateLike(requesterId, likedUserId, removeFromArray, res);
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
        let requester = result.body.hits.hits._source;
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
        let likedUser = result.body.hits.hits._source;
        updateArrayFunction(likedUser.likedBy, requesterId);
        await usersRep.removeUserById(likedUserId);
        await usersRep.store(likedUser);
    }catch (e) {
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

export default {create, userExist, getUserById, addLike, removeLike};

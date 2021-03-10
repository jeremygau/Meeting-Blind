import usersRep from './users-repository';
import convHandler from './conversations-handler';


async function create(req, res) {
    res.set('Content-Type', 'application/json');
    try {
        const userBool = await userExist(req.body.email);
        if (userBool) {
            res.send({});
        } else {
            let newId = 0;
            let result = await usersRep.getAll();
            let nbUsers = result.body.hits.total.value;
            if (nbUsers !== 0) {
                newId = result.body.hits.hits[nbUsers - 1]._source.id + 1;
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
    return (user.likedUsers.includes(user2Id) && user.likedBy.includes(user2Id));
}


const addToArray = function addToArray(array, item) {
    array.push(item);
}

async function addLike(req, res) {
    res.set('Content-Type', 'application/json');
    try {
        let response = {result: ''};
        let requester = await getUserByIdGeneric(req.session.requesterId);
        if (requester === null) {
            response.result = 'requester unknown';
            res.send(response)
        }
        let likedUser = await getUserByIdGeneric(req.body.id);
        if (likedUser === null) {
            response.result = 'liked user unknown';
            res.send(response)
        }

        addToArray(requester.likedUsers, likedUser.id);
        await updateUserGeneric(requester);

        addToArray(likedUser.likedBy, requester.id);
        await updateUserGeneric(likedUser);

        if (await likeEachOther(requester.id, likedUser.id)) {
            let existingConv = await convHandler.getConversationWithoutFullUsers(likedUser.id, requester.id);
            if (existingConv !== null) {
                let convUnblocked = await convHandler.setBlockStatusToConversation(existingConv.user1, existingConv.user2, false);
                if (! convUnblocked) {
                    response.result('conversation not unblocked');
                    res.send(response);
                }
            } else {
                let created = await convHandler.createConversation(likedUser.id, requester.id);
                if (!created) {
                    response.result = 'conversation not created';
                    res.send(response);
                }
            }
        }
        response.result = 'ok';
        res.send(response);
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}

const removeFromArray = function removeFromArray(array, item) {
    let index = array.indexOf(item);
    if (index >= 0)
        array.splice(index, 1);
}

async function removeLike(req, res) {
    try {
        res.set('Content-Type', 'application/json');
        let response = {result: ''};
        let requester = await getUserByIdGeneric(req.session.requesterId);
        if (requester === null) {
            response.result = 'requester unknown';
            res.send(response)
        }
        let likedUser = await getUserByIdGeneric(req.params.id);
        if (likedUser === null) {
            response.result = 'liked user unknown';
            res.send(response)
        }

        removeFromArray(requester.likedUsers, likedUser.id);
        await updateUserGeneric(requester);

        removeFromArray(likedUser.likedBy, requester.id);
        await updateUserGeneric(likedUser);

        let convBlocked = await convHandler.setBlockStatusToConversation(requester.id, likedUser.id, true);
        if (!convBlocked) {
            response.result = 'conversation not blocked';
        }
        response.result = 'ok';
        res.send(response);
    } catch (e) {
        console.log(e);
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
        console.log('error here', e)
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
        let result = await usersRep.deleteUserById(req.params.id);
        if (result.body.deleted === 1) {
            res.send({delete: 'ok'});
        } else {
            res.send({});
        }
    } catch (error) {
        res.status(400).end();
    }
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
    getUsersFromTown
};



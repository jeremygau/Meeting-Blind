import usersRep from './users-repository';
import likesHandler from './likes-handler';


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

/**
 * Return all the users in the city given in the query, which are of the gender desired by the requester and which
 * desire the gender of the requester.
 */
async function getUsersFromCity(req, res) {
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

async function deleteUser(req, res) {
    res.set('Content-Type', 'application/json');
    try {
        const requesterId = req.session.requesterId;
        const allDeleted = await likesHandler.removeUserFromAllLikesArray(requesterId);
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


/*********************** UTILITIES ****************************/


async function updateUserGeneric(user) {
    await usersRep.deleteUserById(user.id);
    await usersRep.store(user);
}


/**
 * Retrieve the user with the id given in parameter. Returns null if no such user exists.
 * @param userId the id of the user to find.
 * @returns {Promise<null|string|string[]>} the user having the id given, or null if no such user exists.
 */
async function getUserByIdGeneric(userId) {
    const result = await usersRep.getUserById(userId);
    if (result.body.hits.total.value === 0) {
        return null;
    }
    return result.body.hits.hits[0]._source;
}

/**
 * get the max id value stores in the database
 * @returns {Promise<number|*>} the promise of the max value stored in the database.
 */
async function getIdMax() {
    const result = await usersRep.getIdMax();
    if(result.body.hits.total.value === 0) {
        return -1;
    }
    return result.body.aggregations.max_id.value;
}

/**
 * Check if a user having the email in parameter already exists in the database.
 * @param email the email to check.
 * @returns {Promise<boolean>} true if a user with this email already exists, false otherwise.
 */
async function userExist(email) {
    try {
        const result = await usersRep.getUser(email);
        return result.body.hits.total.value > 0;
    } catch (e) {
        console.log('error getting user', e);
        return false;
    }
}



export default {
    create,
    userExist,
    updateUser,
    deleteUser,
    getUserById,
    updateUserGeneric,
    getUserByIdGeneric,
    getUsersFromCity,
};



import usersRep from './users-repository';

async function create(req, res) {
    res.set('Content-Type', 'application/json');
    try {
        const userBool = await userExist(req.body.email);
        if (userBool) {
            res.send({});
        } else {
            await usersRep.store(req.body);
            res.send({firstName: 'ok'});
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

export default {create, userExist};

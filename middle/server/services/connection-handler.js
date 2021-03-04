import usersRep from './users-repository';

async function connect(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const requester = await getUser(email);
    if(requester === null) {
        res.send('notOk');
        return;
    }
    if(requester.password === password) {
        req.session.requesterId = requester.id;
        res.send('ok');
        return;
    }
    res.send('notOkay');
}

async function getUser(email) {
    const result = await usersRep.getUser(email);
    if (body.hits.total.value === 0) return null;
    return result.body.hits.hits[0]._source;
}

export default connect;
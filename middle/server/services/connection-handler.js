import usersRep from './users-repository';

async function connect(req, res) {
    try {
        res.set('Content-Type', 'application/json');
        const email = req.body.email;
        const password = req.body.password;

        const requester = await getUser(email);
        if (requester === null) {
            res.send({email: ''});
            return;
        }
        if (requester.password === password) {
            req.session.requesterId = requester.id;
            res.send({email: 'ok'});
            return;
        }
        res.send({email: ''});
    }catch (error) {
        console.log(error);
        res.status(500).end();
    }
}

async function getUser(email) {
    try {
        const result = await usersRep.getUser(email);
        if (result.body.hits.total.value === 0) return null;
        return result.body.hits.hits[0]._source;
    }catch (error) {
        console.log('error in getUser - conv handler : ' + error);
        return null;
    }
}

export default connect;
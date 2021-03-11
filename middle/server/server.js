import express from "express"
import usersRouter from "./services/users-routage";
import searchRouter from "./services/search-router";
import likesRouter from "./services/likes-router";
import convRouter from "./services/conversations-router";
import connectionRouter from './services/connection-router';
const cookieSession = require('cookie-session');

const app = express();

app.use(express.json());
app.use(cookieSession({secret: 'LockdownIsFunAsHell',
                        cookie: {maxAge: "3*60*60*1000"}}));

app.use(express.static('./app/front'));

app.use('/users', usersRouter);
app.use('/search', searchRouter);
app.use('/like', likesRouter);
app.use('/conv', convRouter);
app.use('/connection', connectionRouter);


app.get('/', function (req, res) {
    res.sendFile('index.html');
});

app.get('/cookieStatus', (req, res) => {
    res.set('Content-Type', 'application/json');
    const id = req.session.requesterId !== undefined ? req.session.requesterId : -1;
    res.send({'id': id});
});

app.listen(8080, console.log('The server successfully launched and listens to port 8080.'));


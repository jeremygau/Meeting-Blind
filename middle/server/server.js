import express from "express"
import usersRouter from "./services/users-routage";
import searchRouter from "./services/search-router";
import likeRouter from "./services/like-router";
import convRouter from "./services/conversations-router";

const app = express();

app.use(express.json());

app.use(express.static('./app/front'));

app.use('/users', usersRouter);
app.use('/search', searchRouter);
app.use('/like', likeRouter);
app.use('/conv', convRouter);


app.get('/', function (req, res) {
    res.sendFile('index.html');
});

app.listen(8080, console.log('The server successfully launched and listens to port 8080.'));


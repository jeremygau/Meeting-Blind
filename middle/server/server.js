import express from "express"
import usersRouter from "./services/users-routage";
import searchRouter from "./services/search-router";

const app = express();

app.use(express.json());

app.use(express.static('./app/front'));

app.use('/users', usersRouter);

app.use('/search', searchRouter);


app.get('/', function (req, res) {
    res.sendFile('index.html');
});

app.listen(8080);


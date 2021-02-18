import esClient from "./es-client";

const index = 'local_users';

const handleElasticsearchError = (error) => {
    if (error.status === 404) {
        throw new Error('User Not Found', 404);
    }
    throw new Error(error.msg, error.status || 500);
};

const getAll = () => esClient.search({index,})
    .then(response => response)
    .catch((error) => {handleElasticsearchError(error);});

const store = user => esClient.index({
    index,
    refresh: 'true',
    body: user,
}).then(response => response.statusCode).catch((error) => {
    handleElasticsearchError(error);
});

const getUser =
    email => esClient.search(
        {
            index,
            body: {"query": {"match": {"email": {"query": email}}}},
        })
        .then(response => response)
        .catch((error) => {handleElasticsearchError(error);});


export default {getUser, store, getAll};

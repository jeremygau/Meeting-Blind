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
    .catch((error) => {
        handleElasticsearchError(error);
    });

const store = user => esClient.index({
    index,
    refresh: 'true',
    body: user,
}).then(response => response.statusCode).catch((error) => {
    handleElasticsearchError(error);
});

const getUser = (email) => {
    return esClient.search({
            index,
            body: {"query": {"match_phrase": {"email": email}}}
        })
        .then(response => response)
        .catch((error) => {
            console.log(error);
            handleElasticsearchError(error);
        });
};

const getUserById = (id) => {
    return esClient.search({
        index,
        body: {"query": {"term": {"id": id}}}
        })
        .then(response => response)
        .catch((error) => {
            console.log(error);
            handleElasticsearchError(error);
        });
};

const deleteUserById = (id) => {
    return esClient.delete_by_query({
        index,
        refresh: true,
        body: {"query": {"term": {"id": id}}}
        })
        .then(response => response)
        .catch((error) => {
            console.log(error);
            handleElasticsearchError(error);
        });
};


const getUsersForCity = (city, desiredGender, requesterGender) => {
    return esClient.search({
        index,
        body: {
            "query": {
                "bool": {
                    "must": [
                        {"term": {
                                "city": city
                            }
                        },
                        {"term": {
                                "gender": desiredGender
                            }
                        },
                        {"bool": {
                                "should": [
                                    {"term": {
                                            "desiredGender": requesterGender
                                        }
                                    },
                                    {"term": {
                                            "desiredGender": "allGenders" // TODO Corriger quand on saura comment c'est traduit
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }
    })
    .then(response => response)
    .catch((error) => {
        handleElasticsearchError(error);
    })
};

const deleteUser = (user) => {
    return deleteUserById(user.id);
};

export default {getUser, store, getAll, getUsersForCity, getUserById, removeUserById: deleteUserById, deleteUser};

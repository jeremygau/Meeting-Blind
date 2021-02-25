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
    console.log(email);
    return esClient.search({
            index,
            body: {"query": {"match": {"email": email}}},
        })
        .then(response => response)
        .catch((error) => {
            console.log(error);
            handleElasticsearchError(error);
        });
};

const getUsersForCity = (city, desiredGender, requesterGender) => esClient.search({
    index,
    body: {
        "query": {
            "bool": {
                "must": [
                    {"match": {
                            "city": city
                        }
                    },
                    {"match": {
                            "gender": desiredGender
                        }
                    },
                    {"bool": {
                            "should": [
                                {"match": {
                                        "desiredGender": requesterGender
                                    }
                                },
                                {"match": {
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
}).then(response => response)
    .catch((error) => {
        handleElasticsearchError(error);
    });


export default {getUser, store, getAll, getUsersForCity};

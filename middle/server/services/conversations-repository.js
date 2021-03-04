import esClient from "./es-client";

const index = 'local_conv';

const handleElasticsearchError = (error) => {
    if (error.status === 404) {
        throw new Error('User Not Found', 404);
    }
    throw new Error(error.msg, error.status || 500);
};

const createEmptyConversation = (user1Id, user2Id) => {
    let conv = {
        user1: user1Id,
        user2: user2Id,
        messages: [],
        isBlocked: false,
        hasUnreadMessages: false
    }
    esClient.index({
        index,
        refresh: 'true',
        body: conv,
    }).then(response => response.statusCode).catch((error) => {
        handleElasticsearchError(error);
    });
};

const store = conversation => esClient.index({
    index,
    refresh: 'true',
    body: conversation,
}).then(response => response.statusCode).catch((error) => {
    handleElasticsearchError(error);
});

const getConversation = (user1Id, user2Id) => {
    return esClient.search({
        index,
        body: {
            "query": {
                "bool": {
                    "should": [
                        {"bool": {
                            "must": [
                                {"term": {"user1": user1Id}},
                                {"term": {"user2": user2Id}}
                                ]
                            }
                        },
                        {"bool": {
                            "must": [
                                {"term": {"user1": user2Id}},
                                {"term": {"user2": user1Id}}
                                ]
                            }
                        }
                    ]
                }
            }
        }
    }).then(response => response).catch( (error) => {
        console.log('Error in getConversation\n' + error);
        handleElasticsearchError(error);
    });
};

const getAllConversationsFor = (userId) => {
    return esClient.search( {
        index,
        body: {
            "query": {
                "bool": {
                    "should": [
                        {"term": {"user1": userId}},
                        {"term": {"user2": userId}},
                    ]
                }
            }
        }
    }).then(response => response).catch( (error) => {
        console.log('Error in getAllConversationFor\n' + error);
        handleElasticsearchError(error);
    });
};

const deleteConversation = (user1Id, user2Id) => {
  return esClient.delete_by_query({
          index,
          refresh: true,
          body: {
              "query": {
                  "bool": {
                      "should": [
                          {
                              "bool": {
                                  "must": [
                                      {"term": {"user1": user1Id}},
                                      {"term": {"user2": user2Id}}
                                  ]
                              }
                          },
                          {
                              "bool": {
                                  "must": [
                                      {"term": {"user1": user2Id}},
                                      {"term": {"user2": user1Id}}
                                  ]
                              }
                          }
                      ]
                  }
              }
          }
      }).then(response => response.statusCode).catch((error) => {
      console.log('Error in deleteConversation\n' + error);
      handleElasticsearchError(error);
  });
};

export default {createEmptyConversation, getConversation, deleteConversation, getAllConversationsFor, store}
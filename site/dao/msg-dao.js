const client = require('../resource/elasticsearch')
var elasticsearch = require('elasticsearch');

class MessageDao {
    async saveSingle(message) {
        const response = await client.index({
            index: 'message',
            type: 'message',
            id: message.id.toString(),
            body: message
        })

        await client.indices.refresh({
            index: 'message'
        });
    }

    async saveProject(users, message) {
        for (var i = 0; i < users.length; i++) {
            var user = users[i]
            if (user.email == message.from) { // exclude sender
                continue
            }

            message.to = user.email

            await client.index({
                index: 'message',
                type: 'message',
                body: message
            })
        }

        await client.indices.refresh({
            index: 'message'
        });
    }

    async getOffline(user, messageId) {
        if (messageId == 0) {
            var response

            try {
                response = await client.get({
                    index: 'ack',
                    type: 'ack',
                    id: user
                })
            } catch (e) {
                if (e instanceof elasticsearch.errors.NotFound) {
                    messageId = 0
                } else {
                    throw e
                }
            }

            if (response) {
                messageId = response._source.messageId
            }
        } else {
            await this.ack(user, messageId)
        }

        console.log('get offline user ack', user, messageId)

        const msgResponse = await client.search({
            index: 'message',
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                range: {
                                    id: {
                                        gt: messageId
                                    }
                                }
                            },
                            {
                                term: {
                                    to: user
                                }
                            }
                        ],
                    }
                },
                sort: [
                    { id: { order: "asc" } },
                ],
            }
        })

        var singleMessages = new Array();
        var projectMessages = new Array();

        msgResponse.hits.hits.forEach(message => {
            if ('type' in message._source) {
                singleMessages.push(message._source)
            } else {
                projectMessages.push(message._source)
            }
        })

        return {
            single: singleMessages,
            project: projectMessages
        }
    }

    async ack(user, messageId) {
        const response = await client.index({
            index: 'ack',
            type: 'ack',
            id: user,
            body: {
                messageId: messageId
            }
        })

        await client.indices.refresh({
            index: 'ack'
        });
    }
}

module.exports = exports = new MessageDao();
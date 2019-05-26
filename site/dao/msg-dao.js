const client = require('../resource/elasticsearch')
var elasticsearch = require('elasticsearch');

class MessageDao {
    async saveSingle(message) {
        const response = await client.index({
            index: 'single-message',
            type: 'single',
            id: message.id.toString(),
            body: message
        })
    }

    async saveProject(users, message) {
        for (user in users) {
            message.user = user.email

            await client.index({
                index: 'project-message',
                type: 'project',
                id: message.id.toString(),
                body: message
            })
        }
    }

    async getOffline(user) {
        var messageId
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

        console.log('get offline user ack', user, messageId)

        const singlePromise = client.search({
            index: 'single-message',
            body: {
                query: {
                    range: {
                        id: {
                            gt: messageId
                        }
                    }
                },
                sort: [
                    { id: { order: "desc" } },
                ],
            }
        })

        const projectPromise = client.search({
            index: 'project-message',
            body: {
                query: {
                    range: {
                        id: {
                            gt: messageId
                        }
                    }
                },
                sort: [
                    { id: { order: "desc" } },
                ],
            }
        })

        const [single, project] = await Promise.all([singlePromise, projectPromise])

        var singleMessages = new Array();
        single.hits.hits.forEach(message => {
            singleMessages.push(message._source)
        })

        var projectMessages = new Array();
        project.hits.hits.forEach(message => {
            projectMessages.push(message._source)
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
    }
}

module.exports = exports = new MessageDao();
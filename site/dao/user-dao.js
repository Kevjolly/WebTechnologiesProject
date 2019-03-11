const client = require('../resource/elasticsearch')

class UserDao {
    async save(user) {
        user.created = new Date().getTime()

        const response = await client.index({
            index: 'user',
            type: 'user',
            id: user.email,
            body: user
        })

        console.log('user dao save response', response)
    }

    async getUser(email, fields) {
        const response = await client.get({
            index: 'user',
            type: 'user',
            id: email,
            _source: fields
        })

        console.log('user dao get user', response)

        return response._source
    }

    async search(query, page, count) {
        // TODO
    }

    async updateToken(email, token) {
        const response = await client.update({
            index: 'user',
            type: 'user',
            id: email,
            body: {
                doc: {
                    token: token
                }
            }
        })

        console.log('token update result', response)
    }

    async getProjectUsers(projectId, fields) {
        const res = await client.search({
            index: 'user',
            type: 'user',
            body: {
                query: {
                    term: {
                        project: projectId
                    }
                },
            },
            _source: fields
        })

        console.log('get project users response', res)

        return res.hits.hits
    }
}

module.exports = exports = new UserDao();

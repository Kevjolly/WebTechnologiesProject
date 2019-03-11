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

    async getUser(id) {
        const response = await client.get({
            index: 'user',
            type: 'user',
            id: id
        })

        console.log('user dao get user', response)
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
}

module.exports = exports = new UserDao();

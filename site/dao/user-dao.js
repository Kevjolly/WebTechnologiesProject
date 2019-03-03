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
        const response = client.get({
            index: 'user',
            type: 'user',
            id: id
        })

        console.log('user dao get user', response)
    }

    async search(query, page, count) {
        // TODO
    }
}

module.exports = exports = new UserDao();

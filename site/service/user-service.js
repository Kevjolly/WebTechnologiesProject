const userDao = require('../dao/user-dao')

class UserService {
    async signup(user) {
        await userDao.save(user)
    }

    async editProfile(email, profile) {
        await userDao.update(email, profile)
    }

    async getProfile(id) {
        return userDao.getUser(id)
    }

    async search(query) {
        var keywords = query.keyword.trim().split(" ");
        console.log('user search keywords', keywords)
        var result = userDao.search(keywords, query.page, query.count)
        result.keyword = query.keyword
        result.page = query.page
        result.type = 'user'
        return result
    }

    async updateToken(email, token) {
        await userDao.updateToken(email, token)
    }

    async unbindToken(email) {
        await userDao.unbindToken(email)
    }

    async setVerified(email) {
        await userDao.setVerified(email)
    }
}

module.exports = exports = new UserService();

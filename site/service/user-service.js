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
        return await userDao.search(keywords, query.page, query.count)
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

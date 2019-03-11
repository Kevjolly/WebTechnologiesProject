const userDao = require('../dao/user-dao')

class UserService {
    async signup(user) {
        await userDao.save(user)
    }

    async getProfile(id) {
        return userDao.getUser(id)
    }

    async search(keyword, page, count) {
        return await userDao.search(keyword, page, count)
    }

    async updateToken(email, token) {
        await userDao.updateToken(email, token)
    }
}

module.exports = exports = new UserService();

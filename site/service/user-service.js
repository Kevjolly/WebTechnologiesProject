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
}

module.exports = exports = new UserService();

const userDao = require('../dao/user-dao')

class UserService {
    signup() {
        console.log('user service signup');
        userDao.save();
    }

    signout() {

    }

    signin() {

    }

    getProfile() {

    }
}

module.exports = exports = new UserService();

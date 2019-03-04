const userDao = require('../dao/user-dao')
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');

var userPool = new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: 'eu-west-2_jsI6HR2I6',
    ClientId: '336ukl8f0sa1ko3k2bhe30ooeu'
});

class UserService {
    async signup(user) {
        const password = user.password

        var dataEmail = {
            Name: 'email',
            Value: user.email,
        };

        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        userPool.signUp(user.email, password, [attributeEmail], null, function (err, result) {
            if (err) {
                console.log('cognito error');
                failureCallback(err);
            } else {
                cognitoUser = result.user;
                successCallback();
            }
        });

        delete user.password
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

var poolData = {
    UserPoolId: 'eu-west-2_jsI6HR2I6',
    ClientId: '336ukl8f0sa1ko3k2bhe30ooeu'
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
var authToken;

if (userPool.getCurrentUser()) {
    userPool.getCurrentUser().getSession(function sessionCallback(err, session) {
        if (err) {
            console.log(err);
        } else if (!session.isValid()) {
            console.log('session invalid');
        } else {
            authToken = session.getIdToken().getJwtToken();
            console.log('auth token', authToken);
        }
    });
}

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @param {string} nickname
 * @param {function} successCallback takes no parameter
 * @param {function} failureCallback takes one parameter (err)
 */
function signup(email, password, nickname, successCallback, failureCallback) {
    const user = {
        email: email,
        nickname: nickname,
        password: password
    }

    console.log(JSON.stringify(user));

    $.ajax({
        type: "POST",
        url: '/user/signup',
        data: JSON.stringify(user),
        success: function (data) {
            console.log('index user successfully', data);

            var dataEmail = {
                Name: 'email',
                Value: email,
            };

            var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

            userPool.signUp(email, password, [attributeEmail], null, function (err, result) {
                if (err) {
                    console.log('cognito error');
                    if (failureCallback) {
                        failureCallback(err);
                    }
                } else {
                    if (successCallback) {
                        successCallback();
                    }
                }
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('es error', jqXHR, textStatus, errorThrown);
            if (failureCallback) {
                failureCallback(errorThrown);
            }
        },
        contentType: 'application/json',
        dataType: 'json'
    });
}

/**
 * 
 * @param {string} email 
 * @param {string} code 
 * @param {function} callbackFunc takes two parameters (err, result)
 */
function verify(email, code, callbackFunc) {
    var user = new AmazonCognitoIdentity.CognitoUser({
        Username: email,
        Pool: userPool
    });

    user.confirmRegistration(code, true, callbackFunc);
}

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @param {function} successCallback takes one parameter (result)
 * @param {function} failureCallback takes one parameter (err)
 */
function signin(email, password, successCallback, failureCallback) {
    console.log(email, password);
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password
    });

    var user = new AmazonCognitoIdentity.CognitoUser({
        Username: email,
        Pool: userPool
    });

    user.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            authToken = result.idToken.jwtToken;
            console.log('signin successfully', result.idToken.jwtToken, user);

            var suffix = user.username.split('-').join('');

            console.log('create database teamup');

            alasql('CREATE INDEXEDDB DATABASE IF NOT EXISTS teamup', function () {
                alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
                    alasql('CREATE TABLE IF NOT EXISTS teamup.current_user (username string PRIMARY KEY)', () => {
                        console.log('current_user table created');
                        var stmt = alasql.compile('insert into teamup.current_user (username) values (?)');
                        stmt([user.username], function () {
                            console.log('current user inserted');
                            alasql('CREATE TABLE IF NOT EXISTS teamup.single_messages_' + suffix + ' (id BIGINT NOT NULL PRIMARY KEY, from_user string, to_user string, data string)', function () {
                                console.log('single message table created');
                            });

                            alasql('CREATE TABLE IF NOT EXISTS teamup.project_messages_' + suffix + ' (id BIGINT PRIMARY KEY, from_user string, project BIGINT, data string)', function () {
                                console.log('project message table created');
                            })
                        });
                    });
                });
            });

            if (successCallback) {
                successCallback(result);
            }
        },
        onFailure: failureCallback
    });
}

function signout() {
    authToken = '';
    alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
        alasql('delete from teamup.current_user where username="' + userPool.getCurrentUser().username + '"');
        console.log('current user deleted');
        userPool.getCurrentUser().signOut();
    });
}

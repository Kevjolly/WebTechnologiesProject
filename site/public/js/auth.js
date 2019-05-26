var poolData = {
    UserPoolId: 'eu-west-2_0JsQWKvFs',
    ClientId: '7mjqob9h58ic27tn5kf23uhe1n'
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
var authToken;
var userEmail;

AWS.config.update({
    region: 'eu-west-2',
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'eu-west-2:4be81d47-fe44-4391-8f9c-e1fd894217dc'
    })
});

var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: { Bucket: 'teamup-images' }
});

var cognitoUser = userPool.getCurrentUser();

if (cognitoUser) {
    cognitoUser.getSession(function sessionCallback(err, session) {
        if (err) {
            console.log(err);
        } else if (!session.isValid()) {
            console.log('session invalid');
        } else {
            authToken = session.getIdToken().getJwtToken();
            console.log('auth token', authToken);

            // load offline messages whenever a page is reloaded
            $.ajax({
                contentType: 'application/json',
                headers: {
                    Authorization: authToken
                },
                data: JSON.stringify({}),
                dataType: 'json',
                success: async function (data) {
                    console.log("call /msg/offline successfully", data);

                    var suffix = cognitoUser.username.split('-').join('');

                    await alasql.promise('ATTACH INDEXEDDB DATABASE teamup');
                    
                    if (data.data.single.length > 0 || data.data.project.length > 0) {
                        var maxId = 0;

                        if (data.data.single.length > 0) {
                            if (data.data.single[0].id > maxId) {
                                maxId = data.data.single[0].id;
                            }

                            var valuesClause = "";
                            var args = new Array();
                            for (i in data.data.single) {
                                if (valuesClause.length != 0) {
                                    valuesClause += ',';
                                }
                                valuesClause += "(?,?,?,?)";

                                var msg = data.data.single[i];

                                console.log('single mssssg', msg);
                                args.push(msg.id, msg.from, JSON.stringify(msg), 1);
                            }

                            console.log('insert single args', args);

                            var stmt = alasql.compile('insert into teamup.single_messages_' + suffix + ' (id, user, data, recv) values ' + valuesClause);
                            stmt(args, function () {
                                console.log('insert offline single messages successfully');
                            });
                        }

                        if (data.data.project.length > 0) {
                            if (data.data.project[0].id > maxId) {
                                maxId = data.data.project[0].id;
                            }

                            var valuesClause = "";
                            var args = new Array();
                            for (i in data.data.project) {
                                if (valuesClause.length != 0) {
                                    valuesClause += ',';
                                }
                                valuesClause += "(?,?,?,?,?)";

                                var msg = data.data.project[i];

                                args.push(msg.id, msg.from, msg.project, JSON.stringify(msg), 1);
                            }

                            var stmt = alasql.compile('insert into teamup.project_messages_' + suffix + ' (id, from_user, project, data, recv) values ' + valuesClause);
                            stmt(args, function () {
                                console.log('insert offline project messages successfully');
                            });
                        }

                        // send ack to server
                        $.ajax({
                            contentType: 'application/json',
                            headers: {
                                Authorization: authToken
                            },
                            data: JSON.stringify({
                                messageId: maxId
                            }),
                            dataType: 'json',
                            success: function (data) {
                                console.log("call /msg/ack successfully", data);
                            },
                            error: function (err) {
                                console.log("call /msg/ack failed", err);
                            },
                            processData: false,
                            type: 'POST',
                            url: '/msg/ack'
                        });
                    }
                },
                error: function (err) {
                    console.log("call /msg/offline failed", err);
                },
                processData: false,
                type: 'POST',
                url: '/msg/offline'
            });

            cognitoUser.getUserAttributes(function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                for (i = 0; i < result.length; i++) {
                    if (result[i].getName() == 'email') {
                        userEmail = result[i].getValue();
                        break;
                    }
                }
            });
        }
    });
}

$(document).ready(function () {
    if (cognitoUser) {
        console.log('user', cognitoUser, userEmail);
        $(".signedout").hide();
        $(".signedin").show();
        $("#get-started-choice, .get-started").hide();
        $(".get-started-logged-in").show();
    } else {
        $(".signedout").show();
        $(".signedin").hide();
        $(".get-started").show();
        $(".get-started-logged-in").hide();
        $("#get-started-choice").hide();
        console.log('no user connected')
    }
});

/*
 * 
 * @param {string} email 
 * @param {string} password 
 * @param {string} nickname
 * @param {function} successCallback takes no parameter
 * @param {function} failureCallback takes one parameter (err)
 */
function signup(email, password, nickname, skills, extensionStr, fileToSend, successCallback, failureCallback) {
    var filenameToSend = "";
    if (extensionStr !== "") {
        filenameToSend = email + "." + extensionStr;
    } else {
        filenameToSend = "_default_user_image.png"
    }

    const user = {
        email: email,
        nickname: nickname,
        verified: false,
        projects: [],
        skills: skills,
        image: filenameToSend
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
                    console.log('cognito error', err);
                    if (failureCallback) {
                        failureCallback(err);
                    }
                } else {
                    console.log('sign up cognito result', result)
                    if (successCallback) {
                        successCallback();
                    }
                    M.toast({ html: 'Signed up!' });

                    if (fileToSend) {
                        s3.upload({
                            Key: filenameToSend,
                            Body: $('#signup-file')[0].files[0],
                            ACL: 'public-read'
                        }, function (err, data) {
                            if (err) {
                                console.log("failed to save the image ", err);
                                M.toast({ html: 'Error when saving the image!' });
                            } else {
                                console.log('Successfully uploaded photo', data);
                                M.toast({ html: 'User profile image saved.' });
                                $('#modal-signup').modal('close');
                                $('#modal-verify').modal('open');
                            }
                        });
                    } else {
                        $('#modal-signup').modal('close');
                        $('#modal-verify').modal('open');
                    }
                }
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('es error', jqXHR, textStatus, errorThrown);
            if (failureCallback) {
                failureCallback(errorThrown);
            }
            M.toast({ html: 'Failed!' });
            M.toast({ html: errorThrown.message });
        },
        contentType: 'application/json',
        dataType: 'json'
    });
}

/**
 * 
 * @param {string} email 
 * @param {string} code 
 * @param {function} successCallback takes one parameter result
 * @param {function} failureCallback taske one parameter err
 */
function verify(email, code, successCallback, failureCallback) {
    var user = new AmazonCognitoIdentity.CognitoUser({
        Username: email,
        Pool: userPool
    });

    user.confirmRegistration(code, true, function (err, result) {
        if (!err) {
            console.log("hehe");
            $.ajax({
                type: "POST",
                url: '/user/verify',
                data: JSON.stringify({
                    email: email
                }),
                success: function (data) {
                    console.log("hehe3");
                    console.log('set user verified successfully', data);
                    if (successCallback) {
                        successCallback(result);
                    }
                    M.toast({ html: 'Account is verified!' });
                    $('#modal-verify').modal('close');
                    $('#modal-login').modal('open');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('es verify error', jqXHR, textStatus, errorThrown);
                    if (failureCallback) {
                        failureCallback(errorThrown);
                    }
                    M.toast({ html: 'Account was not verified!' });
                    M.toast({ html: errorThrown.message });
                },
                contentType: 'application/json',
                dataType: 'json'
            });
        } else {
            if (failureCallback) {
                failureCallback(errorThrown);
            }
            M.toast({ html: 'Account was not verified!' });
            M.toast({ html: err.message });
        }
    });
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
            console.log('signin cognito successfully', result.idToken.jwtToken, user);

            // bind token
            var token = window.localStorage.getItem('teamupToken');
            sendTokenToServer(token);

            var suffix = user.username.split('-').join('');

            console.log('create database teamup');

            alasql('CREATE INDEXEDDB DATABASE IF NOT EXISTS teamup', function () {
                alasql('ATTACH INDEXEDDB DATABASE teamup', async function () {
                    await alasql.promise('CREATE TABLE IF NOT EXISTS teamup.current_user (username string PRIMARY KEY, auth_token string)');
                    console.log('current_user table created');

                    await alasql.promise('CREATE TABLE IF NOT EXISTS teamup.single_messages_' + suffix + ' (id BIGINT NOT NULL PRIMARY KEY, user string, data string, recv TINYINT)');
                    console.log('single message table created');

                    await alasql.promise('CREATE TABLE IF NOT EXISTS teamup.project_messages_' + suffix + ' (id BIGINT PRIMARY KEY, from_user string, project BIGINT, data string, recv TINYINT)');
                    console.log('project message table created');

                    await alasql.promise('CREATE TABLE IF NOT EXISTS teamup.single_conversation_cursor_' + suffix + ' (user string PRIMARY KEY, max_id BIGINT)');
                    console.log('single conversation cursor table created');

                    await alasql.promise('CREATE TABLE IF NOT EXISTS teamup.project_conversation_cursor_' + suffix + ' (project BIGINT PRIMARY KEY, max_id BIGINT)');
                    console.log('project conversation cursor table created');

                    var stmt = alasql.compile('insert into teamup.current_user (username, auth_token) values (?,?)');
                    stmt([user.username, authToken], function () {
                        if (successCallback) {
                            successCallback(result);
                        }
                    });
                });
            });
        },
        onFailure: failureCallback
    });
}

function signout() {
    alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
        alasql('delete from teamup.current_user where username="' + userPool.getCurrentUser().username + '"');
        console.log('current user deleted');
        $.ajax({
            contentType: 'application/json',
            headers: {
                Authorization: authToken
            },
            dataType: 'json',
            success: function (data) {
                setTokenSentToServer(false);
                userPool.getCurrentUser().signOut();
                authToken = '';
                console.log("signed out successfully", data);
                $('#modal-logout').modal('close');
                M.toast({ html: 'Signed out!' });
                // location.reload();
                navigation('home');
            },
            error: function (err) {
                console.log("failed to unbind token", err);
                M.toast({ html: 'Signed out failed!' });
            },
            processData: false,
            type: 'POST',
            url: '/user/unbindToken'
        });
    });
}

function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

function sendTokenToServer(token) {
    $.ajax({
        contentType: 'application/json',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify({
            token: token
        }),
        dataType: 'json',
        success: function (data) {
            console.log("token uploaded successfully", data);
            setTokenSentToServer(true);
        },
        error: function (err) {
            setTokenSentToServer(false);
            console.log("failed to upload token", err);
        },
        processData: false,
        type: 'POST',
        url: '/user/bindToken'
    });
}
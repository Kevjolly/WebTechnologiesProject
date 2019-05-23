var poolData = {
    UserPoolId: 'eu-west-2_0JsQWKvFs',
    ClientId: '7mjqob9h58ic27tn5kf23uhe1n'
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

var cognitoUser = userPool.getCurrentUser();

$(document).ready(function(){
    if (cognitoUser){
        console.log('user', cognitoUser);
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
    if (extensionStr !== ""){
        filenameToSend = email+"."+extensionStr;
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
                    M.toast({html: 'Signed up!'});

                    if (fileToSend){
                        var dataToGive = new FormData();
                        var firstFile = $('#signup-file')[0].files[0];
                        console.log(filenameToSend);
                        dataToGive.append('file', firstFile, filenameToSend);
                        $.ajax({
                            contentType: 'application/json',
                            // headers: {
                            //     Authorization: authToken
                            // },
                            url: '/adduserimage',
                            data: dataToGive,
                            cache: false,
                            contentType: false,
                            processData: false,
                            method: 'POST',
                            type: 'POST', // For jQuery < 1.9
                            success: function(data){
                                console.log(data);
                                M.toast({html: 'User profile image saved.'});
                                $('#modal-signup').modal('close');
                                $('#modal-verify').modal('open');
                                
                            },
                            error: function (err) {
                                console.log("failed to save the image ", err);
                                M.toast({html: 'Error when saving the image!'});
                            }
                        });
                    }
                }
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('es error', jqXHR, textStatus, errorThrown);
            if (failureCallback) {
                failureCallback(errorThrown);
            }
            M.toast({html: 'Failed!'});
            M.toast({html: errorThrown.message});
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
                    M.toast({html: 'Account is verified!'});
                    $('#modal-verify').modal('close');
                    $('#modal-login').modal('open');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('es verify error', jqXHR, textStatus, errorThrown);
                    if (failureCallback) {
                        failureCallback(errorThrown);
                    }
                    M.toast({html: 'Account was not verified!'});
                    M.toast({html: errorThrown.message});
                },
                contentType: 'application/json',
                dataType: 'json'
            });
        } else {
            if (failureCallback) {
                failureCallback(errorThrown);
            }
            M.toast({html: 'Account was not verified!'});
            M.toast({html: err.message});
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
            M.toast({html: 'Signed in!'});
            $('#modal-login').modal('close');
            $('#get-started-choice').hide();
            location.reload();
        },
        //onFailure: failureCallback
        onFailure: function (err){
            console.log("Authenticate user failure");
            console.log(err);
            if (err.code === "UserNotConfirmedException"){
                M.toast({html: 'Failed!'});
                M.toast({html: 'Your account is not verified.'});
                $('#modal-login').modal('close');
                $('#modal-verify').modal('open');
            } else {
                M.toast({html: 'Failed!'});
                M.toast({html: err.message});
            }
        }     
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
                M.toast({html: 'Signed out!'});
                location.reload();
            },
            error: function (err) {
                console.log("failed to unbind token", err);
                M.toast({html: 'Signed out failed!'});
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
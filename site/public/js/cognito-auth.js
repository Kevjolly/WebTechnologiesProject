var poolData = {
    UserPoolId: 'eu-west-2_jsI6HR2I6',
    ClientId: '336ukl8f0sa1ko3k2bhe30ooeu'
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
var cognitoUser = userPool.getCurrentUser();

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @param {string} nickname
 * @param {function} successCallback takes no parameter\
 * @param {function} failureCallback takes one parameter (err)
 */
function signup(email, password, nickname, successCallback, failureCallback) {
    const user = {
        email: email,
        nickname: nickname
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
                    failureCallback(err);
                } else {
                    cognitoUser = result.user;
                    successCallback();
                }
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('es error', jqXHR, textStatus, errorThrown);
            failureCallback(errorThrown);
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
    console.log('verify', email, code);

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
        Username: email,
        Pool: userPool
    });

    cognitoUser.confirmRegistration(code, true, callbackFunc);
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

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
        Username: email,
        Pool: userPool
    });

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: successCallback,
        onFailure: failureCallback
    });
}

function signout() {
    cognitoUser.signOut();
}

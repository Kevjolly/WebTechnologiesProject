var config = {
    apiKey: "AIzaSyCccdgckISI0fQ-5BYg2-GFir6J6ccaokk",
    authDomain: "fcm-demo-f0f15.firebaseapp.com",
    databaseURL: "https://fcm-demo-f0f15.firebaseio.com",
    projectId: "fcm-demo-f0f15",
    storageBucket: "fcm-demo-f0f15.appspot.com",
    messagingSenderId: "556328931688"
};

firebase.initializeApp(config);

var messaging = firebase.messaging();

messaging.usePublicVapidKey('BIKbBZTDdnGeU_VsRqH0lMtuk5jr5HjW1h6OfiCULuyHN1oZmck9iG4MQ2FRrsAcmGouAkF0mGYcdTeJiOr2kNk');

messaging.requestPermission().then(function () {
    console.log('Notification permission granted.');
}).catch(function (err) {
    console.log('Unable to get permission to notify.', err);
});

function getToken() {
    messaging.getToken().then(function (token) {
        if (token) {
            console.log('token retrieved', token);

            // store token locally
            window.localStorage.setItem('teamupToken', token);

            if (!isTokenSentToServer() && authToken) {
                console.log('sending token to server');
                sendTokenToServer(token)
            }
        } else {
            setTokenSentToServer(false);
            console.log('No Instance ID token available. Request permission to generate one.');
        }
    }).catch(function (err) {
        console.log('An error occurred while retrieving token. ', err);
        setTokenSentToServer(false);
    });
}

getToken();

// Callback fired if Instance ID token is updated.
messaging.onTokenRefresh(function () {
    setTokenSentToServer(false);
    getToken();
});

function handleMessage(data, callback) {
    var msg = JSON.parse(data.msg);

    console.log('Message received', msg.id, data.msg);

    var suffix = userPool.getCurrentUser().username.split('-').join('');

    if ('to' in msg) {
        window.localStorage.setItem('teamup_single_max_id_' + suffix, msg.id);

        alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
            var stmt = alasql.compile('insert into teamup.single_messages_' + suffix + ' (id, user, data) values (?, ?, ?)');
            stmt([msg.id, msg.from, data.msg], function () {
                console.log('insert single message successfully');
            });
        });
    } else if ('project' in msg) {
        window.localStorage.setItem('teamup_project_max_id_' + suffix, msg.id);

        alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
            var stmt = alasql.compile('insert into teamup.project_messages_' + suffix + ' (id, from_user, project, data) values (?, ?, ?, ?)');
            stmt([msg.id, msg.from, msg.project, data.msg], function () {
                console.log('insert project message successfully');
            });
        });
    }

    callback(msg);
}

/**
 * client should call this function to set an event listener
 * @param {function} callback take one parameter, msg which is an object
 */
function onMessageReceived(callback) {
    messaging.onMessage(function (payload) {
        handleMessage(payload.data, callback);
    });
}

/**
 * 
 * @param {string} peerEmail 
 * @param {long} maxId 
 * @param {int} count 
 * @param {function} callback takes one parameter, messages array
 */
function loadSingleHistoryMessages(peerEmail, maxId, count, callback) {
    if (!(userPool.getCurrentUser())) {
        callback([]);
        return;
    }

    var suffix = userPool.getCurrentUser().username.split('-').join('');
    alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
        alasql('select data from teamup.single_messages_' + suffix + ' where user="' + peerEmail + ' and id<' + maxId + ' order by id desc limit ' + count, function (result) {
            var messages = new Array();
            result.forEach(row => {
                messages.push(JSON.parse(row.data));
            })

            callback(messages);
        });
    });
}

/**
 * 
 * @param {long} projectId 
 * @param {long} maxId 
 * @param {int} count 
 * @param {function} callback takes one parameter, messages array
 */
function loadProjectHistoryMessages(projectId, maxId, count, callback) {
    if (!(userPool.getCurrentUser())) {
        callback([]);
        return;
    }

    var suffix = userPool.getCurrentUser().username.split('-').join('');
    alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
        alasql('select data from teamup.project_messages_' + suffix + ' where project=' + projectId + ' and id<' + maxId + ' order by id desc limit ' + count, function (result) {
            var messages = new Array();
            result.forEach(row => {
                messages.push(JSON.parse(row.data));
            })

            callback(messages);
        });
    });
}

function loadConversations(callback) {
    var conversations = {
        single: [],
        project: []
    };

    // console.log(userPool.getCurrentUser());
    if (!(userPool.getCurrentUser())) {
        callback(conversations);
        return
    }

    var suffix = userPool.getCurrentUser().username.split('-').join('');

    var singleMaxId = window.localStorage.getItem('teamup_single_max_id_' + suffix);
    var projectMaxId = window.localStorage.getItem('teamup_project_max_id_' + suffix);

    alasql('ATTACH INDEXEDDB DATABASE teamup', async function () {
        // project conversations
        var projectMaxIds = await alasql.promise('select max(id) as maxId from teamup.project_messages_' + suffix + ' group by project');

        console.log('projectMaxIds', projectMaxIds);

        if (projectMaxIds[0].maxId) {
            var idClause = "";
            for (var i = 0; i < projectMaxIds.length; i++) {
                if (i != 0) {
                    idClause += ',';
                }
                idClause += projectMaxIds[i].maxId;
            }

            console.log('project id clause', idClause);

            var projectLatestMsgs = await alasql.promise('select data from teamup.project_messages_' + suffix + ' where id in (' + idClause + ') order by id desc');
            projectLatestMsgs.forEach(row => {
                var conversation = new Object();

                var message = JSON.parse(row.data);

                conversation.latestMessage = message;
                
                if (message.id > projectMaxId) {
                    conversation.unread = true;
                }

                conversations.project.push(conversation);
            });
        }

        // single conversations
        var singleMaxIds = await alasql.promise('select max(id) as maxId from teamup.single_messages_' + suffix + ' group by user');

        if (singleMaxIds[0].maxId) {
            var idClause = "";
            for (var i = 0; i < singleMaxIds.length; i++) {
                if (i != 0) {
                    idClause += ',';
                }
                idClause += singleMaxIds[i].maxId;
            }

            console.log('single id clause', idClause);

            var singleLatestMsgs = await alasql.promise('select data from teamup.single_messages_' + suffix + ' where id in (' + idClause + ') order by id desc');
            singleLatestMsgs.forEach(row => {
                var conversation = new Object();

                var message = JSON.parse(row.data);

                conversation.latestMessage = message;
                
                if (message.id > singleMaxId) {
                    conversation.unread = true;
                }
                
                conversations.single.push(conversation);
            });
        }

        // TODO set max Ids
        console.log('conversations', conversations);

        callback(conversations);
    });
}

function sendSingleMessage(message, successCallback, failureCallback) {
    $.ajax({
        contentType: 'application/json',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify(message),
        dataType: 'json',
        success: function (data) {
            console.log("call /msg/single successfully", data);

            var res = JSON.parse(data);
            message.id = res.data.msgId;

            alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
                var stmt = alasql.compile('insert into teamup.single_messages_' + suffix + ' (id, user, data) values (?, ?, ?)');
                stmt([message.id, message.to, JSON.stringify(message)], function () {
                    console.log('insert single message successfully');
                    successCallback();
                });
            });
        },
        error: function (err) {
            console.log("call /msg/single failed", data);
            failureCallback(err);
        },
        processData: false,
        type: 'POST',
        url: '/msg/single'
    });
}

function sendProjectMessage(message, successCallback, failureCallback) {
    $.ajax({
        contentType: 'application/json',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify(message),
        dataType: 'json',
        success: function (data) {
            console.log("call /msg/project successfully", data);

            var res = JSON.parse(data);
            message.id = res.data.msgId;

            alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
                var stmt = alasql.compile('insert into teamup.project_messages_' + suffix + ' (id, from_user, project, data) values (?, ?, ?, ?)');
                stmt([message.id, message.from, message.project, JSON.stringify(message)], function () {
                    console.log('insert project message successfully');
                    successCallback();
                });
            });
        },
        error: function (err) {
            console.log("call /msg/project failed", data);
            failureCallback(err);
        },
        processData: false,
        type: 'POST',
        url: '/msg/project'
    });
}
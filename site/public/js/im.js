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
        alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
            var stmt = alasql.compile('insert into teamup.single_messages_' + suffix + ' (id, user, data, recv) values (?, ?, ?, ?)');
            stmt([msg.id, msg.from, data.msg, 1], function () {
                console.log('insert single message successfully');
            });
        });
    } else if ('project' in msg) {
        alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
            var stmt = alasql.compile('insert into teamup.project_messages_' + suffix + ' (id, from_user, project, data, recv) values (?, ?, ?, ?, ?)');
            stmt([msg.id, msg.from, msg.project, data.msg, 1], function () {
                console.log('insert project message successfully');
            });
        });
    }

    // send ack to server
    $.ajax({
        contentType: 'application/json',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify({
            messageId: msg.id
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
 * @param {function} callback takes one parameter, messages array
 */
function loadSingleHistoryMessages(peerEmail, callback) {
    if (!(userPool.getCurrentUser())) {
        callback([]);
        return;
    }

    var suffix = userPool.getCurrentUser().username.split('-').join('');
    alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
        alasql('select data from teamup.single_messages_' + suffix + ' where user="' + peerEmail + ' order by id asc', function (result) {
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
 * @param {function} callback takes one parameter, messages array
 */
function loadProjectHistoryMessages(projectId, callback) {
    if (!(userPool.getCurrentUser())) {
        callback([]);
        return;
    }

    var suffix = userPool.getCurrentUser().username.split('-').join('');
    alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
        alasql('select data from teamup.project_messages_' + suffix + ' where project=' + projectId + ' order by id asc', function (result) {
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

    alasql('ATTACH INDEXEDDB DATABASE teamup', async function () {
        // project conversations
        var projectMaxIds = await alasql.promise('select project, max(id) as maxId from teamup.project_messages_' + suffix + ' group by project');

        console.log('projectMaxIds', projectMaxIds);

        if (projectMaxIds[0].maxId) {
            var idClause = "";
            for (var i = 0; i < projectMaxIds.length; i++) {
                if (i != 0) {
                    idClause += ',';
                }
                idClause += projectMaxIds[i].maxId;
            }

            var projectClause = "";
            for (var i = 0; i < projectMaxIds.length; i++) {
                if (i != 0) {
                    idClause += ',';
                }
                projectClause += projectMaxIds[i].project;
            }

            console.log('project id clause', idClause, ' project clause', projectClause);

            var projectCursors = {};
            var projectCursorRows = await alasql.promise('select project, max_id from teamup.project_conversation_cursor_' + suffix + ' where project in (' + projectClause + ') order by id desc');

            projectCursorRows.forEach(row => {
                if (row.project) {
                    projectCursors[row.project.toString()] = row.max_id;
                }
            });

            var projectLatestMsgs = await alasql.promise('select recv, data from teamup.project_messages_' + suffix + ' where id in (' + idClause + ') order by id desc');
            projectLatestMsgs.forEach(row => {
                var conversation = new Object();

                var message = JSON.parse(row.data);

                conversation.latestMessage = message;

                var projectMaxId = 0;
                if (message.project.toString() in projectCursors) {
                    projectMaxId = projectCursors[message.project.toString()];
                }

                if (message.id > projectMaxId) {
                    conversation.unread = true;
                } else {
                    conversation.unread = false;
                }

                conversations.project.push(conversation);
            });
        }

        // single conversations
        var singleMaxIds = await alasql.promise('select user, max(id) as maxId from teamup.single_messages_' + suffix + ' group by user');

        console.log('singleMaxIds', projectMaxIds);

        if (singleMaxIds[0].maxId) {
            var idClause = "";
            for (var i = 0; i < singleMaxIds.length; i++) {
                if (i != 0) {
                    idClause += ',';
                }
                idClause += singleMaxIds[i].maxId;
            }

            var userClause = "";
            for (var i = 0; i < projectMaxIds.length; i++) {
                if (i != 0) {
                    userClause += ',';
                }
                userClause += projectMaxIds[i].project;
            }

            console.log('single id clause', userClause, ' user clause', userClause);

            var userCursors = {};
            var userCursorRows = await alasql.promise('select user, max_id from teamup.single_conversation_cursor_' + suffix + ' where user in (' + userClause + ') order by id desc');

            userCursorRows.forEach(row => {
                if (row.user) {
                    userCursors[row.user.toString()] = row.max_id;
                }
            });

            var singleLatestMsgs = await alasql.promise('select recv, data from teamup.single_messages_' + suffix + ' where id in (' + idClause + ') order by id desc');
            singleLatestMsgs.forEach(row => {
                var conversation = new Object();

                var message = JSON.parse(row.data);

                conversation.latestMessage = message;

                var singleMaxId = 0;
                if (message.user.toString() in userCursors) {
                    singleMaxId = userCursors[message.user.toString()];
                }

                if (message.id > singleMaxId) {
                    conversation.unread = true;
                } else {
                    conversation.unread = false;
                }

                conversations.single.push(conversation);
            });
        }

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

            message = data.data;

            alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
                var suffix = userPool.getCurrentUser().username.split('-').join('');
                var stmt = alasql.compile('insert into teamup.single_messages_' + suffix + ' (id, user, data, recv) values (?, ?, ?, ?)');
                stmt([message.id, message.to, JSON.stringify(message), 0], function () {
                    console.log('insert single message successfully');
                    successCallback();
                });
            });
        },
        error: function (err) {
            console.log("call /msg/single failed", err);
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

            message = data.data

            alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
                var suffix = userPool.getCurrentUser().username.split('-').join('');
                var stmt = alasql.compile('insert into teamup.project_messages_' + suffix + ' (id, from_user, project, data, recv) values (?, ?, ?, ?, ?)');
                stmt([message.id, message.from, message.project, JSON.stringify(message), 0], function () {
                    console.log('insert project message successfully');
                    successCallback();
                });
            });
        },
        error: function (err) {
            console.log("call /msg/project failed", err);
            failureCallback(err);
        },
        processData: false,
        type: 'POST',
        url: '/msg/project'
    });
}

function resetSingleConversationCursor(peerEmail, maxId) {
    alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
        var stmt = alasql.compile('update teamup.single_conversation_cursor_' + suffix + ' set max_id=? where user=?');
        stmt([maxId, peerEmail], function () {
            console.log('single cursor reset', peerEmail, maxId);
        });
    });
}

function resetProjectConversationCursor(projectId, maxId) {
    alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
        var stmt = alasql.compile('update teamup.project_conversation_cursor_' + suffix + ' set max_id=? where project=?');
        stmt([maxId, projectId], function () {
            console.log('project cursor reset', projectId, maxId);
        });
    });
}
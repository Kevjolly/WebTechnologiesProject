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
// Initialize Firebase
// const messaging = firebase.messaging();
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

            if (!isTokenSentToServer()) {
                console.log('sending token to server');
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
                    url: '/user/setToken'
                });
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

    var dbName = 'teamup' + userPool.getCurrentUser().username.split('-').join('');

    console.log('dbname', dbName);

    if ('to' in msg) {
        alasql('ATTACH INDEXEDDB DATABASE ' + dbName, function () {
            var stmt = alasql.compile('insert into ' + dbName + '.single_messages (id, from_user, to_user, data) values (?, ?, ?, ?)');
            stmt([msg.id, msg.from, msg.to, data.msg], function () {
                console.log('insert single message successfully');
            });
        });
    } else if ('project' in msg) {
        alasql('ATTACH INDEXEDDB DATABASE ' + dbName, function () {
            var stmt = alasql.compile('insert into ' + dbName + '.project_messages (id, from_user, project, data) values (?, ?, ?, ?)');
            stmt([msg.id, msg.from, msg.group, data.msg], function () {
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

    navigator.serviceWorker.addEventListener("message", function (event) {
        if ("firebase-messaging-msg-type" in event.data) {
            return;
        }

        handleMessage(event.data, callback);
    });
}

function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

/**
 * 
 * @param {string} peerEmail 
 * @param {long} maxId 
 * @param {int} count 
 * @param {function} callback takes one parameter, messages array
 */
function loadSingleMessages(peerEmail, maxId, count, callback) {
    var dbName = 'teamup' + userPool.getCurrentUser().username.split('-').join('');
    alasql('ATTACH INDEXEDDB DATABASE ' + dbName, function () {
        alasql('select data from ' + dbName + '.single_messages where (from_user="' + peerEmail + '" or to_user="' + peerEmail + '") and id<' + maxId + ' order by id desc limit ' + count, function (result) {
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
function loadGroupMessages(projectId, maxId, count, callback) {
    var dbName = 'teamup' + userPool.getCurrentUser().username.split('-').join('');
    alasql('ATTACH INDEXEDDB DATABASE ' + dbName, function () {
        alasql('select data from ' + dbName + '.project_messages where project=' + projectId + ' and id<' + maxId + ' order by id desc limit ' + count, function (result) {
            var messages = new Array();
            result.forEach(row => {
                messages.push(JSON.parse(row.data));
            })

            callback(messages);
        });
    });
}

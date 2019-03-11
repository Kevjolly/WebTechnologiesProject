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
    // TODO(developer): Retrieve an Instance ID token for use with FCM.
    // ...
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

messaging.onMessage(function (payload) {
    console.log('Message received. ', payload);
    // ...
});

function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}
// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('https://www.gstatic.com/firebasejs/5.8.6/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.8.6/firebase-messaging.js');
importScripts('https://cdn.jsdelivr.net/alasql/0.2/alasql.min.js');

function handleMessage(data) {
  var msg = JSON.parse(data.msg);

  alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
    alasql('select username from teamup.current_user', function (result) {
      console.log('background message received', msg.id, data.msg);

      var username;
      result.forEach(row => {
        username = row.username;
      });

      if (!username) {
        return;
      }

      var suffix = username.split('-').join('');

      if ('to' in msg) {
        alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
          var stmt = alasql.compile('insert into teamup.single_messages_' + suffix + ' (id, user, data) values (?, ?, ?)');
          stmt([msg.id, msg.from, data.msg], function () {
            console.log('insert background single message successfully');
          });
        });
      } else if ('project' in msg) {
        alasql('ATTACH INDEXEDDB DATABASE teamup', function () {
          var stmt = alasql.compile('insert into teamup.project_messages_' + suffix + ' (id, from_user, project, data) values (?, ?, ?, ?)');
          stmt([msg.id, msg.from, msg.project, data.msg], function () {
            console.log('insert project message successfully');
          });
        });
      }
    });
  });
}

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

self.addEventListener('notificationclick', function (event) {
  event.waitUntil(async function () {
    const allClients = await clients.matchAll({
      includeUncontrolled: true
    });

    let targetClient;

    var notification = JSON.parse(event.notification.data.notification);

    var actionUrl = new URL(notification.click_action);

    // Let's see if we already have a chat window open:
    for (const client of allClients) {
      const url = new URL(client.url);

      if (url.pathname == actionUrl.pathname) {
        client.focus();
        targetClient = client;
        break;
      }
    }

    // If we didn't find an existing chat window,
    // open a new one:
    if (!targetClient) {
      targetClient = await clients.openWindow(notification.click_action);
    }
  }());

  console.log('notification clicked', event);

  event.notification.close();
});

messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  handleMessage(payload.data);

  var notification = JSON.parse(payload.data.notification);

  // Customize notification
  var notificationTitle = notification.title;

  var notificationOptions = {
    body: notification.body,
    icon: notification.icon,
    data: payload.data,
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});

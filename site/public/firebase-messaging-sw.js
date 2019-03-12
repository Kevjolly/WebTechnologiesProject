// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('https://www.gstatic.com/firebasejs/5.8.6/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.8.6/firebase-messaging.js');

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

function sendMessage(message) {
  // This wraps the message posting/response in a promise, which will
  // resolve if the response doesn't contain an error, and reject with
  // the error if it does. If you'd prefer, it's possible to call
  // controller.postMessage() and set up the onmessage handler
  // independently of a promise, but this is a convenient wrapper.
  return new Promise(function (resolve, reject) {
    var messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function (event) {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    // This sends the message data as well as transferring
    // messageChannel.port2 to the service worker.
    // The service worker can then use the transferred port to reply
    // via postMessage(), which will in turn trigger the onmessage
    // handler on messageChannel.port1.
    // See
    // https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
}

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
        // Excellent, let's use it!
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

    // Message the client:
    targetClient.postMessage("New chat messages!");
  }());

  console.log('notification clicked', event.notification);

  event.notification.close();
});

messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

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

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

messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  var notificationTitle = 'Background Message Title';
  var notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});

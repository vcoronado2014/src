importScripts('https://www.gstatic.com/firebasejs/8.0.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.0.2/firebase-messaging.js');

 // Initialize the Firebase app in the service worker by passing in
 // your app's Firebase config object.
 // https://firebase.google.com/docs/web/setup#config-object

 initializeFirebase();

function initializeFirebase() {
 var firebaseConfig = {
    apiKey: "AIzaSyAkKRvqQ2fq7r8L1a-hG0_A31owEcxbXIM",
    authDomain: "mifamiliaapp.firebaseapp.com",
    projectId: "mifamiliaapp",
    storageBucket: "mifamiliaapp.appspot.com",
    messagingSenderId: "1034586005863",
    appId: "1:1034586005863:web:6fa4c50650d31b427d8fc2",
    measurementId: "G-D5P9RNNYRT"
  };
  // Initialize Firebase
  var firebaseApp = firebase.initializeApp(firebaseConfig);
  var messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
      body: 'Background Message body.',
      icon: '/firebase-logo.png'
    };
    //presentToast(notificationTitle, notificationOptions);
    self.registration.showNotification(notificationTitle,
      notificationOptions);
  });
}
/* async function presentToast(title, notificationOptions) {
  const toast = document.createElement('ion-toast');
  toast.message = title +'\n' + notificationOptions.body;
  toast.duration = 2000;

  document.body.appendChild(toast);
  return toast.present();
} */
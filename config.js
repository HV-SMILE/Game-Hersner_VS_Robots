// Firebase configuration for the online leaderboard.
window.HVR_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBx-txNHKNK2si4uGWi3A85-i5FhrKPeIk",
  authDomain: "heroes-vs-robots.firebaseapp.com",
  databaseURL: "https://heroes-vs-robots-default-rtdb.firebaseio.com",
  projectId: "heroes-vs-robots",
  storageBucket: "heroes-vs-robots.firebasestorage.app",
  messagingSenderId: "996249091747",
  appId: "1:996249091747:web:2e2a4fc6a4d074cd8dc916"
};

// Firebase is loaded in index.html before game.js.
try {
  if (window.firebase && !window.firebase.apps.length) {
    window.firebase.initializeApp(window.HVR_FIREBASE_CONFIG);
  }
  window.HVR_LEADERBOARD_DB = window.firebase ? window.firebase.database() : null;
} catch (e) {
  console.error('Firebase initialization failed:', e);
  window.HVR_LEADERBOARD_DB = null;
}

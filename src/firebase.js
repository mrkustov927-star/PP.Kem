// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCj3uUUqGKZ2CalH-v3So6OjU_-eZH7tUc",
  authDomain: "pp10-79133.firebaseapp.com",
  projectId: "pp10-79133",
  storageBucket: "pp10-79133.firebasestorage.app",
  messagingSenderId: "179048880378",
  appId: "1:179048880378:web:0510340ddfb5f639b01143",
  measurementId: "G-QCX9BD9KY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

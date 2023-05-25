
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js"
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js"

const firebaseConfig = {
  apiKey: "AIzaSyDdRWUenOF9mlCfp532WlO6rwPuF0GQQSM",
  authDomain: "pwebtest-b44d6.firebaseapp.com",
  databaseURL: "https://pwebtest-b44d6-default-rtdb.firebaseio.com",
  projectId: "pwebtest-b44d6",
  storageBucket: "pwebtest-b44d6.appspot.com",
  messagingSenderId: "921246447893",
  appId: "1:921246447893:web:2ffbf5931fe7f2a13d111c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app)
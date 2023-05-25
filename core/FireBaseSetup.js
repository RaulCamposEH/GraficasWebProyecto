import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getDatabase, ref, onValue, set, update } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js"
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
}
const log = console.log

const app = initializeApp(firebaseConfig)

const db = getDatabase(app)

const players = ref(db, 'Jugadores')
const game = ref(db, 'Game')

let players_data;
let game_data;

// onValue(players, (snapshot) => {
//   players_data = snapshot.val();
// });

// onValue(game, (snapshot) => {
//   game_data = snapshot.val();
//   console.log(game_data)
// });

function createNewGame(roomName, playerHost){
  const player_data = {
    rol: "host"
  }
  if(!game_data){
    onValue(ref(db, `Game/${roomName}/players`), (snapshot) => {
      game_data = snapshot.val();
      // log(game_data)
      // Object.entries(game_data).forEach(([key, value]) => {
      //   log(key)
      //   log(value)
      // })
    });
  }
  set(ref(db, `Game/${roomName}/players/${playerHost}`,), {
    ...player_data
  })
}

function joinGame(roomName, playerJoin){
  const player_data = {
    rol: "join"
  }
  if(!game_data){
    onValue(ref(db, `Game/${roomName}/players`), (snapshot) => {
      game_data = snapshot.val();
      // log(game_data)
    });
  }
  set(ref(db, `Game/${roomName}/players/${playerJoin}`), {
    ...player_data
  })
}

// function writeUserData(userId, Positions) {
//   set(ref(db, `Jugadores/${userId}`), {
//     x: Positions.x,
//     y: Positions.y,
//     z: Positions.z
//   });
// }

function writeUserData(userId, room, data) {
  update(ref(db, `Game/${room}/players/${userId}`), {
    ...data
  });
}

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

async function login(onLoginDo) {
  // let localuser;
  const res = await signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      onLoginDo(user)
      // localuser = user.uid
      // writeUserData(user.uid, { x: camera.position.x, y: , z: camera.position.z })
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
    });

  // return localuser
}

export { players_data, game_data, writeUserData, login, createNewGame, joinGame};
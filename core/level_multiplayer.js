
import * as THREE from '../three/three.module.js';

//dependencias
import { GLTFLoader } from '../three/GLTFLoader.js';
import { Octree } from '../three/Octree.js';
// import { OctreeHelper } from './three/OctreeHelper.js';
import { Capsule } from '../three/Capsule.js';
import Bullets from './Bullets.js'
import Target from './Target.js'
import MovableTarget from './MovableTarget.js'
import Temporizador from './Temporizador.js'

import { login, writeUserData, createNewGame, joinGame} from './FireBaseSetup.js';
import { game_data } from './FireBaseSetup.js';

const log = console.log
const clock = new THREE.Clock();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88ccee);
scene.fog = new THREE.Fog(0x88ccee, 0, 50);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';

const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 0.5);
fillLight1.position.set(2, 1, 1);
scene.add(fillLight1);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(- 5, 25, - 1);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.01;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.left = - 30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = - 30;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.radius = 4;
directionalLight.shadow.bias = - 0.00006;
scene.add(directionalLight);

const container = document.getElementById('canvas');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

let localuser, localroom;
let localPlayerMaterial = new THREE.MeshBasicMaterial({ color: "blue" });
// let material2 = new THREE.MeshBasicMaterial({ color: "red" });
// let material3 = new THREE.MeshBasicMaterial({ color: "green" });
// let material4 = new THREE.MeshBasicMaterial({ color: "yellow" });

const Players = []

// document.getElementById("btnlogin").addEventListener("click", async () => {
//   await login((user) => {
//     console.log(user)
//     localuser = user.uid
//     // writeUserData(user.uid, { x: camera.position.x, y: camera.position.y, z: camera.position.z })
//     Players.push(new Bullets(scene, localPlayerMaterial, user.uid))
//     document.getElementById("modal").classList.toggle("hideElement")
//   })
// })

// document.addEventListener("DOMContentLoaded", async () => {
//   log("hola")
//   await login((user) => {
//     console.log(user)
//     localuser = user.uid
//     // writeUserData(user.uid, { x: camera.position.x, y: camera.position.y, z: camera.position.z })
//     Players.push(new Bullets(scene, localPlayerMaterial, user.uid))
//     document.getElementById("modal").classList.toggle("hideElement")
//   })
// });

document.getElementById("btn-crateRoom").addEventListener("click", (e) => {
  const room = document.getElementById("inp_room_name").value
  if (room == ""){
    alert("inserte un nombre para poder crear la sala")
    return
  }
  createNewGame(room, localuser)
  writeUserData(localuser, room, { 
    x: camera.position.x, 
    y: camera.position.y, 
    z: camera.position.z 
  })
  localroom = room;
  document.getElementById("modal").classList.toggle("hideElement")
})

document.getElementById("btn-joinRoom").addEventListener("click", (e) => {
  const room = document.getElementById("inp_room_join").value
  if (room == ""){
    alert("inserte un nombre para poder unirse a una sala")
    return
  }
  joinGame(room, localuser)
  writeUserData(localuser, room, { 
    x: camera.position.x, 
    y: camera.position.y, 
    z: camera.position.z 
  })
  localroom = room;
  document.getElementById("modal").classList.toggle("hideElement")
})

// document.getElementById("btnlogout").addEventListener("click", () => {
//   signOut(auth).then(() => {
//     log("Sign-out successful")
//   }).catch((error) => {
//     log("An error happened.")
//   });
// })

const GRAVITY = 30;
const STEPS_PER_FRAME = 7;

const worldOctree = new Octree();

const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;
let mouseTime = 0;

const keyStates = {};


document.addEventListener('keydown', (event) => {

  keyStates[event.code] = true;

});

document.addEventListener('keyup', (event) => {

  keyStates[event.code] = false;

});

container.addEventListener('mousedown', () => {
  //game anchor
  if(!localroom ) return
  document.body.requestPointerLock();

  mouseTime = performance.now();
});

document.addEventListener('mouseup', () => {
  const actualPlayer = localuser
  if (document.pointerLockElement !== null) {
    log(Players)
    const Player = Players.filter(player => player.player == actualPlayer)[0]
    log(Player)
    camera.getWorldDirection(playerDirection);
    Player.shoot({ playerCollider, playerDirection, playerVelocity, mouseTime })
  }
});

document.body.addEventListener('mousemove', (event) => {
  // if (!localuser) return
  if (document.pointerLockElement === document.body) {
    camera.rotation.y -= event.movementX / 500;
    camera.rotation.x -= event.movementY / 500;
  }

});

const loader = new GLTFLoader().setPath('./assets/models/gltf/');

let static_spawn_positions = [];
let movable_spawn_positions = [];

loader.load('spawn_points_lvl1.glb', (gltf) => {
  console.log(gltf.scene)
  gltf.scene.children.forEach((el, index) => {
    const ismovable = /\w*spawnMovable/.test(el.name)
    if (ismovable) movable_spawn_positions.push(el)
    else static_spawn_positions.push(el)
  })
  console.log(static_spawn_positions)
})

let staticTargets = [];
let movableTargets = [];

const NUM_OF_ROUNDS = 5
const TARGETS_PER_ROUND = 3

loader.load('target.glb', (gltf) => {
  static_spawn_positions.forEach((el, index) => {
    const newTarget = new Target({
      positions: el.position,
      TargetMesh: gltf.scene.children[0].clone(),
      MeshName: `target_0${index}`
    })

    scene.add(newTarget.group)

    staticTargets.push(newTarget)

  })
  movable_spawn_positions.forEach((el, index) => {
    for (let n = 0; n < NUM_OF_ROUNDS; n++) {
      let groupTargets = []
      for (let i = 0; i < TARGETS_PER_ROUND; i++) {
        const newTarget = new MovableTarget({
          positions: el.position,
          TargetMesh: gltf.scene.children[0].clone(),
          MeshName: `movtarget_0${index}`,
          rotation: "default",
          direction: "-z",
          index: i,
          round: n
        })

        scene.add(newTarget.group)

        groupTargets.push(newTarget)
      }
      movableTargets.push(groupTargets)
    }
  })
  console.log(staticTargets)
  console.log(movableTargets)
})

let carabine
loader.load("carabine.glb", function (gltf) {
  carabine = gltf.scene.children[0].clone()
  carabine.scale.set(0.03, 0.03, 0.03)
  log(carabine.quaternion)
})

window.addEventListener('resize', onWindowResize);

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function playerCollisions() {

  const result = worldOctree.capsuleIntersect(playerCollider);

  playerOnFloor = false;

  if (result) {

    playerOnFloor = result.normal.y > 0;

    if (!playerOnFloor) {

      playerVelocity.addScaledVector(result.normal, - result.normal.dot(playerVelocity));

    }

    playerCollider.translate(result.normal.multiplyScalar(result.depth));

  }

}

const gunOffset = new THREE.Vector3(0.15, -0.15, -2.5);
const objectRotation = new THREE.Matrix4().makeRotationY(Math.PI / 2); // Matriz de rotación en el eje Y con 90 grados

function updatePlayer(deltaTime) {

  let damping = Math.exp(- 4 * deltaTime) - 1;

  if (!playerOnFloor) {

    playerVelocity.y -= GRAVITY * deltaTime;

    // small air resistance
    damping *= 0.1;

  }

  playerVelocity.addScaledVector(playerVelocity, damping);

  const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
  playerCollider.translate(deltaPosition);

  playerCollisions();

  camera.position.copy(playerCollider.end);

  const cameraOffsetMatrix = new THREE.Matrix4().makeTranslation(gunOffset.x, gunOffset.y, gunOffset.z);
  const objectMatrix = new THREE.Matrix4().multiplyMatrices(camera.matrixWorld, cameraOffsetMatrix);
  carabine.position.setFromMatrixPosition(objectMatrix);
  const rotMtx = new THREE.Matrix4().multiplyMatrices(objectMatrix, objectRotation)
  carabine.quaternion.setFromRotationMatrix(rotMtx);
  if (game_data) {
    scene.getObjectByName(localuser).position.setFromMatrixPosition(objectMatrix);
    scene.getObjectByName(localuser).quaternion.setFromRotationMatrix(rotMtx);
    const tempQuat = scene.getObjectByName(localuser).quaternion
    const tempPosition = scene.getObjectByName(localuser).position
    writeUserData(localuser, localroom, {
      x: tempPosition.x,
      y: camera.position.y, 
      z: tempPosition.z,
      rotArray: [
        tempQuat.x,
        tempQuat.y,
        tempQuat.z,
        tempQuat.w,
      ]
    })

  }
}

function getForwardVector() {

  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();

  return playerDirection;

}

function getSideVector() {

  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();
  playerDirection.cross(camera.up);

  return playerDirection;

}

function controls(deltaTime) {

  if (!localuser || !localroom){
    // alert("inicia sesion para poder jugar")
    return
  }
  // gives a bit of air control
  const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

  if (keyStates['KeyW']) {

    playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));

  }

  if (keyStates['KeyS']) {

    playerVelocity.add(getForwardVector().multiplyScalar(- speedDelta));

  }

  if (keyStates['KeyA']) {

    playerVelocity.add(getSideVector().multiplyScalar(- speedDelta));

  }

  if (keyStates['KeyD']) {

    playerVelocity.add(getSideVector().multiplyScalar(speedDelta));

  }

  if (playerOnFloor) {

    if (keyStates['Space']) {

      playerVelocity.y = 15;

    }

  }

}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const setupTargetTimer = new Temporizador(3);
// setupTargetTimer.start()
const startRoundTimer = new Temporizador(3);
// startRoundTimer.start()
const nextTargetTimer = new Temporizador(1);
let Round_index = 0
let TargetRound_index = 0

function updateStaticTargets(deltaTime) {
  if (setupTargetTimer.timeEnded) {
    let nonSetedTargets = staticTargets.filter(target => !target.seted)
    if (nonSetedTargets.length == 0) return
    while (true) {
      let target = staticTargets[getRandomInt(staticTargets.length)]
      if (target.startAnimUp) continue
      target.startAnimUp = true
      setupTargetTimer.resetTimer()
      break
    }
  }
  staticTargets.forEach((el) => {
    if (el.startAnimUp) {
      el.animateUp(deltaTime)
    }
    if (el.startAnimDown) {
      el.animateDown(deltaTime)
    }
  })
}

function updateMovableTargets(deltaTime) {
  if (startRoundTimer.timeEnded) {
    if (NUM_OF_ROUNDS == Round_index) {
      startRoundTimer.stop()
      nextTargetTimer.stop()
    }
    if (!nextTargetTimer.startTimer) nextTargetTimer.start()
    if (nextTargetTimer.timeEnded) {
      console.log(`target: ${TargetRound_index} of round: ${Round_index}`)
      if (TargetRound_index == 3) {
        console.log("end of round")
        Round_index += 1
        TargetRound_index = 0
        startRoundTimer.resetTimer()
      }
      else {
        movableTargets[Round_index][TargetRound_index].seted = true
        movableTargets[Round_index][TargetRound_index].startMovAnim = true
        TargetRound_index += 1
        nextTargetTimer.resetTimer()
      }
    }
  }
  movableTargets.forEach((group) => {
    group.forEach((el) => {
      if (el.startAnimDown) {
        el.animateDown(deltaTime)
      }
      if (el.startMovAnim) {
        // console.log("actualizando movimiento")
        el.updateTargetMovement(deltaTime)
      }
    })
  })
}

function targetColisions() {
  staticTargets.forEach((target, index) => {
    if (!target.startAnimDown) {
      Players.forEach(playerBullets => {
        playerBullets.bullets.forEach(bullet => {
          const colisionResult = target.bb.intersectsSphere(bullet.collider)
          if (colisionResult && target.seted) {
            staticTargets[index].startAnimDown = true
            playerBullets.scorePlayer()
          }
        })
      })
    }
  })
  movableTargets.forEach(group => {
    group.forEach((target, index) => {
      // console.log(target.seted)
      if (!target.startAnimDown) {
        Players.forEach(playerBullets => {
          playerBullets.bullets.forEach(bullet => {
            const colisionResult = target.bb.intersectsSphere(bullet.collider)
            if (colisionResult && target.seted) {
              group[index].startAnimDown = true
              if (group[index].seted) playerBullets.scorePlayer()
            }
          })
        })
      }
    })
  })
}

function teleportPlayerIfOob() {
  if (camera.position.y <= - 25) {
    playerCollider.start.set(0, 0.35, 0);
    playerCollider.end.set(0, 1, 0);
    playerCollider.radius = 0.35;
    camera.position.copy(playerCollider.end);
    camera.rotation.set(0, 0, 0);
  }
}

function updateTimers(deltaTime) {
  setupTargetTimer.updateTimer(deltaTime)
  startRoundTimer.updateTimer(deltaTime)
  nextTargetTimer.updateTimer(deltaTime)
}

function updatePlayersData() {
  Object.entries(game_data).forEach(([key, value]) => {
    const player = scene.getObjectByName(key)
    if (!player) {
      log("creando jugador...")
      let newplayer = carabine.clone()
      if (key == localuser) newplayer.position.set(value.x, value.y, value.z)
      if (key == localuser) newplayer.scale.set(0.03, 0.03, 0.03)
      else newplayer.scale.set(0.01,0.01,0.01)
      newplayer.name = key
      scene.add(newplayer)
      log("jugador creado!")
    }
    scene.getObjectByName(key).position.x = value.x
    scene.getObjectByName(key).position.y = value.y
    scene.getObjectByName(key).position.z = value.z
    if (value.rotArray) scene.getObjectByName(key).quaternion.fromArray(value.rotArray)
  })
  // log(data)
  // updateStarCount(postElement, data);
}


loader.load('Scene01.glb', async (gltf) => {

  scene.add(gltf.scene);

  worldOctree.fromGraphNode(gltf.scene);

  gltf.scene.traverse(child => {

    if (child.isMesh) {

      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material.map) {

        child.material.map.anisotropy = 4;

      }

    }

  });

  animate();

  await login((user) => {
    console.log(user)
    localuser = user.uid
    // writeUserData(user.uid, { x: camera.position.x, y: camera.position.y, z: camera.position.z })
    Players.push(new Bullets(scene, localPlayerMaterial, user.uid))
    document.getElementById("modal").classList.toggle("hideElement")
  })

});

function animate() {

  if(localuser && localroom){
    setupTargetTimer.start()
    startRoundTimer.start()
  }

  const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

  // we look for collisions in substeps to mitigate the risk of
  // an object traversing another too quickly for detection.
  for (let i = 0; i < STEPS_PER_FRAME; i++) {

    controls(deltaTime);

    if (localroom && game_data) updatePlayersData();
    updatePlayer(deltaTime);

    updateTimers(deltaTime)

    updateStaticTargets(deltaTime)
    updateMovableTargets(deltaTime)
    targetColisions()
    // updateBullet(deltaTime)

    Players.forEach(playerBullets => playerBullets.updateBullet(deltaTime, worldOctree, GRAVITY))

    teleportPlayerIfOob();

  }

  renderer.render(scene, camera);

  
  requestAnimationFrame(animate);

}

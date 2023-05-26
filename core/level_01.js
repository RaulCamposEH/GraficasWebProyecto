
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
import createBillboard from './Billboards.js';

// import { login, writeUserData, createNewGame, joinGame } from './FireBaseSetup.js';
// import { players_data, game_data } from './FireBaseSetup.js';

const log = console.log
const clock = new THREE.Clock();
let game_over = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88ccee);
scene.fog = new THREE.Fog(0x88ccee, 0, 50);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';
camera.lookAt(-1,0,0)

const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 0.5);
fillLight1.position.set(2, 1, 1);
scene.add(fillLight1);

const addBillToScene = (obj) => scene.add(obj, obj.userData.collisionBox)

const bill1 = createBillboard({
  path: "../assets/billboards/clock1.png",
  width: 1,
  height: 1,
  position: new THREE.Vector3(-5, 1, 10),
  onCreate: addBillToScene
})
const bill2 = createBillboard({
  path: "../assets/billboards/clock2.png",
  width: 1,
  height: 1,
  position: new THREE.Vector3(-5, 1, 8),
  onCreate: addBillToScene
})
const bill3 = createBillboard({
  path: "../assets/billboards/clock3.png",
  width: 1,
  height: 1,
  position: new THREE.Vector3(-5, 1, 6),
  onCreate: addBillToScene
})


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

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

let localuser = "player1"
let localPlayerMaterial = new THREE.MeshBasicMaterial({ color: "blue" });

const Players = [
  new Bullets(scene, localPlayerMaterial, localuser)
]

const GRAVITY = 30;
const STEPS_PER_FRAME = 7;

const worldOctree = new Octree();

const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;
let mouseTime = 0;

const keyStates = {};

const powerUpTemp1 = new Temporizador(5)
let levelTimer = new Temporizador(0);
let setupTargetTimer = new Temporizador(0);
let startRoundTimer = new Temporizador(0);
let nextTargetTimer = new Temporizador(0);
let Easy = true
let vel = 3
let Round_index = 0
let TargetRound_index = 0

//Añadir Musica Background
//Crea un AudioListener y lo agregas a la camara
const listener = new THREE.AudioListener();
camera.add(listener);

//Creas un cargador de Audio de todos los sonidos
const audioLoader = new THREE.AudioLoader();

//Creas, cargas y reproduces un sonido de fondo
const backgroundSound = new THREE.Audio(listener);
//Cargar Sonido de Disparo
const ShootGun = new THREE.Audio(listener);
//Cargar Sonido de Disparo Exitoso
const ObjectColl = new THREE.Audio(listener);

//Cargas el Musica de Fondo
audioLoader.load('../assets/Music/Loonboon.mp3', function(buffer){
  backgroundSound.setBuffer(buffer);
  backgroundSound.setLoop(true);
  backgroundSound.setVolume(0.5);
  backgroundSound.play();

});

//Cargas el sonido de Disparo
audioLoader.load('../assets/Sounds/Disparo.mp3', function(buffer){
  ShootGun.setBuffer(buffer);
  ShootGun.setLoop(false);
  ShootGun.setVolume(0.5);
});

//Cargas el sonido de Disparo Exitoso
audioLoader.load('../assets/Sounds/Object_Shoot.mp3', function(buffer){
  ObjectColl.setBuffer(buffer);
  ObjectColl.setLoop(false);
  ObjectColl.setVolume(0.5);
});


document.addEventListener('keydown', (event) => {

  console.log(event)
  keyStates[event.code] = true;

});

document.addEventListener('keyup', (event) => {

  keyStates[event.code] = false;

});

container.addEventListener('mousedown', () => {
  if (!levelTimer.startTimer || game_over == true || levelTimer.timePause) return
  document.body.requestPointerLock();
  mouseTime = performance.now();

});

document.addEventListener('mouseup', (event) => {
  const actualPlayer = localuser
  if (document.pointerLockElement !== null) {
    if(ShootGun.isPlaying){
      ShootGun.stop();
      ShootGun.play();
    }
    else{

      ShootGun.play();
    }
   

    log(Players)
    const Player = Players.filter(player => player.player == actualPlayer)[0]
    log(Player)
    camera.getWorldDirection(playerDirection);
    Player.shoot({ playerCollider, playerDirection, playerVelocity, mouseTime })

    // var mouse = new THREE.Vector2();
    // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // var raycaster = new THREE.Raycaster();
    // raycaster.setFromCamera(mouse, camera);

    // var intersects = raycaster.intersectObjects([collisionBox]);
    // if (intersects.length > 0) {
    //   // billboard.userData.onClick();
    // }
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

document.getElementById("pause-btn").addEventListener("click", () => {
  document.getElementById("modalPausa").classList.toggle("hideElement")
  document.exitPointerLock()
  levelTimer.pause()
})

document.getElementById("btn-resume").addEventListener("click", () => {
  document.getElementById("modalPausa").classList.toggle("hideElement")
  levelTimer.resume()
})


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
  scene.getObjectByName(localuser).position.setFromMatrixPosition(objectMatrix);
  scene.getObjectByName(localuser).quaternion.setFromRotationMatrix(rotMtx);

  // if (game_data) {
  // const tempQuat = scene.getObjectByName(localuser).quaternion
  // const tempPosition = scene.getObjectByName(localuser).position
  // // writeUserData(localuser, localroom, {
  // //   x: tempPosition.x,
  // //   y: camera.position.y,
  // //   z: tempPosition.z,
  // //   rotArray: [
  // //     tempQuat.x,
  // //     tempQuat.y,
  // //     tempQuat.z,
  // //     tempQuat.w,
  // //   ]
  // // })
  // }
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

  // if (!localuser || !localroom) {
  //   // alert("inicia sesion para poder jugar")
  //   return
  // }
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

  if (keyStates['Escape']) {

    document.getElementById("modalPausa").classList.toggle("hideElement")
    document.exitPointerLock()
    levelTimer.pause()

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
        el.updateTargetMovement(deltaTime, vel)
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

            if(ObjectColl.isPlaying){
              ObjectColl.stop();
              ObjectColl.play();
            }
            else{
        
              ObjectColl.play();
            }


            //ObjectColl.play();

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

              if(ObjectColl.isPlaying){
                ObjectColl.stop();
                ObjectColl.play();
              }
              else{
          
                ObjectColl.play();
              }

              if (group[index].seted) playerBullets.scorePlayer()
            }
          })
        })
      }
    })
  })
}

// function teleportPlayerIfOob() {
//   if (camera.position.y <= - 25) {
//     playerCollider.start.set(0, 0.35, 0);
//     playerCollider.end.set(0, 1, 0);
//     playerCollider.radius = 0.35;
//     camera.position.copy(playerCollider.end);
//     camera.rotation.set(0, 0, 0);
//   }
// }

function updateTimers(deltaTime) {
  setupTargetTimer.updateTimer(deltaTime)
  startRoundTimer.updateTimer(deltaTime)
  nextTargetTimer.updateTimer(deltaTime)
  levelTimer.updateTimer(deltaTime)
  powerUpTemp1.updateTimer(deltaTime)
  document.getElementById("levelTime").innerText = levelTimer.leftTime.toFixed(2)
}

document.getElementById("btn-start-easy").addEventListener("click", () => {
  levelTimer = new Temporizador(40);
  setupTargetTimer = new Temporizador(3);
  startRoundTimer = new Temporizador(3);
  nextTargetTimer = new Temporizador(0.5);
  levelTimer.start()
  document.getElementById("modal").classList.toggle("hideElement")
  document.body.requestPointerLock();
})

document.getElementById("btn-start-hard").addEventListener("click", () => {
  Easy = false
  vel = 5
  levelTimer = new Temporizador(20);
  setupTargetTimer = new Temporizador(1);
  startRoundTimer = new Temporizador(1);
  nextTargetTimer = new Temporizador(0.25);
  levelTimer.start()
  document.getElementById("modal").classList.toggle("hideElement")
  document.body.requestPointerLock();
})

document.getElementById("btn-restart").addEventListener("click", () => {
  window.location.reload()
})


loader.load('Scene01.glb', async (gltf) => {

  log("creando jugador...")
  let newplayer = carabine.clone()
  newplayer.position.set(0, 0, 0)
  newplayer.scale.set(0.03, 0.03, 0.03)
  newplayer.name = localuser
  scene.add(newplayer)
  log("jugador creado!")

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

});


function updateBill(){
  if (checkBillColision(bill1)){
    powerUpTemp1.start()
    vel = Easy ? 1 : 3
    setupTargetTimer.leftTime = Easy ? 5 : 3
    startRoundTimer.leftTime = Easy ? 5 : 3
    nextTargetTimer.leftTime = Easy ? 0.75 : 0.5
  }
  if(powerUpTemp1.timeEnded){
    vel = Easy ? 3 : 5
    setupTargetTimer.leftTime = Easy ? 3 : 1
    startRoundTimer.leftTime = Easy ? 3 : 1
    nextTargetTimer.leftTime = Easy ? 0.5 : 0.25
    powerUpTemp1.stop()
  }
  checkBillColision(bill2)
  checkBillColision(bill3)
  bill1.lookAt(camera.position)
  bill2.lookAt(camera.position)
  bill3.lookAt(camera.position)
}

function checkBillColision(bill){
  if (playerCollider.intersectsBox(bill.userData.BB)){
    scene.remove(bill, bill.userData.collisionBox)
    return true
  }
  return false
}

function animate() {
  // if (levelTimer.timePause) requestAnimationFrame(animate);
  if (levelTimer.startTimer) {
    setupTargetTimer.start()
    startRoundTimer.start()
  }

  if (levelTimer.timeEnded) {
    if (!game_over) {
      game_over = true;
      document.getElementById("modalGameOver").classList.toggle("hideElement")
      if (document.pointerLockElement === document.body) {
        document.exitPointerLock()
      }
    }
    return
  }


  const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

  // we look for collisions in substeps to mitigate the risk of
  // an object traversing another too quickly for detection.
  for (let i = 0; i < STEPS_PER_FRAME; i++) {
    if (!levelTimer.timePause) {
      controls(deltaTime);

      updatePlayer(deltaTime);
      updateTimers(deltaTime)

      updateStaticTargets(deltaTime)
      updateMovableTargets(deltaTime)
      targetColisions()
      updateBill()

      Players.forEach(playerBullets => playerBullets.updateBullet(deltaTime, worldOctree, GRAVITY))
    }
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}


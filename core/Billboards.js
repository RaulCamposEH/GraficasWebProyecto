import * as THREE from '../three/three.module.js';

function createBillboard({
  path,
  width,
  height,
  position,
  onCreate
}) {
  // Crear un material para el billboard (puedes usar una imagen como textura)
  const billboardMaterial = new THREE.MeshBasicMaterial({
    // color: "red",
    map: new THREE.TextureLoader().load(path),
    transparent: true
  });

  const billboardGeometry = new THREE.PlaneGeometry(
    width,
    height
  );

  let billboard = new THREE.Mesh(billboardGeometry, billboardMaterial);
  billboard.position.copy(position)

  const collisionBoxGeometry = new THREE.BoxGeometry(
    height/1.5,
    width/1.5,
    0.75 // Grosor de la caja de colisión, puedes ajustarlo según tus necesidades
  );

  const collisionBoxMaterial = new THREE.MeshBasicMaterial({ color: "blue", visible: true , transparent: true});
  collisionBoxMaterial.opacity = 0.05
  const collisionBox = new THREE.Mesh(
    collisionBoxGeometry,
    collisionBoxMaterial
  );
  
  collisionBox.position.copy(billboard.position);
  // scene.add(collisionBox);

  billboard.userData.collisionBox = collisionBox;
  billboard.userData.BB = new THREE.Box3().setFromObject(collisionBox);
  billboard.userData.onClick = function () {
    console.log("¡Haz hecho clic en el billboard!");
  };

  onCreate(billboard)

  return billboard
}

export default createBillboard
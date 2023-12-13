import './style.css'
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

// Escena de la animació
const scene = new THREE.Scene();

// Propietats de la camera
const fov = 60;
const aspect = window.innerWidth/window.innerHeight;  
const near = 0.1;
const far = 1000;

// Camera
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
camera.position.set(5,15,5);
camera.lookAt(new THREE.Vector3(0,0,0));


// Render: crea el canvas on hi ha l'animació
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Controls de camera amb el mouse
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Redimensiona la escena
window.addEventListener('resize', () => {

  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// --------------- SKYBOX ------------------------
const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMap = cubeTextureLoader.load([
  'Skybox/px.png',
  'Skybox/nx.png',
  'Skybox/py.png',
  'Skybox/ny.png',
  'Skybox/pz.png',
  'Skybox/nz.png'
])

scene.background = environmentMap

// DIRECTIONAL LIGHT
const dirlight = new THREE.DirectionalLight(0xffffff,3);
dirlight.position.set(-1, 50, 50);
// dirlight.castShadow = true
// dirlight.shadow.mapSize.width = 1024
// dirlight.shadow.mapSize.height = 1024
// dirlight.shadow.camera.top = 60
// dirlight.shadow.camera.right = 60
// dirlight.shadow.camera.bottom = - 60
// dirlight.shadow.camera.left = - 60
scene.add(dirlight);

// Llum ambiental
const light = new THREE.AmbientLight( 0x404040 );
scene.add(light);

let forest = null;
ImportGLTF(
  forest,
  'Models/Forest/forest.gltf',
  new THREE.Vector3(0,0,0),
  new THREE.Vector3(1.5,1.5,1.5),
  0
);

let godForest = null;
ImportGLTF(
  godForest,
  'Models/GodOfForest/scene.gltf',
  new THREE.Vector3(18,-0.2,5),
  new THREE.Vector3(1,1,1),
  0
);

let spider = null;
ImportGLTF(
  spider,
  'Models/Spider/scene.gltf',
  new THREE.Vector3(-8.75,5,-2.1),
  new THREE.Vector3(20,20,20),
  Math.PI/2
);

let wolf = null;
let mixer = null
ImportWolf();

let time = Date.now();
//Iniciam el bucle
AnimationLoop();

// Bucle de renderització
function AnimationLoop(){
    let thisTime = Date.now();
    let deltaTime = thisTime - time;
    time = thisTime;
    
    if(mixer) {
      mixer.update(deltaTime)
    }


    renderer.render(scene,camera);
    requestAnimationFrame(AnimationLoop);
}

function ImportGLTF(obj, path, position, scale, rotateX){

  const loader = new GLTFLoader();

  loader.load(
      // Ruta al model
      path,
      // FUNCIONS DE CALLBACK
      function (gltf){
          // Si es carrega correctament s'afageix a l'escena.
          obj = gltf.scene;
          obj.position.set(position.x,position.y,position.z);
          obj.scale.set(scale.x, scale.y, scale.z);
          obj.rotateX(rotateX);
          scene.add(obj);
      },
      // Mira el procés de carrega del model dins la web.
      function (xhr){
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // Treu els errors en cas de que en tengui.
      function (error){
          console.log("Error: " + error);
      }

  );
}

function ImportWolf(){

  const loader = new GLTFLoader();

  loader.load(
      // Ruta al model
      'Models/Wolf/wolfi.gltf',
      // FUNCIONS DE CALLBACK
      function (gltf){
          // Si es carrega correctament s'afageix a l'escena.
          wolf = gltf.scene;
          wolf.position.set(0,0,0);
          wolf.scale.set(2,2,2);
          scene.add(wolf);
          mixer = new THREE.AnimationMixer(gltf.scene)
          const action = mixer.clipAction(gltf.animations[0])
          action.play()
      },
      // Mira el procés de carrega del model dins la web.
      function (xhr){
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // Treu els errors en cas de que en tengui.
      function (error){
          console.log("Error: " + error);
      }

  );
}
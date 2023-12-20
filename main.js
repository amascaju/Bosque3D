import './style.css'
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import gsap from 'gsap'

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

// VR
document.body.appendChild( VRButton.createButton( renderer ) );
renderer.xr.enabled = true;

const controller1 = renderer.xr.getController( 0 );
const controller2 = renderer.xr.getController( 1 );

function onSelectStart() {
  this.userData.isSelecting = true;
}

function onSelectEnd() {
  this.userData.isSelecting = false;
}

controller1.addEventListener( 'selectstart', onSelectStart);
controller1.addEventListener( 'selectend', onSelectEnd );
controller1.addEventListener( 'connected', function ( event ) {
    this.add( buildController( event.data ) );
} );

controller2.addEventListener( 'selectstart', onSelectStart);
controller2.addEventListener( 'selectend',  onSelectEnd);
controller2.addEventListener( 'connected', function ( event ) {
    this.add( buildController( event.data ) );
} );
controller2.addEventListener( 'disconnected', function () {
  this.remove( this.children[ 0 ] );
} );

scene.add(controller1)
scene.add(controller2)

const controllerModelFactory = new XRControllerModelFactory();

const controllerGrip1 = renderer.xr.getControllerGrip( 0 );
controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
scene.add( controllerGrip1 );

const controllerGrip2 = renderer.xr.getControllerGrip( 1 );
controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
scene.add( controllerGrip2 );

function buildController( data ) {
  let geometry, material;
  switch ( data.targetRayMode ) {

      case 'tracked-pointer':
          geometry = new THREE.BufferGeometry();
          geometry.setAttribute( 'position', 
                         new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) )
          geometry.setAttribute( 'color', 
                         new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) )
          material = new THREE.LineBasicMaterial( 
                        { 
                          vertexColors: true, 
                          blending: THREE.AdditiveBlending
                        }
           )
      return new THREE.Line( geometry, material )

      case 'gaze':

      geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate(0,0, - 1)
      material = new THREE.MeshBasicMaterial( { 
                  opacity: 0.5, 
                  transparent: true
        } )
      return new THREE.Mesh( geometry, material )
  }
}

function handleController( controller ) {
  if ( controller.userData.isSelecting ) {
  // Acció en prémer el botó de Select del controlador
  console.log('Selecting')
  }
}



// -----------------------------------------------------------------------------------------------------------------------------------  

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

// Importar model bosc
let forest = null;
ImportGLTF(
  forest,
  'Models/Forest/forest.gltf',
  new THREE.Vector3(0,0,0),
  new THREE.Vector3(1.5,1.5,1.5),
  0
);

// Importar model Deu del bosc
let godForest = null;
ImportGod();

// Importar model aranya
let spider = null;
ImportSpider();

// Importar objecte buid amb model del llop
let pareWolf = new THREE.Object3D();
let wolf = null;
let mixer = null;
let correr = null;
ImportWolf();
scene.add(pareWolf);

// Array de punts d'interes
const points = [
  {
      position: new THREE.Vector3(0, 0, 0),
      element: document.querySelector('.point-0')
  },
  {
    position: new THREE.Vector3(0, 0, 0),
    element: document.querySelector('.point-1')
  },
  {
    position: new THREE.Vector3(0, 0, 0),
    element: document.querySelector('.point-2')
  }
]
let target = new THREE.Vector3();

document.getElementById("tarantula").onclick = function() {FocusSpider()};
document.getElementById("god").onclick = function() {FocusGod()};
document.getElementById("wolf").onclick = function() {FocusWolf()};
document.getElementById("boto").onclick = function() {GoBack()};

let rotationWolf = true;
document.getElementById("wolf").addEventListener("mouseover", function(){
  correr.stop();
  rotationWolf = false
})

document.getElementById("wolf").addEventListener("mouseout", function(){
  if (!clickWolf) {
    correr.play();
    rotationWolf = true;
  }
})

let enableOrbit = true;

function FocusSpider(){
  if (spider) {
    enableOrbit = false
    document.getElementById("wolf").style.display = "none";
    document.getElementById("god").style.display = "none";
    gsap.to(camera.position,
      { duration: 3,
        x: -8.75, 
        y: 5, 
        z: -1,
        onUpdate: function() {
          camera.lookAt(new THREE.Vector3(-8.75,5,-2.1))
        },
        onComplete: function() {
          document.getElementById("textSpider").style.display = "block";
          document.getElementById("boto").style.display = "block";
        },
        ease: "expo.inOut" })
  }
}

let clickWolf = false;
function FocusGod(){
  if (godForest) {
    document.getElementById("wolf").style.display = "none";
    document.getElementById("tarantula").style.display = "none";
    enableOrbit = false
    gsap.to(camera.position,
      { duration: 3,
        x: 27, 
        y: 5.5, 
        z: 11.5,
        onUpdate: function() {
          camera.lookAt(godForest.position)
        },
        onComplete: function() {
          document.getElementById("textGod").style.display = "block";
          document.getElementById("boto").style.display = "block";
        },
        ease: "expo.inOut" })
  }
}

function FocusWolf(){
  if (wolf) {
    clickWolf = true;
    enableOrbit = false
    document.getElementById("tarantula").style.display = "none";
    document.getElementById("god").style.display = "none";
    gsap.to(camera.position,
      { duration: 3,
        x: target.x - 2, 
        y: target.y + 1, 
        z: target.z - 2,
        onUpdate: function() {
          camera.lookAt(target)
        },
        onComplete: function() {
          document.getElementById("textWolf").style.display = "block";
          document.getElementById("boto").style.display = "block";
        },
        ease: "expo.inOut" })
  }
}

function GoBack(){
  document.getElementById("textWolf").style.display = "none";
  document.getElementById("textSpider").style.display = "none";
  document.getElementById("textGod").style.display = "none";
  document.getElementById("boto").style.display = "none";
  gsap.to(camera.position,
    { duration: 3,
      x: 5, 
      y: 15, 
      z: 5,
      onUpdate: function() {
        camera.lookAt(new THREE.Vector3(0,0,0));
      },
      onComplete: function() {
        clickWolf = false;
        enableOrbit = true
        correr.play();
        rotationWolf = true;
        document.getElementById("tarantula").style.display = "block";
        document.getElementById("god").style.display = "block";
        document.getElementById("wolf").style.display = "block";
      },
      ease: "expo.inOut" })
}

let time = Date.now();
//Iniciam el bucle
AnimationLoop();

// Bucle de renderització
function AnimationLoop(){
    let thisTime = Date.now();
    let deltaTime = thisTime - time;
    time = thisTime;

    if (enableOrbit) {
      controls.enabled = true;
      controls.update();
    } else {
      controls.enabled = false;
    }

    if (wolf) {
      wolf.getWorldPosition( target );
    }
    for(const point of points) {
      if (wolf && point.element.classList.contains("point-0")) {
        point.position = target;
        point.position.y = 2;
      }
      if (spider && point.element.classList.contains("point-1")) {
        point.position = spider.position.clone()
        point.position.y = 4.4;
      }
      if (godForest && point.element.classList.contains("point-2")) {
        point.position = godForest.position.clone()
        point.position.x = 22;
        point.position.y = 5;
      }
      const screenPosition = point.position.clone()
      screenPosition.project(camera)
      const translateX = screenPosition.x * window.innerWidth * 0.5
      const translateY = - screenPosition.y * window.innerHeight * 0.5
      point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
    }

    if(mixer) {
      mixer.update(deltaTime * 0.001)
    }

    if (rotationWolf) {
      pareWolf.rotateY(deltaTime * 0.001)
    }

    handleController( controller1 );
    handleController( controller2 );

    renderer.render(scene,camera);
    renderer.setAnimationLoop(AnimationLoop);
    //requestAnimationFrame(AnimationLoop);
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
          wolf.position.set(0,0,6);
          wolf.scale.set(2,2,2);
          wolf.rotateY(Math.PI/2);
          pareWolf.add(wolf);
          //scene.add(wolf);
          mixer = new THREE.AnimationMixer(gltf.scene)
          correr = mixer.clipAction(gltf.animations[0])
          correr.play()
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

function ImportGod(){

  const loader = new GLTFLoader();

  loader.load(
      // Ruta al model
      'Models/GodOfForest/scene.gltf',
      // FUNCIONS DE CALLBACK
      function (gltf){
          // Si es carrega correctament s'afageix a l'escena.
          godForest = gltf.scene;
          godForest.position.set(18,-0.2,5);
          godForest.scale.set(1,1,1);
          scene.add(godForest);
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

function ImportSpider(){

  const loader = new GLTFLoader();

  loader.load(
      // Ruta al model
      'Models/Spider/scene.gltf',
      // FUNCIONS DE CALLBACK
      function (gltf){
          // Si es carrega correctament s'afageix a l'escena.
          spider = gltf.scene;
          spider.position.set(-8.75,5,-2.1);
          spider.scale.set(20,20,20);
          spider.rotateX(Math.PI/2);
          scene.add(spider);
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
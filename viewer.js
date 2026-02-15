import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

export function initViewer(containerId, objPath, mtlPath) {
  /*********************
  * CONTAINER BEHAVIOR *
  *********************/

  const container = document.getElementById(containerId);
  if (!container) return;


  /**************
  * SCENE SETUP *
  **************/

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    10000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);


  /********************
  * CONTROLS BEHAVIOR *
  ********************/

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;


  /****************************
  * CAMERA FITTING BEHAVIOR   *
  ****************************/

  function fitCameraToObject(model, offset = 1.5) {
    const boundingBox = new THREE.Box3().setFromObject(model);
    const modelSize = boundingBox.getSize(new THREE.Vector3());
    const modelCenter = boundingBox.getCenter(new THREE.Vector3());

    const maxSize = Math.max(modelSize.x, modelSize.y, modelSize.z);

    const fovRadians = camera.fov * (Math.PI / 175);
    const containerAspect = container.clientWidth / container.clientHeight;

    let cameraDistance = maxSize / (2 * Math.tan(fovRadians / 2));

    if (modelSize.x / containerAspect > modelSize.y) {
      cameraDistance = (modelSize.x / containerAspect) / (2 * Math.tan(fovRadians / 2));
    }

    cameraDistance *= offset;

    camera.position.set(modelCenter.x, modelCenter.y, modelCenter.z + cameraDistance);

    camera.far = cameraDistance * 10;
    camera.updateProjectionMatrix();

    controls.target.copy(modelCenter);
    controls.minDistance = cameraDistance * 0.3;
    controls.maxDistance = cameraDistance * 5;
    controls.update();
  }


  /****************************
  * MATERIAL / EDGES BEHAVIOR *
  ****************************/

  function stylizeMesh(mesh) {
    const meshMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

    const styledMaterials = meshMaterials.map((material) => {
      const materialColor = material && material.color
        ? material.color.clone()
        : new THREE.Color(0x1a1a1a);

      return new THREE.MeshBasicMaterial({
        color: materialColor,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });
    });

    mesh.material = styledMaterials.length === 1 ? styledMaterials[0] : styledMaterials;

    const baseColor = styledMaterials[0].color;
    const colorBrightness = (baseColor.r + baseColor.g + baseColor.b) / 3;

    const edgeColor = colorBrightness < 0.3 ? 0x4a5568 : 0x000000;
    const edgeOpacity = colorBrightness < 0.3 ? 0.7 : 0.5;

    const edgeGeometry = new THREE.EdgesGeometry(mesh.geometry, 30);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: edgeColor,
      transparent: true,
      opacity: edgeOpacity,
    });

    const edgeSegments = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    mesh.add(edgeSegments);
  }


  /*************************
  * MODEL LOADING BEHAVIOR *
  *************************/

  function centerModelAtOrigin(model) {
    const boundingBox = new THREE.Box3().setFromObject(model);
    const modelCenter = boundingBox.getCenter(new THREE.Vector3());
    model.position.sub(modelCenter);
  }

  function loadModel() {
    const mtlLoader = new MTLLoader();

    mtlLoader.load(mtlPath, (mtlMaterials) => {
      mtlMaterials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(mtlMaterials);

      objLoader.load(objPath, (model) => {
        centerModelAtOrigin(model);

        model.traverse((child) => {
          if (child && child.isMesh) {
            stylizeMesh(child);
          }
        });

        scene.add(model);
        fitCameraToObject(model, 1.3);
      });
    });
  }

  loadModel();


  /*********************
  * ANIMATION BEHAVIOR *
  *********************/

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();


  /**********************
  * RESPONSIVE BEHAVIOR *
  **********************/

  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

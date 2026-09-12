const canvas = document.getElementById('renderCanvas');
const statusText = document.getElementById('status');
const cameraButton = document.getElementById('cameraButton');
const cameraFeed = document.getElementById('cameraFeed');
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, alpha: true });
const models = { Shiba: 'Shiba.glb', Island: 'Island.glb', Solar_System_Animated_Rigged: 'Solar_System_Animated_Rigged.glb' };
const requested = new URLSearchParams(location.search).get('model');
const file = models[requested] || models.Shiba;

async function createScene() {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
  const camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.4, 3, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene).intensity = 1.5;

  const result = await BABYLON.SceneLoader.ImportMeshAsync('', './', file, scene);
  const root = new BABYLON.TransformNode('placementRoot', scene);
  result.meshes.filter((mesh) => !mesh.parent).forEach((mesh) => { mesh.parent = root; });
  const bounds = root.getHierarchyBoundingVectors(true);
  const size = bounds.max.subtract(bounds.min);
  root.scaling.setAll(1 / Math.max(size.x, size.y, size.z, 1));
  root.position.y = -bounds.min.y * root.scaling.y;
  statusText.textContent = `${file.replace('.glb', '').replaceAll('_', ' ')} · preview ready`;

  if (!navigator.xr) {
    statusText.textContent = 'Ready · camera overlay available';
    return scene;
  }

  try {
    const xr = await scene.createDefaultXRExperienceAsync({
      uiOptions: { sessionMode: 'immersive-ar', referenceSpaceType: 'local-floor' },
      optionalFeatures: true
    });
    const hitTest = xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRHitTest.Name, 'latest');
    let hitPosition = null;
    hitTest.onHitTestResultObservable.add((results) => {
      if (!results.length) return;
      hitPosition = results[0].position;
      statusText.textContent = 'Surface found — tap to place';
    });
    scene.onPointerDown = () => {
      if (!hitPosition || xr.baseExperience.state !== BABYLON.WebXRState.IN_XR) return;
      root.position.copyFrom(hitPosition);
      statusText.textContent = 'Placed — move around the model';
    };
  } catch (error) {
    statusText.textContent = 'Ready · camera overlay available';
  }
  return scene;
}

createScene().then((scene) => engine.runRenderLoop(() => scene.render())).catch(() => {
  statusText.textContent = 'The model could not be loaded';
});
window.addEventListener('resize', () => engine.resize());

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    statusText.textContent = 'Camera access requires HTTPS and a supported browser';
    return;
  }

  cameraButton.disabled = true;
  statusText.textContent = 'Requesting camera permission…';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: 'environment' } }
    });
    cameraFeed.srcObject = stream;
    await cameraFeed.play();
    document.body.classList.add('camera-running');
    cameraButton.textContent = 'Camera on';
    statusText.textContent = 'Live camera · drag or pinch the model';
  } catch (error) {
    cameraButton.disabled = false;
    statusText.textContent = error.name === 'NotAllowedError'
      ? 'Camera blocked — allow camera access in browser settings'
      : 'Camera could not be started';
  }
}

cameraButton.addEventListener('click', startCamera);
window.addEventListener('pagehide', () => {
  cameraFeed.srcObject?.getTracks().forEach((track) => track.stop());
});

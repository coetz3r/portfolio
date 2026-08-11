// =============================================================================
// MODULE IMPORTS (Required for ES Modules with Import Maps)
// =============================================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function initmagnMotr() {
  const container = document.getElementById("container3D");

  if (!container) {
    setTimeout(initmagnMotr, 100);
    return;
  }

  if (container.querySelector("canvas")) return;

  const width = container.clientWidth || 600;
  const height = container.clientHeight || 500;

  // =============================================================================
  // 1. SCENE & GLOBAL STATE
  // =============================================================================
  const scene = new THREE.Scene();

  let object;
  let rotor;
  const pistons = [];

  let mainAngle = 0;
  
  // DYNAMIC SIMULATION VARIABLES
  let currentAngularVelocity = 0.01; // Starting rotational speed
  let magneticStrength = 1.0;        // Push force slider value (0.0 to 2.0)
  let shaftLoad = 0.3;               // Load resistance slider value (0.0 to 2.0)
  const ROTOR_INERTIA = 0.85;        // Resistance to acceleration change

  const STROKE_LENGTH = 65;// PISTON POSITION
  const BASE_SAFETY_GAP = 65;
  const PHASE_OFFSET = Math.PI / 2;

  // Ground Grid
  const gridHelper = new THREE.GridHelper(30, 30, 0x00ffcc, 0x444444);
  gridHelper.position.y = -5;
  scene.add(gridHelper);

  // Camera & Renderer
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 5000);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  const frontLight = new THREE.DirectionalLight(0xffffff, 2.0);
  frontLight.position.set(100, 100, 100);
  scene.add(frontLight);

  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }

  // =============================================================================
  // 2. UI CONTROL PANEL OVERLAY (Shaft Load & Magnetic Strength)
  // =============================================================================
  const controlsPanel = document.createElement("div");
  controlsPanel.style.position = "absolute";
  controlsPanel.style.bottom = "0px";
  controlsPanel.style.right = "0px";
  controlsPanel.style.background = "rgba(10, 15, 25, 0.85)";
  controlsPanel.style.backdropFilter = "blur(8px)";
  controlsPanel.style.border = "1px solid rgba(0, 136, 255, 0.3)";
  controlsPanel.style.padding = "10px 14px";
  controlsPanel.style.borderRadius = "8px";
  controlsPanel.style.color = "#ffffff";
  controlsPanel.style.fontFamily = "'Montserrat', sans-serif";
  controlsPanel.style.fontSize = "10px";
  controlsPanel.style.zIndex = "50";
  controlsPanel.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
  controlsPanel.style.width = "220px";

  controlsPanel.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px; color: #0088ff; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Motor Dynamics</div>
    
    <label style="display: flex; justify-content: space-between; margin-bottom: 4px;">
      <span>Magnetic Force:</span>
      <span id="magVal" style="color: #1d27b9;">1.0x</span>
    </label>
    <input type="range" id="magSlider" min="0" max="2" step="0.05" value="1.0" style="width: 100%; margin-bottom: 10px; accent-color: #0088ff; cursor: pointer;">
    
    <label style="display: flex; justify-content: space-between; margin-bottom: 4px;">
      <span>Shaft Load:</span>
      <span id="loadVal" style="color: #ff5555;">0.3x</span>
    </label>
    <input type="range" id="loadSlider" min="0" max="2" step="0.05" value="0.3" style="width: 100%; margin-bottom: 10px; accent-color: #ff5555; cursor: pointer;">
    
    <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; margin-top: 4px;">
      <span>Shaft Velocity:</span>
      <span id="speedVal" style="font-weight: bold; color: #ffffff;">0 RPM</span>
    </div>
  `;

  container.appendChild(controlsPanel);

  // Control Listeners
  const magSlider = controlsPanel.querySelector("#magSlider");
  const loadSlider = controlsPanel.querySelector("#loadSlider");
  const magVal = controlsPanel.querySelector("#magVal");
  const loadVal = controlsPanel.querySelector("#loadVal");
  const speedVal = controlsPanel.querySelector("#speedVal");

  magSlider.addEventListener("input", (e) => {
    magneticStrength = parseFloat(e.target.value);
    magVal.innerText = magneticStrength.toFixed(1) + "x";
  });

  loadSlider.addEventListener("input", (e) => {
    shaftLoad = parseFloat(e.target.value);
    loadVal.innerText = shaftLoad.toFixed(1) + "x";
  });

  // =============================================================================
  // 3. GLTF ASSET LOADING & PROGRESS BAR
  // =============================================================================
  const progressBarTrack = document.createElement("div");
  progressBarTrack.style.position = "absolute";
  progressBarTrack.style.top = "50%";
  progressBarTrack.style.left = "50%";
  progressBarTrack.style.transform = "translate(-50%, -50%)";
  progressBarTrack.style.width = "220px";
  progressBarTrack.style.height = "6px";
  progressBarTrack.style.background = "rgba(255, 255, 255, 0.12)";
  progressBarTrack.style.borderRadius = "3px";
  progressBarTrack.style.overflow = "hidden";
  progressBarTrack.style.zIndex = "100";

  const progressBarFill = document.createElement("div");
  progressBarFill.style.width = "0%";
  progressBarFill.style.height = "100%";
  progressBarFill.style.background = "#0088ff";
  progressBarFill.style.boxShadow = "0 0 8px #0088ff";
  progressBarFill.style.borderRadius = "3px";
  progressBarFill.style.transition = "width 0.15s ease-out";

  progressBarTrack.appendChild(progressBarFill);
  container.appendChild(progressBarTrack);

  const loader = new GLTFLoader();
  const modelPath = (typeof magnaData !== "undefined" && magnaData.modelUrl)
    ? magnaData.modelUrl
    : "assets/models/magn_Motr.glb";

  console.log("magnMotr loading model from:", modelPath);

  loader.load(
    modelPath,
    function (gltf) {
      console.log("magnMotr: GLTF loaded successfully!", gltf);
      progressBarTrack.remove();

      object = gltf.scene;
      scene.add(object);

      const outerHousingTerms = ["frame", "block", "carrier", "output"];

      object.traverse((child) => {
        if (child.isMesh) {
          const meshName = child.name.toLowerCase();
          const isHousing = outerHousingTerms.some((term) => meshName.includes(term));

          if (isHousing) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => {
              mat.transparent = true;
              mat.opacity = 0.35;
              mat.depthWrite = false;
            });
          } else {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => {
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.depthWrite = true;
            });
          }
        }
      });

      rotor = object.getObjectByName("Rotor") || object.getObjectByName("rotor");

      pistons.length = 0;
      object.traverse((child) => {
        const cName = child.name.toLowerCase();
        if (cName.includes("piston") && !cName.includes("block") && !cName.includes("mag")) {
          pistons.push({
            mesh: child,
            baseZ: child.position.z
          });
        }
      });

      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      object.position.x -= center.x;
      object.position.y -= center.y;
      object.position.z -= center.z;

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let distance = Math.abs((maxDim / 2) / Math.tan(fov / 2)) * 1.35;

      // Angled startup camera position
      camera.position.set(distance * 0.9, maxDim * 0.4, distance);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();
    },
    function (xhr) {
      if (xhr.lengthComputable && xhr.total > 0) {
        const percent = Math.round((xhr.loaded / xhr.total) * 100);
        progressBarFill.style.width = percent + "%";
      } else {
        progressBarFill.style.width = "100%";
      }
    },
    function (error) {
      console.error("magnMotr GLTF Load Error:", error);
      progressBarTrack.remove();

      const errDiv = document.createElement("div");
      errDiv.style.position = "absolute";
      errDiv.style.top = "15px";
      errDiv.style.left = "15px";
      errDiv.style.color = "#ff4444";
      errDiv.style.fontFamily = "monospace";
      errDiv.style.fontSize = "12px";
      errDiv.style.background = "rgba(0, 0, 0, 0.9)";
      errDiv.style.padding = "10px 14px";
      errDiv.style.borderRadius = "4px";
      errDiv.style.zIndex = "999";
      errDiv.style.border = "1px solid #ff4444";
      errDiv.innerHTML = `<strong>magnMotr Error:</strong> Cannot load 3D file.<br>Path: <code>${modelPath}</code>`;
      container.appendChild(errDiv);
    }
  );

  // =============================================================================
  // 4. DYNAMIC PHYSICS & ANIMATION LOOP
  // =============================================================================
  function animate() {
    requestAnimationFrame(animate);

    if (rotor) {
      // 1. Net Torque calculation: (Magnetic Push Force - Shaft Resistance)
      const targetSpeed = Math.max(0, (magneticStrength * 0.05) - (shaftLoad * 0.035));

      // 2. Smoothly accelerate/decelerate velocity based on rotational inertia
      currentAngularVelocity += (targetSpeed - currentAngularVelocity) * (1 - ROTOR_INERTIA);

      // Stop subtle drift when stalled
      if (currentAngularVelocity < 0.0001) currentAngularVelocity = 0;

      // 3. Increment Rotor & Cam angle derived from dynamic speed
      mainAngle += currentAngularVelocity;
      rotor.rotation.z = mainAngle;

      // 4. Update Pistons sliding against Cam profile
      pistons.forEach((pistonObj, index) => {
        const pairPhase = (index % 2 === 0) ? 0 : Math.PI;
        const pushFactor = 0.5 + 0.5 * Math.sin((mainAngle * 2) + pairPhase + PHASE_OFFSET);
        pistonObj.mesh.position.z = pistonObj.baseZ + BASE_SAFETY_GAP - (pushFactor * STROKE_LENGTH);
      });

      // 5. Update UI speed readout (Simulated RPM display)
      const rpm = Math.round(currentAngularVelocity * 950);
      speedVal.innerText = `${rpm} RPM`;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  // Container Resize Handler
  const resizeObserver = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  resizeObserver.observe(container);

  animate();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initmagnMotr);
} else {
  initmagnMotr();
}
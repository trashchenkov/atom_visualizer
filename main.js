import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import TWEEN from '@tweenjs/tween.js';

// --- DATA ---
const elements = {
    Hydrogen: { p: 1, n: 0, electrons: [1] },
    Helium: { p: 2, n: 2, electrons: [2] },
    Lithium: { p: 3, n: 4, electrons: [2, 1] },
    Beryllium: { p: 4, n: 5, electrons: [2, 2] },
    Boron: { p: 5, n: 6, electrons: [2, 3] },
    Carbon: { p: 6, n: 6, electrons: [2, 4] },
    Nitrogen: { p: 7, n: 7, electrons: [2, 5] },
    Oxygen: { p: 8, n: 8, electrons: [2, 6] },
    Fluorine: { p: 9, n: 10, electrons: [2, 7] },
    Neon: { p: 10, n: 10, electrons: [2, 8] },
};

// --- SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05050a);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25;
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 3;
controls.maxDistance = 60;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.2;

// --- POST-PROCESSING (BLOOM) ---
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 1.8;
bloomPass.radius = 0.6;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// --- LIGHTING ---
scene.add(new THREE.AmbientLight(0xffffff, 0.1));
const dirLight = new THREE.DirectionalLight(0x90caff, 0.8);
dirLight.position.set(10, 10, 10);
scene.add(dirLight);
const backLight = new THREE.DirectionalLight(0xff80c0, 0.4);
backLight.position.set(-10, -5, -10);
scene.add(backLight);

// --- MATERIALS & GEOMETRIES (reusable) ---
const protonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const neutronGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const electronGeometry = new THREE.SphereGeometry(0.2, 16, 16);

const protonMaterial = new THREE.MeshStandardMaterial({
    color: 0xff8855, emissive: 0xff6622, emissiveIntensity: 0.5,
    metalness: 0.3, roughness: 0.3,
});
const neutronMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc, metalness: 0.2, roughness: 0.4,
});
const electronMaterial = new THREE.MeshStandardMaterial({
    color: 0x55aaff, emissive: 0x0088ff, emissiveIntensity: 2,
    metalness: 0.5, roughness: 0.2,
});
const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0x446688, transparent: true, opacity: 0.25
});

// --- ATOM MANAGEMENT ---
let currentAtom = new THREE.Group();
scene.add(currentAtom);

function updateInfoPanel(elementName) {
    const data = elements[elementName];
    const totalElectrons = data.electrons.reduce((a, b) => a + b, 0);
    document.getElementById('info-name').textContent = elementName;
    document.getElementById('info-atomic-number').textContent = data.p;
    document.getElementById('info-protons').textContent = data.p;
    document.getElementById('info-neutrons').textContent = data.n;
    document.getElementById('info-electrons').textContent = totalElectrons;
}

function transitionAtom(newElementName) {
    const oldAtom = currentAtom;
    const transitionOutProps = { scale: 1, opacity: 1 };

    new TWEEN.Tween(transitionOutProps)
        .to({ scale: 0.1, opacity: 0 }, 500)
        .easing(TWEEN.Easing.Back.In)
        .onUpdate(() => {
            oldAtom.scale.set(transitionOutProps.scale, transitionOutProps.scale, transitionOutProps.scale);
            oldAtom.traverse(child => {
                if (child.material) child.material.opacity = transitionOutProps.opacity;
            });
        })
        .onComplete(() => {
            oldAtom.traverse(child => {
                if (child.isMesh || child.isLine) {
                    child.geometry.dispose();
                    if (child.material.isMaterial) child.material.dispose();
                }
            });
            scene.remove(oldAtom);
        })
        .start();

    setTimeout(() => {
        createAtom(newElementName);
    }, 250);
}

function createAtom(elementName) {
    const elementData = elements[elementName];
    if (!elementData) return;

    updateInfoPanel(elementName);
    currentAtom = new THREE.Group();
    scene.add(currentAtom);

    // Nucleus
    const nucleus = new THREE.Group();
    for (let i = 0; i < elementData.p; i++) nucleus.add(new THREE.Mesh(protonGeometry, protonMaterial.clone()));
    for (let i = 0; i < elementData.n; i++) nucleus.add(new THREE.Mesh(neutronGeometry, neutronMaterial.clone()));
    nucleus.children.forEach(p => p.position.random().subScalar(0.5).multiplyScalar(elementData.p * 0.2));
    currentAtom.add(nucleus);

    // Electrons and Orbits
    const baseRadius = 4;
    const radiusSpacing = 3;
    elementData.electrons.forEach((eCount, shellIdx) => {
        const radiusX = baseRadius + shellIdx * radiusSpacing;
        const radiusY = radiusX * (0.8 + Math.random() * 0.1);
        const curve = new THREE.EllipseCurve(0, 0, radiusX, radiusY, 0, 2 * Math.PI, false, 0);
        const orbitGeom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(128));
        const orbit = new THREE.Line(orbitGeom, orbitMaterial.clone());
        orbit.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        currentAtom.add(orbit);

        for (let i = 0; i < eCount; i++) {
            const electron = new THREE.Mesh(electronGeometry, electronMaterial.clone());
            electron.userData = {
                curve,
                progress: Math.random(),
                speed: (0.8 / (shellIdx + 1)) * 0.5
            };
            orbit.add(electron);
        }
    });

    // Animate In
    currentAtom.scale.set(0.1, 0.1, 0.1);
    currentAtom.traverse(c => { if(c.material) c.material.opacity = 0; });
    new TWEEN.Tween({ scale: 0.1, opacity: 0 })
        .to({ scale: 1, opacity: 1 }, 500)
        .easing(TWEEN.Easing.Back.Out)
        .onUpdate(p => {
            currentAtom.scale.set(p.scale, p.scale, p.scale);
            currentAtom.traverse(c => {
                if (c.material) c.material.opacity = (c.parent.isLine) ? p.opacity * 0.25 : p.opacity;
            });
        })
        .start();
}

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    TWEEN.update();
    controls.update();

    currentAtom.traverse(child => {
        if (child.userData.curve) { // is electron
            const { curve, speed } = child.userData;
            child.userData.progress = (child.userData.progress + delta * speed) % 1;
            const point = curve.getPoint(child.userData.progress);
            child.position.set(point.x, point.y, 0);
            const pulse = Math.sin(elapsedTime * 8 + child.userData.progress * 20) * 0.1 + 0.9;
            child.scale.set(pulse, pulse, pulse);
        } else if (child.parent && child.parent.isGroup && child.children.length > 0) { // is nucleus
            child.rotation.y += 0.005;
        }
    });
    composer.render();
}

// --- UI & EVENTS ---
const elementSelector = document.getElementById('element-select');
Object.keys(elements).forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    elementSelector.appendChild(option);
});
elementSelector.addEventListener('change', (e) => transitionAtom(e.target.value));
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// --- INITIALIZATION ---
elementSelector.value = 'Helium';
createAtom('Helium');
animate();
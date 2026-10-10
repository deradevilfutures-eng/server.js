
import * as THREE from "three";

// ========================================
// 1. SETUP SCENE 3D
// ========================================

const container = document.getElementById("coffee-scene");

let renderer;
let scene;
let camera;
let cupGroup;
let steamParticles;
let steamData = [];
let animationFrame;
let disposed = false;

const clock = new THREE.Clock();
const pointer = new THREE.Vector2();
const targetRotation = new THREE.Vector2();

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

try {
    init3D();
    animate();
} catch (error) {
    console.error("3D scene tidak dapat dimulai:", error);
    showFallback();
}

function init3D() {
    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(
        38,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );

    camera.position.set(0, 2.5, 7.6);
    camera.lookAt(0, 1.45, 0);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "default"
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.75)
    );

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.appendChild(renderer.domElement);

    // Pencahayaan ambient
    const ambient = new THREE.HemisphereLight(
        0xffe4c4,
        0x24130c,
        2.0
    );
    scene.add(ambient);

    // Lampu utama
    const keyLight = new THREE.DirectionalLight(0xffe1b5, 3.2);
    keyLight.position.set(3, 6, 5);
    scene.add(keyLight);

    // Lampu samping untuk highlight
    const rimLight = new THREE.PointLight(0xc78b54, 32, 12);
    rimLight.position.set(-3, 3.8, -2);
    scene.add(rimLight);

    // Lampu lembut dari depan
    const fillLight = new THREE.PointLight(0xffd8ad, 12, 10);
    fillLight.position.set(0, 2.5, 4);
    scene.add(fillLight);

    createCoffeeCup();
    createGround();
    createSteam();

    window.addEventListener("resize", resizeScene);
    container.addEventListener("pointermove", onPointerMove);

    // Menyembunyikan loading screen setelah scene siap
    requestAnimationFrame(() => {
        document.getElementById("loader").classList.add("done");
    });
}

// ========================================
// 2. MATERIAL
// ========================================

function standardMaterial(color, roughness = 0.35, metalness = 0) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness
    });
}

// ========================================
// 3. MODEL CANGKIR KOPI
// ========================================

function createCoffeeCup() {
    cupGroup = new THREE.Group();
    scene.add(cupGroup);

    const porcelain = standardMaterial(
        0xe9d8bd,
        0.2,
        0.05
    );

    const darkCoffee = standardMaterial(
        0x28130b,
        0.19
    );

    const cremaMaterial = standardMaterial(
        0x9c5428,
        0.25
    );

    const goldMaterial = standardMaterial(
        0xc99a59,
        0.23,
        0.65
    );

    // Piring kopi
    const saucer = new THREE.Mesh(
        new THREE.CylinderGeometry(1.17, 1.24, 0.13, 96),
        porcelain
    );

    saucer.position.y = 0.32;
    saucer.scale.z = 0.84;
    cupGroup.add(saucer);

    // Garis emas di tepi piring
    const saucerRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.03, 0.018, 10, 96),
        goldMaterial
    );

    saucerRing.rotation.x = Math.PI / 2;
    saucerRing.position.y = 0.395;
    saucerRing.scale.set(1, 0.84, 1);
    cupGroup.add(saucerRing);

    // Profil cangkir: bagian luar, bibir, dan dinding dalam.
    const profile = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.51, 0),
        new THREE.Vector2(0.63, 0.10),
        new THREE.Vector2(0.79, 1.38),
        new THREE.Vector2(0.81, 1.46),
        new THREE.Vector2(0.75, 1.46),
        new THREE.Vector2(0.70, 1.36),
        new THREE.Vector2(0.56, 0.19),
        new THREE.Vector2(0, 0.19)
    ];

    const cupGeometry = new THREE.LatheGeometry(
        profile,
        96
    );

    const cup = new THREE.Mesh(cupGeometry, porcelain);
    cup.position.y = 0.40;
    cupGroup.add(cup);

    // Bibir cangkir
    const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.78, 0.035, 16, 96),
        porcelain
    );

    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.86;
    cupGroup.add(rim);

    // Permukaan kopi
    const coffeeSurface = new THREE.Mesh(
        new THREE.CircleGeometry(0.695, 96),
        darkCoffee
    );

    coffeeSurface.rotation.x = -Math.PI / 2;
    coffeeSurface.position.y = 1.805;
    cupGroup.add(coffeeSurface);

    // Cincin crema di permukaan kopi
    const cremaRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.53, 0.035, 12, 80),
        cremaMaterial
    );

    cremaRing.rotation.x = Math.PI / 2;
    cremaRing.position.y = 1.814;
    cupGroup.add(cremaRing);

    // Pola crema kecil
    const cremaSpot = new THREE.Mesh(
        new THREE.CircleGeometry(0.20, 48),
        cremaMaterial
    );

    cremaSpot.rotation.x = -Math.PI / 2;
    cremaSpot.position.set(-0.15, 1.816, 0.10);
    cupGroup.add(cremaSpot);

    // Gagang cangkir
    const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.39, 0.105, 24, 72),
        porcelain
    );

    handle.position.set(0.92, 1.17, 0);
    handle.scale.set(1, 1.12, 0.85);
    cupGroup.add(handle);

    // Sambungan gagang
    const jointTop = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 24, 24),
        porcelain
    );

    jointTop.position.set(0.81, 1.43, 0);
    cupGroup.add(jointTop);

    const jointBottom = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 24, 24),
        porcelain
    );

    jointBottom.position.set(0.69, 0.91, 0);
    cupGroup.add(jointBottom);

    // Detail dekoratif berupa garis emas
    const cupBand = new THREE.Mesh(
        new THREE.TorusGeometry(0.68, 0.014, 8, 80),
        goldMaterial
    );

    cupBand.rotation.x = Math.PI / 2;
    cupBand.position.y = 1.25;
    cupGroup.add(cupBand);

    cupGroup.position.y = -0.05;
    cupGroup.rotation.y = -0.35;
}

// ========================================
// 4. LANTAI DAN BAYANGAN VISUAL
// ========================================

function createGround() {
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x211914,
        roughness: 0.78,
        metalness: 0
    });

    const ground = new THREE.Mesh(
        new THREE.CircleGeometry(2.2, 96),
        groundMaterial
    );

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.20;
    ground.scale.set(1, 0.8, 1);

    // Transparansi agar lantai menyatu dengan background.
    ground.material.transparent = true;
    ground.material.opacity = 0.45;

    scene.add(ground);

    // Halo dekoratif di belakang cangkir
    const haloMaterial = new THREE.MeshBasicMaterial({
        color: 0x8c5837,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const halo = new THREE.Mesh(
        new THREE.RingGeometry(1.65, 1.68, 96),
        haloMaterial
    );

    halo.position.set(0, 1.4, -0.8);
    scene.add(halo);
}

// ========================================
// 5. PARTIKEL UAP KOPI
// ========================================

function createSteam() {
    const count = 28;
    const positions = new Float32Array(count * 3);

    steamData = [];

    for (let i = 0; i < count; i++) {
        steamData.push({
            x: (Math.random() - 0.5) * 0.65,
            y: 1.9 + Math.random() * 1.7,
            z: (Math.random() - 0.5) * 0.25,
            speed: 0.25 + Math.random() * 0.35,
            phase: Math.random() * Math.PI * 2
        });

        positions[i * 3] = steamData[i].x;
        positions[i * 3 + 1] = steamData[i].y;
        positions[i * 3 + 2] = steamData[i].z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
        color: 0xe9c6a3,
        size: 0.045,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    steamParticles = new THREE.Points(geometry, material);
    scene.add(steamParticles);
}

function updateSteam(time, delta) {
    if (!steamParticles) return;

    const positions = steamParticles.geometry.attributes.position;

    steamData.forEach((particle, i) => {
        particle.y += particle.speed * delta;

        if (particle.y > 4.2) {
            particle.y = 1.85;
            particle.x = (Math.random() - 0.5) * 0.55;
        }

        positions.setXYZ(
            i,
            particle.x + Math.sin(time * 1.2 + particle.phase) * 0.12,
            particle.y,
            particle.z
        );
    });

    positions.needsUpdate = true;
}

// ========================================
// 6. INTERAKSI MOUSE DAN ANIMASI
// ========================================

function onPointerMove(event) {
    const rect = container.getBoundingClientRect();

    pointer.x = (
        (event.clientX - rect.left) / rect.width
    ) * 2 - 1;

    pointer.y = -(
        (event.clientY - rect.top) / rect.height
    ) * 2 + 1;

    targetRotation.x = pointer.y * 0.15;
    targetRotation.y = pointer.x * 0.35;
}

function animate() {
    if (disposed) return;

    animationFrame = requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;

    if (cupGroup) {
        if (!reducedMotion) {
            cupGroup.rotation.y +=
                (targetRotation.y - cupGroup.rotation.y) *
                Math.min(delta * 2, 1);

            cupGroup.rotation.x +=
                (targetRotation.x - cupGroup.rotation.x) *
                Math.min(delta * 2, 1);

            cupGroup.position.y =
                -0.05 + Math.sin(time * 1.2) * 0.07;
        } else {
            cupGroup.rotation.y = targetRotation.y;
            cupGroup.rotation.x = targetRotation.x;
        }
    }

    updateSteam(time, delta);

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function resizeScene() {
    if (!renderer || !camera) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function showFallback() {
    container.innerHTML = `
        <div style="
            display:grid;
            place-items:center;
            height:100%;
            color:#c99a69;
            text-align:center;
            font-family:serif;
            line-height:2;
        ">
            <div>
                <div style="font-size:80px">☕</div>
                <p>YOUR COFFEE EXPERIENCE</p>
                <small style="color:#a79a8b">
                    Aktifkan WebGL dan periksa koneksi internet.
                </small>
            </div>
        </div>
    `;

    document.getElementById("loader").classList.add("done");
}

// Bersihkan animasi jika halaman ditinggalkan.
window.addEventListener("pagehide", () => {
    disposed = true;
    cancelAnimationFrame(animationFrame);

    if (renderer) {
        renderer.dispose();
    }
});

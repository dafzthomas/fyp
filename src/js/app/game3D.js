let scene;
let camera;
let controls;
let direction;
let clock;
let delta;
let renderer;
let effect;
let ambientLight;
let light;
let hemiLight;
let stats;
let axes;
let webVR = false;
let particleSystem;
let particleCount = 20000;
let particles;
let pMaterial;

const goFullscreen = document.querySelector('#fullscreen');
const goCardboard = document.querySelector('#cardboard');

let meshFloor;

const settings = {
    wireframe: false,
    clearColour: 0xa7e9ff
};

const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;

const keyboard = {};
const player = {
    x: 55,
    y: 10,
    height: 1.8,
    speed: 0.2,
    turnSpeed: Math.PI * 0.02
};

const loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 0.1, 1000),
    box: new THREE.Mesh(
        new THREE.BoxGeometry(.5, .5, .5),
        new THREE.MeshBasicMaterial({
            color: 0x4444ff
        })
    )
};

let LOADING_MANAGER = null;
let RESOURCES_LOADED = false;

const models = {
    tent: {
        obj: "/images/models/forest/Tent_Poles_01.obj",
        mtl: "/images/models/forest/Tent_Poles_01.mtl",
        mesh: null
    },
    campfire: {
        obj: "/images/models/forest/Campfire_01.obj",
        mtl: "/images/models/forest/Campfire_01.mtl",
        mesh: null
    },
    tree_01: {
        obj: "/images/models/forest/Tree_01.obj",
        mtl: "/images/models/forest/Tree_01.mtl",
        mesh: null
    }
};

// Meshes Index
const meshes = {}

function init() {
    game.GameType = '3D';
    scene = new THREE.Scene();
    clock = new THREE.Clock();
    camera = new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 0.1, 50);
    stats = new Stats();
    axes = new THREE.AxisHelper(100);
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    renderer.setClearColor(settings.clearColour, 1);

    scene.add(axes);

    // Setup particles for snow
    particles = new THREE.Geometry();
    pMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.2,
        blending: THREE.AdditiveBlending,
        transparent: true
    });


    // Loading Screen 
    loadingScreen.box.position.set(0, 0, 5);
    loadingScreen.camera.lookAt(loadingScreen.box.position);
    loadingScreen.scene.add(loadingScreen.box);

    LOADING_MANAGER = new THREE.LoadingManager();

    LOADING_MANAGER.onLoad = () => {
        console.log("Loaded all resources");
        RESOURCES_LOADED = true;
        onResourcesLoaded();
    };



    // Lighting 
    ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    light = new THREE.PointLight(0xffffff, 1.5, 100);

    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;
    scene.add(light);

    // Load in all defined models 
    loadModels();


    camera.position.set(55, player.height, 10);
    camera.lookAt(new THREE.Vector3(50, player.height, 20));


    scene.fog = new THREE.Fog(settings.clearColour, 0.1, 30);


    document.body.appendChild(renderer.domElement);

    controls = new DeviceOrientationController(camera, renderer.domElement);

    controls.enableManualDrag = false;

    controls.enableManualZoom = false;
    controls.connect();

    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);


    renderer.domElement.addEventListener('touchstart', (e) => {
        if (e.touches.length < 2) {
            keyboard[87] = true;
        }
    });

    renderer.domElement.addEventListener('touchend', (e) => {
        keyboard[87] = false;
    });


    snowParticles(particleCount);

    animate();
}

function snowParticles() {
    // now create the individual particles
    for (let p = 0; p < particleCount; p++) {

        // create a particle with random
        // position values, -250 -> 250
        let pX = Math.random() * 200,
            pY = Math.random() * 50,
            pZ = Math.random() * 200,
            particle = new THREE.Vector3(pX, pY, pZ);

        // create a velocity vector
        particle.velocity = new THREE.Vector3(
            0, // x
            -Math.random(), // y: random vel
            0); // z

        // add it to the geometry
        particles.vertices.push(particle);
    }

    // create the particle system
    particleSystem = new THREE.Points(
        particles,
        pMaterial);

    particleSystem.sortParticles = true;


    // add it to the scene
    scene.add(particleSystem);

}

// Runs when resources are loaded
function onResourcesLoaded() {
    // Floor 
    meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 0, 0),
        new THREE.MeshPhongMaterial({
            color: 0x27ae60,
            wireframe: settings.wireframe
        })
    );
    meshFloor.position.set(50, 0, 50);
    meshFloor.rotation.x -= Math.PI / 2;
    meshFloor.receiveShadow = true;
    scene.add(meshFloor);

    // Clone models into the meshes index
    meshes["tent1"] = models.tent.mesh.clone();
    meshes["campfire1"] = models.campfire.mesh.clone();

    // Reposition individual meshes, then add them to the scene
    meshes["tent1"].position.set(50, 0, 15);
    scene.add(meshes["tent1"]);

    meshes["campfire1"].position.set(50, 0, 12);
    scene.add(meshes["campfire1"]);

    for (let i = 1; i < 50; i++) {
        let scale = Math.floor(Math.random() * 6) + 1;

        let percentage = (scale / 6) + .5 ;

        meshes["tree1"] = models.tree_01.mesh.clone();
        meshes["tree1"].position.set(Math.floor(Math.random() * 100), percentage, Math.floor(Math.random() * 100));
        meshes["tree1"].rotation.y = Math.floor(Math.random() * 100);
        meshes["tree1"].scale.set(scale, scale, scale);
        scene.add(meshes["tree1"]);
    }
}

function animate() {
    stats.begin();

    delta = clock.getDelta();
    direction = camera.getWorldDirection();

    for (const item in direction) {
        direction[item] = direction[item] * (player.speed * 2);
    }

    if (!RESOURCES_LOADED) {
        requestAnimationFrame(animate);

        loadingScreen.box.position.x += 0.05;
        if (loadingScreen.box.position.x > WIDTH) loadingScreen.box.position.x = 0;
        loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);

        renderer.render(loadingScreen.scene, loadingScreen.camera);
        return;
    }

    var pCount = particleCount;
    while (pCount--) {
        var particle = particles.vertices[pCount];

        particle.y -= 0.1;
        if (particle.y < 0) {
            particle.y = 50;
        }
    }
    particleSystem.geometry.verticesNeedUpdate = true;


    keyboardControls(delta);

    camera.position.y = player.height;

    // Player position
    if (camera.position.x > 100) {
        camera.position.x = 100;
    }
    if (camera.position.x < 0) {
        camera.position.x = 0;
    }
    if (camera.position.z > 100) {
        camera.position.z = 100;
    }
    if (camera.position.z < 0) {
        camera.position.z = 0;
    }

    controls.update(delta);

    light.position.set(camera.position.x, 10, camera.position.z);

    renderer.render(scene, camera);

    if (webVR) {
        effect.render(scene, camera);
    }

    stats.end();

    requestAnimationFrame(animate);
}

function adapt(fps) {
    if (fps < 58) {
        
    } else {
        
    }
}

function keyboardControls(delta) {
    if (keyboard[87]) { // W Key
        if (isTouch()) {
            camera.position.add(direction);
        } else {
            camera.position.x -= (Math.sin(camera.rotation.y) * player.speed) * (delta * 100);
            camera.position.z -= (-Math.cos(camera.rotation.y) * player.speed) * (delta * 100);
        }
    }
    if (keyboard[83]) { // S Key
        camera.position.x += (Math.sin(camera.rotation.y) * player.speed) * (delta * 100);
        camera.position.z += (-Math.cos(camera.rotation.y) * player.speed) * (delta * 100);
    }
    if (keyboard[65]) { // A Key
        camera.position.x += (Math.sin(camera.rotation.y + Math.PI / 2) * player.speed) * (delta * 100);
        camera.position.z += (-Math.cos(camera.rotation.y + Math.PI / 2) * player.speed) * (delta * 100);
    }
    if (keyboard[68]) { // D Key
        camera.position.x += (Math.sin(camera.rotation.y - Math.PI / 2) * player.speed) * (delta * 100);
        camera.position.z += (-Math.cos(camera.rotation.y - Math.PI / 2) * player.speed) * (delta * 100);
    }

    // Left arrow key
    if (keyboard[37]) {
        camera.rotation.y -= player.turnSpeed * (delta * 100);
    }
    // Right arrow key
    if (keyboard[39]) {
        camera.rotation.y += player.turnSpeed * (delta * 100);
    }
}

function fullscreen() {
    console.log('fullscreen');
    if (document.body.requestFullscreen) {
        document.body.requestFullscreen();
    } else if (document.body.msRequestFullscreen) {
        document.body.msRequestFullscreen();
    } else if (document.body.mozRequestFullScreen) {
        document.body.mozRequestFullScreen();
    } else if (document.body.webkitRequestFullscreen) {
        document.body.webkitRequestFullscreen();
    }

    resize();
}

function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);

    if (webVR) {
        effect = new THREE.StereoEffect(renderer);
        effect.setSize(width, height);
    } else {
        effect = null;
    }


    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function loadModels() {
    for (const _key in models) {
        ((key => {
            const mtlLoader = new THREE.MTLLoader(LOADING_MANAGER);
            mtlLoader.load(models[key].mtl, materials => {
                materials.preload();
                const objLoader = new THREE.OBJLoader(LOADING_MANAGER);
                objLoader.setMaterials(materials);
                objLoader.load(models[key].obj, mesh => {

                    mesh.traverse(node => {
                        if (node instanceof THREE.Mesh) {
                            if ('castShadow' in models[key]) {
                                node.castShadow = models[key].castShadow;
                            } else {
                                node.castShadow = true;
                            }

                            if ('receiveShadow' in models[key]) {
                                node.receiveShadow = models[key].receiveShadow;
                            } else {
                                node.receiveShadow = true;
                            }
                        }
                    });
                    models[key].mesh = mesh;

                });
            });

        }))(_key);
    }
}

function keyDown(e) {
    keyboard[e.keyCode] = true;
}

function keyUp(e) {
    keyboard[e.keyCode] = false;
}

function isTouch(e) {
    if ("ontouchstart" in window) {
        return true;
    }

    return false;
}

goCardboard.addEventListener('click', (e) => {
    webVR = !webVR;
    resize();
}, false);

goFullscreen.addEventListener('click', fullscreen, false);
window.addEventListener('keydown', keyDown, false);
window.addEventListener('keyup', keyUp, false);
window.addEventListener('resize', resize, false);

window.onload = init;
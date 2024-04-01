import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;

const stars = [
    // { centerX: 0, centerY: 0, centerZ: 0.2, scale: 3, color: "red", rotation: 10, animation: 0.01 },
    // { centerX: 3, centerY: 3, centerZ: 0.2, scale: 3, color: "red", rotation: 10, animation: 0.01 },
]

const colors = ["red", "blue", "green", "white", "lightblue", "lightgreen"]

const customRandom = (range, isNegative) => {
    return isNegative ?
        (Math.random() * 100000000) % range * Math.pow(-1, Math.floor(Math.random() * 100000000) % 10)
        :
        (Math.random() * 100000000) % range
}

for (let i = 0; i < 500; i++) {
    const centerX = customRandom(100, true)
    const centerY = customRandom(80, true)
    const centerZ = customRandom(20, true)
    const animation = customRandom(5, true)
    const randomScale = customRandom(10, true)
    const randomIndex = Math.floor(customRandom(6, false));
    stars.push(
        { centerX: centerX, centerY: centerY, centerZ: centerZ, scale: randomScale, color: colors[randomIndex], rotation: 10, animation: 0.005 * animation, isDisableWireframe: true }
    )
}

let loader = new GLTFLoader();
let model;
loader.load(
    '/static/star.glb',
    function (gltf) {
        // To create a scene, use the Scene class:
        scene = new THREE.Scene()

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(10, 0, 10).normalize();
        dirLight.color.setHSL(0.1, 0.7, 0.5);
        scene.add(dirLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 1);
        dirLight1.position.set(0, 10, 10).normalize();
        // dirLight1.color.setHSL(0.1, 0.7, 0.5);
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 1);
        dirLight2.position.set(0, 10, -10).normalize();
        // dirLight1.color.setHSL(0.1, 0.7, 0.5);
        scene.add(dirLight2);

        // Create a Plane
        scene.add(createPlane({ x: 0, y: -10, z: -5, width: 100, height: 100, isDisableWireframe: true, color: "lightgreen", transparency: 0.5, }))

        // Get the loaded model
        model = gltf.scene;

        const models = []
        stars.forEach(star => {
            const model = createStar(star)
            models.push(model)
            scene.add(model)
        });

        // Sizes
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        // Camera
        camera = new THREE.PerspectiveCamera(120, sizes.width / sizes.height, 1, 100)
        camera.position.z = 15
        // camera.position.y = 1
        scene.add(camera)

        // scene.background = texture
        scene.background = new THREE.Color("green")


        // Canvas
        const canvas = document.querySelector('canvas.webgl')

        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(sizes.width, sizes.height)

        const controls = new OrbitControls(camera, renderer.domElement);

        // Animation
        const tick = () => {
            let cameraPosition = camera.position;
            models.forEach((model, i) => {
                // mesh.rotation.x += stars[i].animation
                // mesh.rotation.y += stars[i].animation
                // model.rotation.z += stars[i].animation
                let modelPosition = model.position;
                let distance = cameraPosition.distanceTo(modelPosition);
                let boundingBox = new THREE.Box3().setFromObject(model);
                let length = boundingBox.max.x - boundingBox.min.x;
                if (distance < length) {
                    model.visible = false
                } else {
                    model.visible = true
                }
                // console.log(length);
            });
            controls.update();
            renderer.render(scene, camera)
            window.requestAnimationFrame(tick)
        }
        tick()
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error happened', error);
    }
);

// --- 1. Create Start function 
const createStar = ({ centerX, centerY, centerZ, scale, color, rotation, animation, isDisableWireframe }) => {
    let cloneModel = model.clone();

    // Change color of the model
    cloneModel.traverse(function (child) {
        if (child.isMesh) {
            // child.material.color = newColor;
            child.material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.6,
                metalness: 0.6
            })
        }
    });

    // Scale the model
    var scaleFactor = scale; // Scale factor
    cloneModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
    cloneModel.position.set(centerX, centerY, centerZ);
    cloneModel.rotation.set(0, 0, rotation);

    // Add the model to the scene
    return cloneModel
}


//// ---  Create Plane function 
const createPlane = ({ x, y, z, width, height, isDisableWireframe, color, transparency, map }) => {
    // Create a plane geometry
    const planeGeometry = new THREE.PlaneGeometry(width, height, 32, 32); // Width, Height, Width segments, Height segments

    // Create a material
    const planeMaterial = new THREE.MeshPhongMaterial({ color: color, specular: 0xffffff, shininess: 40, side: THREE.DoubleSide, wireframe: !isDisableWireframe });

    // Create a plane mesh
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.position.x = x
    planeMesh.position.y = y
    planeMesh.position.z = z

    planeMesh.rotation.x = Math.PI / 2
    return planeMesh;
}


const onWindowResize = () => {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

window.addEventListener('resize', onWindowResize);
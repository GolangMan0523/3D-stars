import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import imageSource from './public/static/videoImg.png'


let camera, scene, renderer;

const image = new Image()
const texture = new THREE.Texture(image)

const stars = [
    { centerX: 0, centerY: 0, centerZ: 0.2, outerRadius: 1, innerRadius: 0.4, color: "red", rotation: 10, animation: 0.01 },
    // { centerX: 1.5, centerY: 1, centerZ: 0.2, outerRadius: 0.8, innerRadius: 0.4, color: "blue", rotation: 10, animation: 0.05 },
    // { centerX: -1.3, centerY: 1, centerZ: 0.2, outerRadius: 0.6, innerRadius: 0.2, color: "green", rotation: 10, animation: 0.005 },
]

const colors = ["red", "blue", "green", "white", "lightblue", "lightgreen"]

const customRandom = (range, isNegative) => {
    return isNegative ?
        (Math.random() * 100000000) % range * Math.pow(-1, Math.floor(Math.random() * 100000000) % 10)
        :
        (Math.random() * 100000000) % range
}

// for (let i = 0; i < 300; i++) {
//     const centerX = customRandom(30, true)
//     const centerY = customRandom(15, true)
//     const centerZ = customRandom(5, true)
//     const animation = customRandom(5, true)
//     const randomRadius = customRandom(10, true)
//     const randomIndex = Math.floor(customRandom(6, false));
//     stars.push(
//         { centerX: centerX, centerY: centerY, centerZ: centerZ, outerRadius: 0.1 * randomRadius, innerRadius: 0.05 * randomRadius, color: colors[randomIndex], rotation: 10, animation: 0.005 * animation, isDisableWireframe: true }
//     )
// }

image.addEventListener('load', () => {
    texture.needsUpdate = true

    // To create a scene, use the Scene class:
    scene = new THREE.Scene()

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(0, 0, 10).normalize();
    dirLight.color.setHSL(0.1, 0.7, 0.5);
    scene.add(dirLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(0, 0, -10).normalize();
    // dirLight1.color.setHSL(0.1, 0.7, 0.5);
    scene.add(dirLight1);

    const meshs = []
    stars.forEach(star => {
        const mesh = createStar(star)
        meshs.push(mesh)
        scene.add(mesh)
    });

    scene.add(createPlane({ x: 0, y: 0, z: -5, width: 50, height: 30, isDisableWireframe: true, color: "lightgreen", transparency: 0.5, map: texture, }))

    // Sizes
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    // Camera
    camera = new THREE.PerspectiveCamera(120, sizes.width / sizes.height, 1, 100)
    camera.position.z = 5
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
        meshs.forEach((mesh, i) => {
            // mesh.rotation.x += stars[i].animation
            // mesh.rotation.y += stars[i].animation
            // mesh.rotation.z += stars[i].animation
        });
        controls.update();
        renderer.render(scene, camera)
        window.requestAnimationFrame(tick)
    }
    tick()
})

image.src = imageSource

//// --- 1. Create Start function 
let colors1 = [];
const normals = [];

const createStar = ({ centerX, centerY, centerZ, outerRadius, innerRadius, color, rotation, animation, isDisableWireframe }) => {
    // Object
    const geometry = new THREE.BufferGeometry();

    // Define vertices
    let primaryVeritices = [0, 0, 0 - outerRadius / 5];
    let primaryIndies = []

    const N = 5;
    for (let i = 0; i < 2 * N; i++) {
        const radius = i % 2 ? innerRadius : outerRadius;
        const x = Math.sin(i * 2 * Math.PI / (2 * N)) * radius;
        const y = Math.cos(i * 2 * Math.PI / (2 * N)) * radius;
        const z = 0


        primaryVeritices = [...primaryVeritices, x, y, z]

        // normals.push(0, 0, 1);
        // colors1.push(i / (2 * N), i / (2 * N), 0.3)
        // console.log(i / (2 * N) , i / (2 * N) , 0)

        if (i === 2 * N - 1) {
            primaryIndies = [...primaryIndies,  0, 2 * N,1]
            // primaryIndies = [...primaryIndies, 2 * N, 2 * N + 1, 1]
        } else {
            primaryIndies = [...primaryIndies, 0, i + 1, i + 2]
            // primaryIndies = [...primaryIndies, 1, i + 2, i + 3]
        }
    }

    console.log(primaryVeritices)
    const vertices = new Float32Array(primaryVeritices);

    // Define indices that make up triangles from the vertices
    const indices = new Uint32Array(primaryIndies)

    // Add attributes to the geometry
    geometry.setIndex(new THREE.BufferAttribute(indices, 1)); // 1 value per vertex
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3)); // 3 values per vertex (x, y, z)
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    // geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors1, 3));
    geometry.computeVertexNormals();

    // const material = new THREE.MeshPhongMaterial({
    //     side: THREE.DoubleSide,
    //     vertexColors: true
    // });


    // const material = new THREE.MeshPhongMaterial({ color: color, specular: 0xffffff, shininess: 40, })
    // const material = new THREE.MeshStandardMaterial({ color: color, specular: 0xffffff, side: THREE.DoubleSide, wireframe: isDisableWireframe, shininess: 40, })
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, wireframe: !isDisableWireframe })
    const mesh = new THREE.Mesh(geometry, material)

    mesh.position.set(centerX, centerY, centerZ)
    return mesh
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
    return planeMesh;
}


const onWindowResize = () => {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

window.addEventListener('resize', onWindowResize);
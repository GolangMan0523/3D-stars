import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


// Create a basic scene
const scene = new THREE.Scene();

// Set up camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Set up renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);


// Create a plane geometry for the water
const waterGeometry = new THREE.PlaneGeometry(10, 10, 100, 100);

// Shader material to simulate water effect
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: `
    varying vec2 vUv;
    uniform float time;
    
    void main() {
      vUv = uv;
      vec3 newPosition = position;
      newPosition.z += sin((uv.x + uv.y) * 10.0 + time) * 0.1; // Create waves
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
    fragmentShader: `
    varying vec2 vUv;
    
    void main() {
      vec3 color = vec3(0.0, 0.3, 0.6) + vUv.x * 0.2; // Blueish color
      gl_FragColor = vec4(color, 1.0);
    }
  `,
    uniforms: {
        time: { value: 0 }
    }
});

const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2; // Make the plane horizontal
scene.add(water);




function animate() {
    requestAnimationFrame(animate);

    // Update time to create wave animation
    waterMaterial.uniforms.time.value += 0.05;

    controls.update();

    renderer.render(scene, camera);
}

animate();


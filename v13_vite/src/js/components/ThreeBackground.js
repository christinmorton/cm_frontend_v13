import * as THREE from 'three';
import { gsap } from 'gsap';

export class ThreeBackground {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'three-background';
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.zIndex = '0'; // Ensure it is above body background, below content (z-1)
        this.container.style.pointerEvents = 'none'; // Allow clicking through
        this.container.style.overflow = 'hidden';
        document.body.prepend(this.container);

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.lines = null;

        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;

        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color(0x000000); // Let CSS handle background color if needed, or set it here
        // We want transparent so we can layer it over a CSS gradient if desired.
        // But for "Black background as base", we can just not set it and let the canvas be transparent, 
        // relying on body background. Or set it to black.
        // Let's make it transparent for maximum flexibility.

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;
        this.camera.position.y = 10;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Particles
        this.createParticles();
    }

    createCircleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');

        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createParticles() {
        const particleCount = 150; // Adjust for density
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesPositions = new Float32Array(particleCount * 3);
        const particlesColors = new Float32Array(particleCount * 3);
        const particlesData = [];

        const baseColor = new THREE.Color(0xffffff);
        const highlightColor = new THREE.Color(0x00ff88);

        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 50;

            particlesPositions[i * 3] = x;
            particlesPositions[i * 3 + 1] = y;
            particlesPositions[i * 3 + 2] = z;

            // Randomly assign green color to ~9% of particles
            const isGreen = Math.random() < 0.09;
            const color = isGreen ? highlightColor : baseColor;

            particlesColors[i * 3] = color.r;
            particlesColors[i * 3 + 1] = color.g;
            particlesColors[i * 3 + 2] = color.b;

            particlesData.push({
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.05,
                    (Math.random() - 0.5) * 0.05,
                    (Math.random() - 0.5) * 0.05
                ),
                numConnections: 0
            });
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particlesColors, 3));

        // Material for particles
        const particlesMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            size: 1.5,
            transparent: true,
            opacity: 0.9,
            map: this.createCircleTexture(),
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
        this.particles.userData = { data: particlesData };

        // GSAP Entrance Animation
        this.particles.scale.set(0, 0, 0);
        gsap.to(this.particles.scale, {
            duration: 2,
            x: 1,
            y: 1,
            z: 1,
            ease: "elastic.out(1, 0.3)"
        });

        // Lines geometry (will be updated every frame)
        const linesGeometry = new THREE.BufferGeometry();
        const linesMaterial = new THREE.LineBasicMaterial({
            vertexColors: true, // Enable vertex colors
            transparent: true,
            opacity: 0.4,
            linewidth: 1
        });

        this.lines = new THREE.LineSegments(linesGeometry, linesMaterial);
        this.scene.add(this.lines);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.render();
    }

    render() {
        const positions = this.particles.geometry.attributes.position.array;
        const data = this.particles.userData.data;

        // Mouse interaction smoothing
        this.targetX = this.mouseX * 0.001;
        this.targetY = this.mouseY * 0.001;

        // Rotate the entire particle system slowly
        this.particles.rotation.y += 0.001;
        this.lines.rotation.y += 0.001;

        // Tilt based on mouse
        this.particles.rotation.x += 0.05 * (this.targetY - this.particles.rotation.x);
        this.particles.rotation.y += 0.05 * (this.targetX - this.particles.rotation.y);
        this.lines.rotation.x = this.particles.rotation.x;
        // this.lines.rotation.y = this.particles.rotation.y; // Already rotating y above

        // Update particle positions
        let connectionPositions = []; // Store positions for lines
        let connectionColors = []; // Store colors for lines

        for (let i = 0; i < data.length; i++) {
            const particleData = data[i];

            // Move particle
            positions[i * 3] += particleData.velocity.x;
            positions[i * 3 + 1] += particleData.velocity.y;
            positions[i * 3 + 2] += particleData.velocity.z;

            // Boundary check - wrap around
            if (positions[i * 3] < -50 || positions[i * 3] > 50) particleData.velocity.x = -particleData.velocity.x;
            if (positions[i * 3 + 1] < -50 || positions[i * 3 + 1] > 50) particleData.velocity.y = -particleData.velocity.y;
            if (positions[i * 3 + 2] < -25 || positions[i * 3 + 2] > 25) particleData.velocity.z = -particleData.velocity.z;
        }

        // Update lines
        const particleCount = data.length;
        const connectDistance = 15;

        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < connectDistance) {
                    // Add vertices for the line segment
                    connectionPositions.push(
                        positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                        positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                    );
                }
            }
        }

        this.particles.geometry.attributes.position.needsUpdate = true;

        // Update lines geometry
        this.lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(connectionPositions, 3));

        this.renderer.render(this.scene, this.camera);
    }

    addEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this));
    }

    onWindowResize() {
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onDocumentMouseMove(event) {
        this.mouseX = (event.clientX - this.windowHalfX);
        this.mouseY = (event.clientY - this.windowHalfY);
    }
}

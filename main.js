// Initialize Lucide Icons
lucide.createIcons();

// Preloader
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        gsap.to(loader, {
            opacity: 0,
            duration: 1,
            onComplete: () => loader.style.display = 'none'
        });
    }, 1000);
});

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const text = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    themeToggle.innerHTML = theme === 'dark' ? `<i data-lucide="sun"></i> <span>${text}</span>` : `<i data-lucide="moon"></i> <span>${text}</span>`;
    lucide.createIcons();
}

const savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(savedTheme);

// Audio Context for UI Sound
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playClickSound() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // Smooth bubbly pop curve
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.08);

    // Quick gain envelope
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
}

themeToggle.addEventListener('click', () => {
    playClickSound();
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// Bind sound to all other buttons and nav links
function initButtonSounds() {
    const interactives = document.querySelectorAll('button:not(#theme-toggle), .btn, .nav-links a');
    interactives.forEach(el => {
        el.addEventListener('click', () => {
            playClickSound();
        });
    });
}

// Sticky Header
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// --- Three.js Hero Scene ---
function initHero3D() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const diskTexture = textureLoader.load('gobar_texture.png');

    // Geometry - A thin cylinder for the gobar cake
    const geometry = new THREE.CylinderGeometry(2.5, 2.5, 0.4, 32);
    const material = new THREE.MeshStandardMaterial({
        map: diskTexture,
        roughness: 0.8,
        metalness: 0.1
    });

    const cake = new THREE.Mesh(geometry, material);
    cake.rotation.x = Math.PI / 2; // Lie flat
    scene.add(cake);

    camera.position.z = 6;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        cake.rotation.y += 0.005;
        cake.rotation.z += 0.002;
        renderer.render(scene, camera);
    }
    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// --- Three.js Product Cards (Simplified) ---
function initProduct3D(elementId, shape = 'round') {
    const container = document.getElementById(elementId);
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('gobar_texture.png');

    let geometry;
    if (shape === 'round') {
        geometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 32);
    } else if (shape === 'square') {
        geometry = new THREE.BoxGeometry(2.5, 0.3, 2.5);
    } else { // Premium/Chunk
        geometry = new THREE.CylinderGeometry(1.2, 1.2, 0.8, 32);
    }

    const material = new THREE.MeshStandardMaterial({ map: texture });
    const product = new THREE.Mesh(geometry, material);
    product.rotation.x = Math.PI / 2.5;
    scene.add(product);

    camera.position.z = 4;

    function animate() {
        requestAnimationFrame(animate);
        product.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

// --- GSAP Animations ---
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Fade up animations for sections
    const fadeUpElements = document.querySelectorAll('[data-scroll-fade-up]');
    fadeUpElements.forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });
    });

    // Hero content entrance
    gsap.from('.hero-content', {
        x: -100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out"
    });

    gsap.from('#canvas-container', {
        scale: 0.5,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out"
    });

    // Timeline entrance
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 90%",
            },
            x: index % 2 === 0 ? -50 : 50,
            opacity: 0,
            duration: 1,
            ease: "back.out(1.7)"
        });
    });

    // Testimonial slider (basic mockup with GSAP)
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    if (testimonialCards.length > 0) {
        gsap.from('.testimonial-slider', {
            scrollTrigger: {
                trigger: '.testimonial-slider',
                start: "top 85%",
            },
            opacity: 0,
            scale: 0.9,
            duration: 1.5,
            ease: "expo.out"
        });
    }

    // Benefits icon floating
    const benefitsVisual = document.querySelector('.benefits-visual');
    if (benefitsVisual) {
        const icons = ['zap', 'clock', 'wind', 'smile', 'earth'];
        icons.forEach((icon, i) => {
            const div = document.createElement('div');
            div.className = 'floating-icon';
            div.innerHTML = `<i data-lucide="${icon}"></i>`;
            div.style.cssText = `
                position: absolute;
                left: ${20 + Math.random() * 60}%;
                top: ${20 + Math.random() * 60}%;
                padding: 1.5rem;
                background: white;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                color: var(--leaf-green);
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            benefitsVisual.appendChild(div);

            gsap.to(div, {
                y: "random(-40, 40)",
                x: "random(-40, 40)",
                rotation: "random(-15, 15)",
                duration: "random(3, 5)",
                repeat: -1,
                yoyo: true,
                delay: i * 0.5,
                ease: "sine.inOut"
            });
        });
        lucide.createIcons();
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initHero3D();
    initProduct3D('p1-canvas', 'round');
    initProduct3D('p2-canvas', 'square');
    initProduct3D('p3-canvas', 'premium');
    initGSAP();
    initButtonSounds();
});

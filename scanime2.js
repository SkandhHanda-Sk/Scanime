class Particle {
    constructor(x, y, totalWidth, totalHeight, color, size) {
        // Initial/Target position (where it snaps back to)
        this.initialX = x;
        this.initialY = y;
        // Current position starts randomized (Scatter state)
        this.currentX = anime.random(0, totalWidth);
        this.currentY = anime.random(0, totalHeight);
        this.color = color;
        this.size = size;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.currentX, this.currentY, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- Class Definition for Reusability ---
class ParticleCardEffect {
    constructor(container, canvas, content, color) {
        this.container = container;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.content = content;
        this.PARTICLE_COLOR = color;
        this.particles = [];
        this.currentAnimation = null;
        this.idleAnimation = null;
        this.IDLE_DURATION = 3500;
        
        this.PARTICLE_SIZE = 3; 
        this.GAP = 10;
        
        this.initCanvas();
        this.addEventListeners();
        this.startIdleAnimation();
    }

    
    initCanvas() {
        // Set canvas dimensions to match container
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
        
        this.particles = [];
        
        const cols = Math.floor(this.canvas.width / this.GAP);
        const rows = Math.floor(this.canvas.height / this.GAP);
        
        const startX = (this.canvas.width - cols * this.GAP) / 2 + this.GAP / 2;
        const startY = (this.canvas.height - rows * this.GAP) / 2 + this.GAP / 2;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = startX + i * this.GAP;
                const y = startY + j * this.GAP;
                // Correctly instantiate the global Particle class, passing color and size
                this.particles.push(new Particle(x, y, this.canvas.width, this.canvas.height, this.PARTICLE_COLOR, this.PARTICLE_SIZE));
            }
        }
        
        this.content.style.opacity = 0;
    }

    // --- Animation & Control Functions ---
    
    runIdleCycle = () => {
        if (this.idleAnimation) this.idleAnimation.pause(); 

        this.idleAnimation = anime({
            targets: this.particles,
            currentX: (p) => p.initialX + anime.random(-10, 10),
            currentY: (p) => p.initialY + anime.random(-10, 10),
            size: this.PARTICLE_SIZE,
            
            duration: this.IDLE_DURATION,
            easing: 'easeInOutSine',
            
            // Recursive call using a bound function
            complete: this.runIdleCycle.bind(this)
        });
    }

    startIdleAnimation() {
        // Prevent starting if already playing (safety check)
        if (!this.idleAnimation || this.idleAnimation.paused) {
            this.runIdleCycle();
        }
    }

    stopIdleAnimation() {
        if (this.idleAnimation) {
            this.idleAnimation.pause();
        }
    }

    showCard = () => {
        this.stopIdleAnimation(); 
        if (this.currentAnimation) this.currentAnimation.pause();

        const CENTER_X = this.canvas.width / 2;
        const CENTER_Y = this.canvas.height / 2;

        // Phase 1: Merge Particles to Center
        this.currentAnimation = anime({
            targets: this.particles,
            currentX: CENTER_X,
            currentY: CENTER_Y,
            size: this.PARTICLE_SIZE * 2,
            color: '#ffffff',
            
            duration: 500,
            easing: 'easeInCubic',
            delay: anime.stagger(1),

            // Phase 2 starts immediately after merge is complete
            complete: () => {
                // Fade in the content
                anime({ targets: this.content, opacity: 1, duration: 800 });

                // Animate particles outward to grid (Collapse/Disappear)
                anime({
                    targets: this.particles,
                    currentX: (p) => p.initialX,
                    currentY: (p) => p.initialY,
                    size: 0, 
                    color: this.PARTICLE_COLOR,
                    
                    delay: anime.stagger(0.5, { from: 'center', grid: [20, 10] }),
                    duration: 700,
                    easing: 'easeOutCubic',
                });
            }
        });
    }

    hideCard = () => {
        if (this.currentAnimation) this.currentAnimation.pause();
        
        // Fade out the content
        anime({ targets: this.content, opacity: 0, duration: 500, delay: 500 });

        // Animate particles outward (Dissolve/Explosion)
        this.currentAnimation = anime({
            targets: this.particles,
            currentX: () => anime.random(0, this.canvas.width),
            currentY: () => anime.random(0, this.canvas.height),
            size: this.PARTICLE_SIZE,

            delay: anime.stagger(2, { grid: [20, 10], from: 'center' }),
            duration: 1500,
            easing: 'easeInOutQuart',
            
            complete: this.startIdleAnimation.bind(this)
        });
    }

    // --- Rendering for Global Loop ---
    drawFrame() {
        // Clear the frame for this canvas instance
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); 
        
        // Apply a global filter for a subtle glow effect (unique to each particle color)
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.PARTICLE_COLOR;

        // Draw all particles for this instance
        this.particles.forEach(p => p.draw(this.ctx));
    }

    addEventListeners() {
        this.container.addEventListener('mouseenter', this.showCard);
        this.container.addEventListener('mouseleave', this.hideCard);
        // Bind initCanvas to 'this' instance on resize
        window.addEventListener('resize', this.initCanvas.bind(this));
    }
}

// --- Global Initialization and Render Loop ---

const cardInstances = [];
let globalAnimationRunning = false;

function initializeAllCards() {
    const wrappers = document.querySelectorAll('.card-wrapper');
    
    // Clear previous instances on resize/re-init
    cardInstances.length = 0; 
    
    wrappers.forEach(wrapper => {
        const canvas = wrapper.querySelector('.particle-canvas');
        const content = wrapper.querySelector('.card-content');
        const color = wrapper.dataset.color || '#ff88ff';
        
        // Create a new instance for each card
        const instance = new ParticleCardEffect(wrapper, canvas, content, color);
        cardInstances.push(instance);
    });
    
    // Start the single global render loop
    if (!globalAnimationRunning) {
        globalAnimationRunning = true;
        globalRenderLoop();
    }
}

// Single loop to manage rendering for all cards
function globalRenderLoop() {
    if (!globalAnimationRunning) return;
    
    cardInstances.forEach(instance => {
        instance.drawFrame();
    });

    requestAnimationFrame(globalRenderLoop);
}

// --- Global Controller Object ---
// This object will be exposed on the window to be controlled by scanime.js
window.particleEffectsController = {
    pauseAll: () => {
        globalAnimationRunning = false;
        cardInstances.forEach(instance => instance.stopIdleAnimation());
    },
    resumeAll: () => {
        if (!globalAnimationRunning) {
            globalAnimationRunning = true;
            globalRenderLoop();
            cardInstances.forEach(instance => instance.startIdleAnimation());
        }
    }
};

// Start everything when the DOM is ready
// We will now call this from scanime.js after the splash screen is gone
// to ensure the elements are visible and have dimensions.
window.startParticleEffects = initializeAllCards;

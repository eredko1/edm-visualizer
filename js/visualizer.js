class Visualizer {
    constructor() {
        this.canvas = document.getElementById('visualizer');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.analyser = new Tone.Analyser('waveform', 1024);
        this.mouseX = 0;
        this.mouseY = 0;
        this.colorScheme = 'neon';
        this.vizType = 'particles';
        this.particleCount = 500;
        this.vizSpeed = 1;

        this.setupCanvas();
        this.setupEventListeners();
        this.createParticles();
        this.animate();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        document.getElementById('vizType').addEventListener('change', (e) => {
            this.vizType = e.target.value;
        });

        document.getElementById('colorScheme').addEventListener('change', (e) => {
            this.colorScheme = e.target.value;
            this.updateParticleColors();
        });

        document.getElementById('particleCount').addEventListener('input', (e) => {
            this.particleCount = parseInt(e.target.value);
            this.createParticles();
        });

        document.getElementById('vizSpeed').addEventListener('input', (e) => {
            this.vizSpeed = parseFloat(e.target.value);
        });
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                color: this.getRandomColor()
            });
        }
    }

    getRandomColor() {
        const schemes = {
            neon: [
                '#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#00ff00'
            ],
            pastel: [
                '#ffb3ba', '#baffc9', '#bae1ff', '#ffffba', '#ffdfba'
            ],
            monochrome: [
                '#ffffff', '#cccccc', '#999999', '#666666', '#333333'
            ],
            rainbow: [
                '#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'
            ]
        };
        const colors = schemes[this.colorScheme];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateParticleColors() {
        this.particles.forEach(particle => {
            particle.color = this.getRandomColor();
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX * this.vizSpeed;
            particle.y += particle.speedY * this.vizSpeed;

            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();

            // Draw connection lines
            this.particles.forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = particle.color;
                    this.ctx.globalAlpha = 1 - (distance / 100);
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                    this.ctx.globalAlpha = 1;
                }
            });
        });
    }

    drawWaves() {
        const waveform = this.analyser.getValue();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        
        for (let i = 0; i < waveform.length; i++) {
            const x = (i / waveform.length) * this.canvas.width;
            const y = (waveform[i] * this.canvas.height / 2) + this.canvas.height / 2;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.strokeStyle = this.getRandomColor();
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawSpectrum() {
        const spectrum = this.analyser.getValue();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const barWidth = this.canvas.width / spectrum.length;
        
        for (let i = 0; i < spectrum.length; i++) {
            const x = i * barWidth;
            const height = (spectrum[i] + 140) * 2;
            
            this.ctx.fillStyle = this.getRandomColor();
            this.ctx.fillRect(x, this.canvas.height - height, barWidth, height);
        }
    }

    drawCircular() {
        const spectrum = this.analyser.getValue();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        
        this.ctx.beginPath();
        for (let i = 0; i < spectrum.length; i++) {
            const angle = (i / spectrum.length) * Math.PI * 2;
            const r = radius * (1 + spectrum[i] * 0.5);
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.closePath();
        this.ctx.strokeStyle = this.getRandomColor();
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        switch(this.vizType) {
            case 'particles':
                this.drawParticles();
                break;
            case 'waves':
                this.drawWaves();
                break;
            case 'spectrum':
                this.drawSpectrum();
                break;
            case 'circular':
                this.drawCircular();
                break;
        }
    }
} 
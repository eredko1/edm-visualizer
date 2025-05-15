class Visualizer {
    constructor() {
        this.canvas = document.getElementById('visualizer');
        this.ctx = this.canvas.getContext('2d');
        this.analyser = new Tone.Analyser('waveform', 1024);
        this.resizeCanvas();
        
        this.particles = [];
        this.maxParticles = 500;
        this.particleCount = 500;
        this.vizType = 'particles';
        this.colorScheme = 'neon';
        this.vizSpeed = 1;
        
        this.colors = {
            neon: ['#00ff88', '#00ffff', '#ff00ff', '#ffff00'],
            pastel: ['#ffb3ba', '#baffc9', '#bae1ff', '#ffffba'],
            monochrome: ['#ffffff', '#cccccc', '#999999', '#666666'],
            rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
        };
        
        this.initializeParticles();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initializeParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 5 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                color: this.getRandomColor()
            });
        }
    }

    getRandomColor() {
        const scheme = this.colors[this.colorScheme];
        return scheme[Math.floor(Math.random() * scheme.length)];
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const waveform = this.analyser.getValue();
        
        switch(this.vizType) {
            case 'particles':
                this.drawParticles(waveform);
                break;
            case 'waves':
                this.drawWaves(waveform);
                break;
            case 'spectrum':
                this.drawSpectrum(waveform);
                break;
            case 'circular':
                this.drawCircular(waveform);
                break;
            case 'matrix':
                this.drawMatrix(waveform);
                break;
            case 'vortex':
                this.drawVortex(waveform);
                break;
        }
        
        requestAnimationFrame(() => this.animate());
    }

    drawParticles(waveform) {
        this.particles.forEach((particle, i) => {
            const waveValue = waveform[i % waveform.length];
            
            particle.x += particle.speedX * this.vizSpeed;
            particle.y += particle.speedY * this.vizSpeed;
            
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * (1 + Math.abs(waveValue)), 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        });
    }

    drawWaves(waveform) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        
        for (let i = 0; i < waveform.length; i++) {
            const x = (i / waveform.length) * this.canvas.width;
            const y = (waveform[i] * this.canvas.height / 2) + this.canvas.height / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.strokeStyle = this.getRandomColor();
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawSpectrum(waveform) {
        const barWidth = this.canvas.width / waveform.length;
        
        waveform.forEach((value, i) => {
            const x = i * barWidth;
            const height = Math.abs(value) * this.canvas.height;
            const y = this.canvas.height - height;
            
            this.ctx.fillStyle = this.getRandomColor();
            this.ctx.fillRect(x, y, barWidth - 1, height);
        });
    }

    drawCircular(waveform) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        
        this.ctx.beginPath();
        waveform.forEach((value, i) => {
            const angle = (i / waveform.length) * Math.PI * 2;
            const r = radius * (1 + value);
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.closePath();
        this.ctx.strokeStyle = this.getRandomColor();
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawMatrix(waveform) {
        const cellSize = 20;
        const cols = Math.floor(this.canvas.width / cellSize);
        const rows = Math.floor(this.canvas.height / cellSize);
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const value = waveform[(i + j) % waveform.length];
                const size = cellSize * (1 + Math.abs(value));
                
                this.ctx.fillStyle = this.getRandomColor();
                this.ctx.fillRect(
                    i * cellSize - size/2 + cellSize/2,
                    j * cellSize - size/2 + cellSize/2,
                    size,
                    size
                );
            }
        }
    }

    drawVortex(waveform) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) * 0.8;
        
        for (let i = 0; i < waveform.length; i++) {
            const angle = (i / waveform.length) * Math.PI * 2;
            const value = waveform[i];
            const radius = maxRadius * (0.2 + Math.abs(value) * 0.8);
            
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle + 0.1) * radius;
            const y2 = centerY + Math.sin(angle + 0.1) * radius;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = this.getRandomColor();
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    updateParticleCount(count) {
        this.particleCount = count;
        this.initializeParticles();
    }

    updateVisualizationType(type) {
        this.vizType = type;
    }

    updateColorScheme(scheme) {
        this.colorScheme = scheme;
        this.particles.forEach(particle => {
            particle.color = this.getRandomColor();
        });
    }

    updateVisualizationSpeed(speed) {
        this.vizSpeed = speed;
    }
} 
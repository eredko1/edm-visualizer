class Visualizer {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.analyser = new Tone.Analyser('waveform', 1024);
        this.particles = [];
        this.maxParticles = 100;
        this.particleCount = 50;
        this.vizType = 'particles';
        this.colorScheme = 'neon';
        this.vizSpeed = 1;
        this.lastTime = 0;
        this.frameCount = 0;
        
        this.colors = {
            neon: ['#00ff88', '#00ffff', '#ff00ff', '#ffff00'],
            pastel: ['#ffb3ba', '#baffc9', '#bae1ff', '#ffffba'],
            monochrome: ['#ffffff', '#cccccc', '#999999', '#666666'],
            rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
        };
        
        this.resizeCanvas();
        this.initializeParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);
    }
    
    initializeParticles() {
        this.particles = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 5 + 2,
                speedX: (Math.random() - 0.5) * 4,
                speedY: (Math.random() - 0.5) * 4,
                color: this.getRandomColor()
            });
        }
    }
    
    getRandomColor() {
        const scheme = this.colors[this.colorScheme];
        return scheme[Math.floor(Math.random() * scheme.length)];
    }
    
    animate(currentTime = 0) {
        requestAnimationFrame((time) => this.animate(time));
        
        // Limit frame rate for better performance
        if (currentTime - this.lastTime < 1000 / 60) return;
        this.lastTime = currentTime;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const waveform = this.analyser.getValue();
        
        switch (this.vizType) {
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
    }
    
    drawParticles(waveform) {
        const average = waveform.reduce((a, b) => a + Math.abs(b), 0) / waveform.length;
        
        this.particles.forEach(particle => {
            particle.x += particle.speedX * this.vizSpeed;
            particle.y += particle.speedY * this.vizSpeed;
            
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            const size = particle.size * (1 + average * 2);
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        });
    }
    
    drawWaves(waveform) {
        const centerY = this.canvas.height / 2;
        const sliceWidth = this.canvas.width / waveform.length;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY);
        
        for (let i = 0; i < waveform.length; i++) {
            const x = i * sliceWidth;
            const y = centerY + waveform[i] * centerY * 0.8;
            
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
        
        for (let i = 0; i < waveform.length; i++) {
            const x = i * barWidth;
            const height = Math.abs(waveform[i]) * this.canvas.height;
            
            this.ctx.fillStyle = this.getRandomColor();
            this.ctx.fillRect(x, this.canvas.height - height, barWidth, height);
        }
    }
    
    drawCircular(waveform) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        
        this.ctx.beginPath();
        
        for (let i = 0; i < waveform.length; i++) {
            const angle = (i / waveform.length) * Math.PI * 2;
            const r = radius * (1 + waveform[i] * 0.5);
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
    
    drawMatrix(waveform) {
        const cols = 20;
        const rows = 10;
        const cellWidth = this.canvas.width / cols;
        const cellHeight = this.canvas.height / rows;
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const index = Math.floor((i * rows + j) / (cols * rows) * waveform.length);
                const value = Math.abs(waveform[index]);
                
                this.ctx.fillStyle = `rgba(0, 255, 136, ${value})`;
                this.ctx.fillRect(
                    i * cellWidth,
                    j * cellHeight,
                    cellWidth - 2,
                    cellHeight - 2
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
            const radius = (i / waveform.length) * maxRadius;
            const value = Math.abs(waveform[i]);
            
            const x = centerX + Math.cos(angle + this.frameCount * 0.02) * radius;
            const y = centerY + Math.sin(angle + this.frameCount * 0.02) * radius;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, value * 5, 0, Math.PI * 2);
            this.ctx.fillStyle = this.getRandomColor();
            this.ctx.fill();
        }
        
        this.frameCount++;
    }
    
    updateParticleCount(count) {
        this.particleCount = Math.min(count, this.maxParticles);
        this.initializeParticles();
    }
    
    updateVisualizationType(type) {
        this.vizType = type;
    }
    
    updateColorScheme(scheme) {
        this.colorScheme = scheme;
    }
    
    updateVisualizationSpeed(speed) {
        this.vizSpeed = speed;
    }
} 
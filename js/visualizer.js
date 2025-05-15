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
        this.fractalParams = {
            iterations: 100,
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            colorOffset: 0
        };
        
        this.tunnelParams = {
            segments: 20,
            rotationSpeed: 0.01,
            depth: 1000,
            colorOffset: 0
        };
        
        this.colors = {
            neon: ['#00ff88', '#00ffff', '#ff00ff', '#ffff00'],
            pastel: ['#ffb3ba', '#baffc9', '#bae1ff', '#ffffba'],
            monochrome: ['#ffffff', '#cccccc', '#999999', '#666666'],
            rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
            dj: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
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
    
    animate() {
        const now = performance.now();
        const deltaTime = now - this.lastTime;
        this.lastTime = now;
        
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
            case 'mandelbrot':
                this.drawMandelbrot(waveform);
                break;
            case 'julia':
                this.drawJulia(waveform);
                break;
            case 'lighttunnel':
                this.drawLightTunnel(waveform);
                break;
        }
        
        this.frameCount++;
        requestAnimationFrame(() => this.animate());
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
    
    drawMandelbrot(waveform) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = Math.min(centerX, centerY) * this.fractalParams.zoom;
        
        const average = waveform.reduce((a, b) => a + Math.abs(b), 0) / waveform.length;
        const iterations = Math.floor(this.fractalParams.iterations * (1 + average));
        
        for (let x = 0; x < this.canvas.width; x += 2) {
            for (let y = 0; y < this.canvas.height; y += 2) {
                let zx = (x - centerX) / scale + this.fractalParams.offsetX;
                let zy = (y - centerY) / scale + this.fractalParams.offsetY;
                let i = 0;
                
                while (zx * zx + zy * zy < 4 && i < iterations) {
                    const xtemp = zx * zx - zy * zy;
                    zy = 2 * zx * zy;
                    zx = xtemp;
                    i++;
                }
                
                if (i < iterations) {
                    const hue = (i / iterations) * 360 + this.fractalParams.colorOffset;
                    this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                    this.ctx.fillRect(x, y, 2, 2);
                }
            }
        }
        
        // Update fractal parameters based on audio
        this.fractalParams.zoom = 1 + average * 0.5;
        this.fractalParams.offsetX = Math.sin(this.frameCount * 0.03) * 0.5;
        this.fractalParams.offsetY = Math.cos(this.frameCount * 0.03) * 0.5;
        this.fractalParams.colorOffset = (this.fractalParams.colorOffset + 1) % 360;
    }
    
    drawJulia(waveform) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = Math.min(centerX, centerY) * this.fractalParams.zoom;
        
        const average = waveform.reduce((a, b) => a + Math.abs(b), 0) / waveform.length;
        const iterations = Math.floor(this.fractalParams.iterations * (1 + average));
        
        // Julia set parameters that change with audio
        const cReal = Math.sin(this.frameCount * 0.01) * 0.4;
        const cImag = Math.cos(this.frameCount * 0.01) * 0.4;
        
        for (let x = 0; x < this.canvas.width; x += 2) {
            for (let y = 0; y < this.canvas.height; y += 2) {
                let zx = (x - centerX) / scale + this.fractalParams.offsetX;
                let zy = (y - centerY) / scale + this.fractalParams.offsetY;
                let i = 0;
                
                while (zx * zx + zy * zy < 4 && i < iterations) {
                    const xtemp = zx * zx - zy * zy;
                    zy = 2 * zx * zy + cImag;
                    zx = xtemp + cReal;
                    i++;
                }
                
                if (i < iterations) {
                    const hue = (i / iterations) * 360 + this.fractalParams.colorOffset;
                    this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                    this.ctx.fillRect(x, y, 2, 2);
                }
            }
        }
        
        // Update fractal parameters based on audio
        this.fractalParams.zoom = 1 + average * 0.5;
        this.fractalParams.offsetX = Math.sin(this.frameCount * 0.03) * 0.5;
        this.fractalParams.offsetY = Math.cos(this.frameCount * 0.03) * 0.5;
        this.fractalParams.colorOffset = (this.fractalParams.colorOffset + 1) % 360;
    }
    
    drawLightTunnel(waveform) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY);
        
        const average = waveform.reduce((a, b) => a + Math.abs(b), 0) / waveform.length;
        const segments = this.tunnelParams.segments;
        const rotationSpeed = this.tunnelParams.rotationSpeed * (1 + average);
        
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2 + this.frameCount * rotationSpeed;
            const radius = maxRadius * (1 - i / segments) * (1 + average * 0.2);
            
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle + Math.PI * 2 / segments) * radius;
            const y2 = centerY + Math.sin(angle + Math.PI * 2 / segments) * radius;
            
            // Create gradient for tunnel segments
            const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
            const hue = (i / segments * 360 + this.tunnelParams.colorOffset) % 360;
            gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.8)`);
            gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0.2)`);
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineTo(centerX, centerY);
            this.ctx.closePath();
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
        
        // Update tunnel parameters
        this.tunnelParams.colorOffset = (this.tunnelParams.colorOffset + 2) % 360;
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
    
    updateFractalParams(params) {
        this.fractalParams = { ...this.fractalParams, ...params };
    }
    
    updateTunnelParams(params) {
        this.tunnelParams = { ...this.tunnelParams, ...params };
    }
} 
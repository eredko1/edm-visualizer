document.addEventListener('DOMContentLoaded', () => {
    let audioEngine = null;
    let visualizer = null;
    let isInitializing = false;
    
    async function initAudio() {
        if (isInitializing) return;
        isInitializing = true;
        
        try {
            // Show loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.innerHTML = '<div class="loading">Initializing audio...</div>';
            }
            
            // Create and initialize audio engine
            audioEngine = new AudioEngine();
            await audioEngine.initializeAudio();
            
            // Initialize visualizer after audio engine is ready
            if (audioEngine.initialized) {
                visualizer = new Visualizer();
                await visualizer.initialize();
                
                // Connect audio engine to visualizer
                if (audioEngine.mixer && visualizer.analyser) {
                    audioEngine.mixer.connect(visualizer.analyser);
                }
                
                // Remove loading indicator
                if (loadingIndicator) {
                    loadingIndicator.remove();
                }
                
                // Enable controls
                const controls = document.getElementById('controls');
                if (controls) {
                    controls.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error initializing audio:', error);
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.innerHTML = `
                    <div class="error-message">
                        Error initializing audio: ${error.message}
                        <button onclick="retryInitialization()">Retry</button>
                    </div>
                `;
            }
        } finally {
            isInitializing = false;
        }
    }

    function retryInitialization() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.innerHTML = '<div class="loading">Initializing audio...</div>';
        }
        initAudio();
    }

    // Initialize on user interaction
    function initOnInteraction(e) {
        e.preventDefault();
        if (!audioEngine || !audioEngine.initialized) {
            initAudio();
        }
    }

    // Add event listeners for user interaction
    document.addEventListener('click', initOnInteraction, { once: true });
    document.addEventListener('touchstart', initOnInteraction, { once: true });

    // Mouse and touch event handlers with error handling
    function handleMouseMove(e) {
        if (!audioEngine?.initialized || !audioEngine?.synths?.basic) return;
        
        try {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Map mouse position to musical parameters
            const note = Math.floor((x / canvas.width) * 24) + 48; // C3 to C5
            const velocity = 1 - (y / canvas.height);
            
            // Update synth parameters
            if (audioEngine.synths.basic) {
                audioEngine.synths.basic.volume.value = Tone.gainToDb(velocity);
                audioEngine.playNote(note, velocity);
            }
        } catch (error) {
            console.error('Error in mouse move handler:', error);
        }
    }

    function handleTouchMove(e) {
        if (!audioEngine?.initialized || !audioEngine?.synths?.basic) return;
        
        try {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Map touch position to musical parameters
            const note = Math.floor((x / canvas.width) * 24) + 48;
            const velocity = 1 - (y / canvas.height);
            
            // Update synth parameters
            if (audioEngine.synths.basic) {
                audioEngine.synths.basic.volume.value = Tone.gainToDb(velocity);
                audioEngine.playNote(note, velocity);
            }
        } catch (error) {
            console.error('Error in touch move handler:', error);
        }
    }

    function handleMouseUp() {
        if (!audioEngine?.initialized) return;
        try {
            audioEngine.stopNote();
        } catch (error) {
            console.error('Error in mouse up handler:', error);
        }
    }

    function handleTouchEnd() {
        if (!audioEngine?.initialized) return;
        try {
            audioEngine.stopNote();
        } catch (error) {
            console.error('Error in touch end handler:', error);
        }
    }

    // Add event listeners with error handling
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchend', handleTouchEnd);

    // Handle window resize
    window.addEventListener('resize', () => {
        if (visualizer) {
            visualizer.resizeCanvas();
        }
    });

    // Start with first pattern
    const firstPatternBtn = document.querySelector('.pattern-btn');
    if (firstPatternBtn) {
        firstPatternBtn.classList.add('active');
        currentPattern = firstPatternBtn.dataset.pattern;
    }
});

// Initialize controls
function initializeControls() {
    // Main controls toggle
    const toggleControls = document.querySelector('.toggle-controls');
    const controlsPanel = document.querySelector('.controls-panel');
    
    if (toggleControls && controlsPanel) {
        toggleControls.addEventListener('click', () => {
            controlsPanel.classList.toggle('collapsed');
            const icon = toggleControls.querySelector('i');
            icon.classList.toggle('fa-chevron-up');
            icon.classList.toggle('fa-chevron-down');
        });
    }
    
    // Section toggles
    const sectionToggles = document.querySelectorAll('.toggle-section');
    sectionToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const section = toggle.closest('.control-section');
            const content = section.querySelector('.section-content');
            const icon = toggle.querySelector('i');
            
            content.classList.toggle('collapsed');
            icon.classList.toggle('rotated');
        });
    });
    
    // Initialize all sliders and controls
    initializeSliders();
    initializeSelects();
}

// Initialize sliders
function initializeSliders() {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        // Set initial value display
        const valueDisplay = slider.nextElementSibling;
        if (valueDisplay && valueDisplay.classList.contains('bpm-value')) {
            valueDisplay.textContent = slider.value;
        }
        
        // Add change event listener
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Update value display if exists
            if (valueDisplay && valueDisplay.classList.contains('bpm-value')) {
                valueDisplay.textContent = value;
            }
            
            // Handle different slider types
            switch(slider.id) {
                case 'bpm':
                    updateBPM(value);
                    break;
                case 'beatVolume':
                    updateBeatVolume(value);
                    break;
                case 'attack':
                case 'decay':
                case 'sustain':
                case 'release':
                    updateSynthEnvelope(slider.id, value);
                    break;
                case 'reverb':
                case 'delay':
                case 'distortion':
                    updateEffect(slider.id, value);
                    break;
                case 'filterCutoff':
                    updateFilter(value);
                    break;
                case 'particleCount':
                    updateParticleCount(value);
                    break;
                case 'vizSpeed':
                    updateVisualizationSpeed(value);
                    break;
            }
        });
    });
}

// Initialize select dropdowns
function initializeSelects() {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', (e) => {
            const value = e.target.value;
            
            switch(select.id) {
                case 'synthType':
                    updateSynthType(value);
                    break;
                case 'vizType':
                    updateVisualizationType(value);
                    break;
                case 'colorScheme':
                    updateColorScheme(value);
                    break;
            }
        });
    });
}

// Initialize help panel
function initializeHelpPanel() {
    const helpToggle = document.querySelector('.help-toggle');
    const helpContent = document.querySelector('.help-content');
    
    if (helpToggle && helpContent) {
        helpToggle.addEventListener('click', () => {
            helpContent.classList.toggle('visible');
        });
        
        // Close help when clicking outside
        document.addEventListener('click', (e) => {
            if (!helpToggle.contains(e.target) && !helpContent.contains(e.target)) {
                helpContent.classList.remove('visible');
            }
        });
    }
}

// Initialize beat sequencer
function initializeBeatSequencer() {
    // Implementation of initializeBeatSequencer function
}

// Initialize keyboard controls
function initializeKeyboardControls() {
    // Implementation of initializeKeyboardControls function
}

// Update BPM
function updateBPM(value) {
    // Implementation of updateBPM function
}

// Update beat volume
function updateBeatVolume(value) {
    // Implementation of updateBeatVolume function
}

// Update synth envelope
function updateSynthEnvelope(id, value) {
    // Implementation of updateSynthEnvelope function
}

// Update effect
function updateEffect(id, value) {
    // Implementation of updateEffect function
}

// Update filter
function updateFilter(value) {
    // Implementation of updateFilter function
}

// Update particle count
function updateParticleCount(value) {
    // Implementation of updateParticleCount function
}

// Update visualization speed
function updateVisualizationSpeed(value) {
    // Implementation of updateVisualizationSpeed function
}

// Update synth type
function updateSynthType(value) {
    // Implementation of updateSynthType function
}

// Update visualization type
function updateVisualizationType(value) {
    // Implementation of updateVisualizationType function
}

// Update color scheme
function updateColorScheme(value) {
    // Implementation of updateColorScheme function
}

// Initialize first pattern button as active
let currentPattern = null;
document.querySelector('.pattern-btn[data-pattern="house"]').classList.add('active');

// Initialize mobile controls
function initializeMobileControls() {
    const mobileControlsToggle = document.querySelector('.mobile-controls-toggle');
    const controlsPanel = document.querySelector('.controls-panel');
    const mobileBeatPad = document.querySelector('.mobile-beat-pad');
    
    if (mobileControlsToggle) {
        mobileControlsToggle.addEventListener('click', () => {
            controlsPanel.classList.toggle('visible');
            mobileBeatPad.classList.toggle('visible');
        });
    }

    // Handle touch events for beat pads
    const beatPads = document.querySelectorAll('.beat-pad');
    beatPads.forEach(pad => {
        pad.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const note = pad.dataset.note;
            if (note) {
                audioEngine.playNote(note);
                pad.classList.add('active');
            }
        });

        pad.addEventListener('touchend', (e) => {
            e.preventDefault();
            pad.classList.remove('active');
        });
    });

    // Handle beat buttons
    const beatButtons = document.querySelectorAll('.beat-btn');
    beatButtons.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const drum = btn.dataset.drum;
            if (drum && audioEngine.drums[drum]) {
                audioEngine.drums[drum].start();
                btn.classList.add('active');
            }
        });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.classList.remove('active');
        });
    });

    // Handle quick beat patterns
    const quickBeatButtons = document.querySelectorAll('.quick-beat-btn');
    quickBeatButtons.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const pattern = btn.dataset.pattern;
            if (pattern) {
                audioEngine.changePattern(pattern);
                quickBeatButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });

    // Handle touch events for pattern buttons
    const patternButtons = document.querySelectorAll('.pattern-btn');
    patternButtons.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const pattern = btn.dataset.pattern;
            if (pattern) {
                audioEngine.changePattern(pattern);
                patternButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });

    // Handle touch events for sliders
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const value = e.touches[0].clientX;
            const rect = slider.getBoundingClientRect();
            const percentage = (value - rect.left) / rect.width;
            slider.value = percentage * (slider.max - slider.min) + slider.min;
            slider.dispatchEvent(new Event('input'));
        });

        slider.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const value = e.touches[0].clientX;
            const rect = slider.getBoundingClientRect();
            const percentage = Math.max(0, Math.min(1, (value - rect.left) / rect.width));
            slider.value = percentage * (slider.max - slider.min) + slider.min;
            slider.dispatchEvent(new Event('input'));
        });
    });

    // Add gesture controls
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTouchX = 0;
    let lastTouchY = 0;
    let isGestureActive = false;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        lastTouchX = touchStartX;
        lastTouchY = touchStartY;
        isGestureActive = true;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isGestureActive) return;

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - lastTouchX;
        const deltaY = touchY - lastTouchY;

        // Horizontal swipe for filter control
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const filterSlider = document.getElementById('filterCutoff');
            if (filterSlider) {
                const currentValue = parseFloat(filterSlider.value);
                const newValue = Math.max(20, Math.min(20000, currentValue + deltaX * 10));
                filterSlider.value = newValue;
                filterSlider.dispatchEvent(new Event('input'));
            }
        }
        // Vertical swipe for reverb control
        else {
            const reverbSlider = document.getElementById('reverb');
            if (reverbSlider) {
                const currentValue = parseFloat(reverbSlider.value);
                const newValue = Math.max(0, Math.min(1, currentValue + deltaY * 0.01));
                reverbSlider.value = newValue;
                reverbSlider.dispatchEvent(new Event('input'));
            }
        }

        lastTouchX = touchX;
        lastTouchY = touchY;
    }, { passive: true });

    document.addEventListener('touchend', () => {
        isGestureActive = false;
    }, { passive: true });

    // Add pinch-to-zoom for particle count
    let initialDistance = 0;
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const scale = currentDistance / initialDistance;
            
            const particleSlider = document.getElementById('particleCount');
            if (particleSlider) {
                const currentValue = parseFloat(particleSlider.value);
                const newValue = Math.max(100, Math.min(2000, currentValue * scale));
                particleSlider.value = newValue;
                particleSlider.dispatchEvent(new Event('input'));
            }
            
            initialDistance = currentDistance;
        }
    }, { passive: true });

    // Add double tap to toggle beat sequencer
    let lastTap = 0;
    document.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            // Double tap detected
            const beatToggle = document.querySelector('.pattern-btn.active');
            if (beatToggle) {
                beatToggle.click();
            }
        }
        lastTap = currentTime;
    }, { passive: true });

    // Add shake detection for random pattern
    let lastShake = 0;
    let lastAcceleration = { x: 0, y: 0, z: 0 };
    
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (e) => {
            const currentTime = new Date().getTime();
            if (currentTime - lastShake > 1000) { // Prevent too frequent triggers
                const acceleration = e.accelerationIncludingGravity;
                const deltaX = Math.abs(acceleration.x - lastAcceleration.x);
                const deltaY = Math.abs(acceleration.y - lastAcceleration.y);
                const deltaZ = Math.abs(acceleration.z - lastAcceleration.z);
                
                if (deltaX > 10 || deltaY > 10 || deltaZ > 10) {
                    // Shake detected
                    const patterns = Array.from(document.querySelectorAll('.pattern-btn'));
                    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
                    randomPattern.click();
                    lastShake = currentTime;
                }
                
                lastAcceleration = acceleration;
            }
        });
    }
}

// Add new styles for auto-generator and minimize buttons
const style = document.createElement('style');
style.textContent = `
    .auto-generator-btn {
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(0, 255, 136, 0.2);
        border: 2px solid #00ff88;
        color: #fff;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 1.1em;
        cursor: pointer;
        transition: all 0.3s;
        z-index: 1000;
    }

    .auto-generator-btn:hover {
        background: rgba(0, 255, 136, 0.4);
        transform: scale(1.05);
    }

    .auto-generator-btn.active {
        background: #00ff88;
        color: #000;
    }

    .minimize-all-btn {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 1.2em;
        cursor: pointer;
        transition: all 0.3s;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .minimize-all-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
    }

    .minimize-all-btn.active {
        background: rgba(255, 255, 255, 0.3);
    }

    .controls-panel.minimized {
        transform: translateY(calc(100% - 40px));
    }

    .mobile-beat-pad.minimized {
        transform: translateY(calc(100% - 40px));
    }

    @media (max-width: 768px) {
        .auto-generator-btn {
            top: auto;
            bottom: 20px;
            left: 20px;
            font-size: 1em;
            padding: 10px 15px;
        }

        .minimize-all-btn {
            top: auto;
            bottom: 20px;
            right: 20px;
        }
    }
`;
document.head.appendChild(style);

// Add new styles for visualization presets
const stylePresets = document.createElement('style');
stylePresets.textContent = `
    .viz-preset-btn {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 255, 136, 0.2);
        border: 2px solid #00ff88;
        color: #fff;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 1.1em;
        cursor: pointer;
        transition: all 0.3s;
        z-index: 1000;
    }

    .viz-preset-btn:hover {
        background: rgba(0, 255, 136, 0.4);
        transform: translateX(-50%) scale(1.05);
    }

    .viz-preset-menu {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        padding: 10px;
        display: none;
        min-width: 150px;
    }

    .viz-preset-menu.visible {
        display: block;
    }

    .preset-btn {
        display: block;
        width: 100%;
        padding: 8px 15px;
        margin: 5px 0;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: #fff;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .preset-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .loading-indicator {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        padding: 20px;
        border-radius: 10px;
        font-size: 1.2em;
        z-index: 2000;
    }

    .loading-indicator i {
        margin-right: 10px;
    }

    @media (max-width: 768px) {
        .viz-preset-btn {
            top: auto;
            bottom: 20px;
            font-size: 1em;
            padding: 10px 15px;
        }

        .viz-preset-menu {
            bottom: 100%;
            top: auto;
        }
    }
`;
document.head.appendChild(stylePresets);

// Add DJ controls
function initializeDJControls() {
    const djControls = document.createElement('div');
    djControls.className = 'dj-controls';
    djControls.innerHTML = `
        <div class="dj-section">
            <h3>Beat Controls</h3>
            <div class="beat-buttons">
                <button class="beat-btn" data-drum="kick">Kick</button>
                <button class="beat-btn" data-drum="snare">Snare</button>
                <button class="beat-btn" data-drum="hihat">Hi-Hat</button>
                <button class="beat-btn" data-drum="clap">Clap</button>
                <button class="beat-btn" data-drum="tom">Tom</button>
                <button class="beat-btn" data-drum="cymbal">Cymbal</button>
            </div>
        </div>
        <div class="dj-section">
            <h3>Effects</h3>
            <div class="effect-buttons">
                <button class="effect-btn" data-effect="slice">Slice</button>
                <button class="effect-btn" data-effect="stutter">Stutter</button>
                <button class="effect-btn" data-effect="reverse">Reverse</button>
                <button class="effect-btn" data-effect="filter">Filter</button>
            </div>
        </div>
        <div class="dj-section">
            <h3>Loops</h3>
            <div class="loop-buttons">
                <button class="loop-btn" data-loop="basic">Basic</button>
                <button class="loop-btn" data-loop="complex">Complex</button>
                <button class="loop-btn" data-loop="random">Random</button>
            </div>
        </div>
    `;
    document.body.appendChild(djControls);

    // Add styles for DJ controls
    const style = document.createElement('style');
    style.textContent = `
        .dj-controls {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 15px;
            display: flex;
            gap: 20px;
            z-index: 1000;
        }

        .dj-section {
            text-align: center;
        }

        .dj-section h3 {
            color: #fff;
            margin-bottom: 10px;
            font-size: 1em;
        }

        .beat-buttons, .effect-buttons, .loop-buttons {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }

        .beat-btn, .effect-btn, .loop-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .beat-btn:hover, .effect-btn:hover, .loop-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
        }

        .beat-btn.active, .effect-btn.active, .loop-btn.active {
            background: #00ff88;
            color: #000;
        }

        @media (max-width: 768px) {
            .dj-controls {
                bottom: 0;
                left: 0;
                right: 0;
                transform: none;
                border-radius: 15px 15px 0 0;
                padding: 15px;
                gap: 10px;
            }

            .dj-section h3 {
                font-size: 0.9em;
            }

            .beat-btn, .effect-btn, .loop-btn {
                padding: 8px;
                font-size: 0.9em;
            }
        }
    `;
    document.head.appendChild(style);

    // Add event listeners for beat buttons
    const beatButtons = document.querySelectorAll('.beat-btn');
    beatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const drum = btn.dataset.drum;
            if (drum && audioEngine.drums[drum]) {
                audioEngine.drums[drum].start();
                btn.classList.add('active');
                setTimeout(() => btn.classList.remove('active'), 100);
            }
        });

        // Add touch events for mobile
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const drum = btn.dataset.drum;
            if (drum && audioEngine.drums[drum]) {
                audioEngine.drums[drum].start();
                btn.classList.add('active');
            }
        });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.classList.remove('active');
        });
    });

    // Add event listeners for effect buttons
    const effectButtons = document.querySelectorAll('.effect-btn');
    effectButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const effect = btn.dataset.effect;
            switch (effect) {
                case 'slice':
                    audioEngine.sliceBeat(audioEngine.drums.kick);
                    break;
                case 'stutter':
                    audioEngine.stutterBeat(audioEngine.drums.snare);
                    break;
                case 'reverse':
                    // Implement reverse effect
                    break;
                case 'filter':
                    // Toggle filter effect
                    break;
            }
            btn.classList.add('active');
            setTimeout(() => btn.classList.remove('active'), 100);
        });
    });

    // Add event listeners for loop buttons
    const loopButtons = document.querySelectorAll('.loop-btn');
    loopButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const loop = btn.dataset.loop;
            audioEngine.toggleLoop(loop);
            btn.classList.toggle('active');
        });
    });
} 
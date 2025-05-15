document.addEventListener('DOMContentLoaded', () => {
    // Initialize Tone.js
    Tone.start();
    
    // Initialize controls
    initializeControls();
    
    // Initialize beat sequencer
    initializeBeatSequencer();
    
    // Initialize keyboard controls
    initializeKeyboardControls();
    
    // Initialize help panel
    initializeHelpPanel();
    
    // Initialize audio engine
    const audioEngine = new AudioEngine();
    
    // Initialize visualizer
    const visualizer = new Visualizer();
    
    // Connect audio engine to visualizer
    audioEngine.synth.connect(visualizer.analyser);
    
    // Mouse interaction for sound generation
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        // Map mouse position to musical notes
        const notes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'];
        const noteIndex = Math.floor(x * notes.length);
        const note = notes[noteIndex];
        
        // Map mouse Y position to velocity (0-1)
        const velocity = 1 - y;
        
        // Update synth parameters based on mouse position
        audioEngine.synth.volume.value = Tone.gainToDb(velocity);
        audioEngine.effects.filter.frequency.value = 20 + (y * 20000); // 20Hz to 20kHz
        
        // Trigger note with mouse position
        if (e.buttons === 1) { // Left mouse button
            audioEngine.playNote(note);
        }
    });
    
    // Touch interaction for mobile devices
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const x = touch.clientX / window.innerWidth;
        const y = touch.clientY / window.innerHeight;
        
        // Map touch position to musical notes
        const notes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'];
        const noteIndex = Math.floor(x * notes.length);
        const note = notes[noteIndex];
        
        // Map touch Y position to velocity (0-1)
        const velocity = 1 - y;
        
        // Update synth parameters based on touch position
        audioEngine.synth.volume.value = Tone.gainToDb(velocity);
        audioEngine.effects.filter.frequency.value = 20 + (y * 20000);
        
        // Trigger note on touch
        audioEngine.playNote(note);
    }, { passive: false });
    
    // Stop notes when mouse/touch is released
    document.addEventListener('mouseup', () => {
        audioEngine.stopNote();
    });
    
    document.addEventListener('touchend', () => {
        audioEngine.stopNote();
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        visualizer.resizeCanvas();
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
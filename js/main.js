document.addEventListener('DOMContentLoaded', () => {
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

    // Keyboard help toggle
    const helpToggle = document.querySelector('.help-toggle');
    const helpContent = document.querySelector('.help-content');
    
    helpToggle.addEventListener('click', () => {
        helpContent.classList.toggle('active');
    });

    // Close help when clicking outside
    document.addEventListener('click', (e) => {
        if (!helpToggle.contains(e.target) && !helpContent.contains(e.target)) {
            helpContent.classList.remove('active');
        }
    });

    // Initialize first pattern button as active
    document.querySelector('.pattern-btn[data-pattern="house"]').classList.add('active');
}); 
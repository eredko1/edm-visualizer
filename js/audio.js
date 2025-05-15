class AudioEngine {
    constructor() {
        this.initialized = false;
        this.loadingState = 'initializing';
        this.context = null;
        this.mixer = null;
        this.synths = null;
        this.effects = null;
        this.drums = null;
        this.currentSynth = null;
    }

    async initializeAudio() {
        try {
            console.log("Starting audio initialization...");
            this.loadingState = 'starting_tone';
            
            // Start Tone.js with explicit user interaction
            await Tone.start();
            console.log("Tone.js started successfully");
            
            this.loadingState = 'creating_context';
            // Create audio context with better mobile compatibility
            this.context = new Tone.Context({
                latencyHint: 'interactive',
                sampleRate: 44100,
                lookAhead: 0.1
            });
            Tone.setContext(this.context);
            console.log("Audio context created");
            
            this.loadingState = 'creating_mixer';
            // Create master volume and mixer with better control
            this.masterVolume = new Tone.Volume(-6).toDestination();
            this.mixer = new Tone.Channel().connect(this.masterVolume);
            console.log("Mixer created");
            
            this.loadingState = 'creating_channels';
            // Create channels for beats, synths, and effects
            this.beatChannel = new Tone.Channel(-3).connect(this.mixer);
            this.synthChannel = new Tone.Channel(-3).connect(this.mixer);
            this.effectsChannel = new Tone.Channel(-3).connect(this.mixer);
            console.log("Channels created");
            
            this.loadingState = 'initializing_synths';
            // Initialize synths first
            this.initializeSynths();
            console.log("Synths initialized");
            
            this.loadingState = 'loading_samples';
            // Initialize drum samples with better quality samples
            this.drums = {
                kick: new Tone.Player({
                    url: "https://tonejs.github.io/audio/drum-samples/CR78/kick.mp3",
                    volume: -6,
                    onload: () => console.log("Kick loaded")
                }).connect(this.beatChannel),
                snare: new Tone.Player({
                    url: "https://tonejs.github.io/audio/drum-samples/CR78/snare.mp3",
                    volume: -4,
                    onload: () => console.log("Snare loaded")
                }).connect(this.beatChannel),
                hihat: new Tone.Player({
                    url: "https://tonejs.github.io/audio/drum-samples/CR78/hihat.mp3",
                    volume: -8,
                    onload: () => console.log("Hihat loaded")
                }).connect(this.beatChannel)
            };

            // Load all samples with timeout
            this.loadingState = 'waiting_for_samples';
            console.log("Loading drum samples...");
            await Promise.race([
                Promise.all(Object.values(this.drums).map(drum => drum.load())),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Sample loading timeout")), 10000)
                )
            ]);
            console.log("All samples loaded successfully");

            this.loadingState = 'initializing_effects';
            // Initialize effects after samples are loaded
            this.initializeEffects();
            console.log("Effects initialized");

            this.loadingState = 'initializing_sequencer';
            this.initializeBeatSequencer();
            console.log("Beat sequencer initialized");

            this.loadingState = 'initializing_autogen';
            this.initializeAutoGenerator();
            console.log("Auto generator initialized");
            
            this.initialized = true;
            this.loadingState = 'complete';
            console.log("Audio engine initialized successfully");
        } catch (error) {
            console.error("Error initializing audio:", error);
            this.loadingState = 'error';
            this.initialized = false;
            throw error;
        }
    }

    initializeSynths() {
        // Create basic synth with better mobile performance
        this.synths = {
            basic: new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    type: "sine",
                    phase: 0
                },
                envelope: {
                    attack: 0.1,
                    decay: 0.2,
                    sustain: 0.5,
                    release: 0.8
                },
                maxPolyphony: 8
            }).connect(this.synthChannel)
        };

        this.currentSynth = this.synths.basic;
    }

    initializeEffects() {
        // Create effects chain with better mobile performance
        this.effects = {
            reverb: new Tone.Reverb({
                decay: 2.5,
                wet: 0.3,
                preDelay: 0.1
            }).connect(this.effectsChannel),
            delay: new Tone.FeedbackDelay({
                delayTime: 0.25,
                feedback: 0.4,
                wet: 0.2
            }).connect(this.effectsChannel),
            filter: new Tone.Filter({
                frequency: 1000,
                type: "lowpass",
                rolloff: -12
            }).connect(this.effectsChannel)
        };
    }

    initializeBeatSequencer() {
        this.bpm = 128;
        this.beatVolume = 0.5;
        this.currentPattern = "house";
        
        // Define beat patterns
        this.patterns = {
            house: {
                bpm: 128,
                steps: [
                    { time: "0:0", note: "kick" },
                    { time: "0:2", note: "snare" },
                    { time: "1:0", note: "kick" },
                    { time: "1:2", note: "snare" },
                    { time: "2:0", note: "kick" },
                    { time: "2:2", note: "snare" },
                    { time: "3:0", note: "kick" },
                    { time: "3:2", note: "snare" }
                ]
            },
            techno: {
                bpm: 130,
                steps: [
                    { time: "0:0", note: "kick" },
                    { time: "0:2", note: "hihat" },
                    { time: "1:0", note: "kick" },
                    { time: "1:2", note: "hihat" },
                    { time: "2:0", note: "kick" },
                    { time: "2:2", note: "hihat" },
                    { time: "3:0", note: "kick" },
                    { time: "3:2", note: "hihat" }
                ]
            },
            dubstep: {
                bpm: 140,
                steps: [
                    { time: "0:0", note: "kick" },
                    { time: "0:3", note: "snare" },
                    { time: "1:0", note: "kick" },
                    { time: "1:2", note: "hihat" },
                    { time: "2:0", note: "kick" },
                    { time: "2:3", note: "snare" },
                    { time: "3:0", note: "kick" },
                    { time: "3:2", note: "hihat" }
                ]
            },
            trance: {
                bpm: 138,
                steps: [
                    { time: "0:0", note: "kick" },
                    { time: "0:2", note: "hihat" },
                    { time: "1:0", note: "kick" },
                    { time: "1:2", note: "hihat" },
                    { time: "2:0", note: "kick" },
                    { time: "2:2", note: "hihat" },
                    { time: "3:0", note: "kick" },
                    { time: "3:2", note: "hihat" }
                ]
            },
            drumandbass: {
                bpm: 174,
                steps: [
                    { time: "0:0", note: "kick" },
                    { time: "0:1", note: "hihat" },
                    { time: "0:2", note: "snare" },
                    { time: "0:3", note: "hihat" },
                    { time: "1:0", note: "kick" },
                    { time: "1:1", note: "hihat" },
                    { time: "1:2", note: "snare" },
                    { time: "1:3", note: "hihat" }
                ]
            },
            hardstyle: {
                bpm: 150,
                steps: [
                    { time: "0:0", note: "kick" },
                    { time: "0:1", note: "kick" },
                    { time: "0:2", note: "snare" },
                    { time: "1:0", note: "kick" },
                    { time: "1:1", note: "kick" },
                    { time: "1:2", note: "snare" },
                    { time: "2:0", note: "kick" },
                    { time: "2:1", note: "kick" },
                    { time: "2:2", note: "snare" },
                    { time: "3:0", note: "kick" },
                    { time: "3:1", note: "kick" },
                    { time: "3:2", note: "snare" }
                ]
            },
            progressive: {
                bpm: 126,
                steps: [
                    { time: "0:0", note: "kick" },
                    { time: "0:2", note: "snare" },
                    { time: "0:3", note: "hihat" },
                    { time: "1:0", note: "kick" },
                    { time: "1:2", note: "snare" },
                    { time: "1:3", note: "hihat" },
                    { time: "2:0", note: "kick" },
                    { time: "2:2", note: "snare" },
                    { time: "2:3", note: "hihat" },
                    { time: "3:0", note: "kick" },
                    { time: "3:2", note: "snare" },
                    { time: "3:3", note: "hihat" }
                ]
            },
            futurebass: {
                bpm: 150,
                steps: [
                    { time: "0:0", note: "kick" },
                    { time: "0:2", note: "snare" },
                    { time: "0:3", note: "hihat" },
                    { time: "1:0", note: "kick" },
                    { time: "1:2", note: "snare" },
                    { time: "1:3", note: "hihat" },
                    { time: "2:0", note: "kick" },
                    { time: "2:2", note: "snare" },
                    { time: "2:3", note: "hihat" },
                    { time: "3:0", note: "kick" },
                    { time: "3:2", note: "snare" },
                    { time: "3:3", note: "hihat" }
                ]
            }
        };

        // Create sequencer
        this.sequencer = new Tone.Sequence(
            (time, step) => {
                if (this.patterns[this.currentPattern].steps[step]) {
                    const { note } = this.patterns[this.currentPattern].steps[step];
                    this.drums[note].start(time);
                }
            },
            Array.from({ length: 16 }, (_, i) => i),
            "16n"
        );

        // Set initial BPM
        Tone.Transport.bpm.value = this.bpm;
    }

    initializeAutoGenerator() {
        this.autoGenerator = {
            isActive: false,
            currentChord: 0,
            chordProgression: [
                ['C3', 'E3', 'G3'],
                ['F3', 'A3', 'C4'],
                ['G3', 'B3', 'D4'],
                ['A3', 'C4', 'E4']
            ],
            lastBeatTime: 0,
            nextBeatTime: 0,
            currentPattern: null
        };

        // Create auto-generator loop
        this.autoLoop = new Tone.Loop((time) => {
            if (!this.autoGenerator.isActive) return;

            const now = Tone.now();
            if (now >= this.autoGenerator.nextBeatTime) {
                this.generateNextBeat(time);
                this.autoGenerator.lastBeatTime = now;
                this.autoGenerator.nextBeatTime = now + (60 / this.bpm);
            }
        }, "16n");
    }

    generateNextBeat(time) {
        // Randomly choose a drum to play
        const drums = Object.keys(this.drums);
        const randomDrum = drums[Math.floor(Math.random() * drums.length)];
        
        // Play the drum with random velocity
        const velocity = 0.5 + Math.random() * 0.5;
        this.drums[randomDrum].volume.value = Tone.gainToDb(velocity);
        this.drums[randomDrum].start(time);

        // Occasionally play a chord
        if (Math.random() < 0.3) {
            const chord = this.autoGenerator.chordProgression[this.autoGenerator.currentChord];
            chord.forEach(note => {
                this.currentSynth.triggerAttackRelease(note, "8n", time, 0.5 + Math.random() * 0.5);
            });
            this.autoGenerator.currentChord = (this.autoGenerator.currentChord + 1) % this.autoGenerator.chordProgression.length;
        }
    }

    toggleAutoGenerator() {
        this.autoGenerator.isActive = !this.autoGenerator.isActive;
        if (this.autoGenerator.isActive) {
            this.autoLoop.start(0);
            Tone.Transport.start();
        } else {
            this.autoLoop.stop();
            Tone.Transport.stop();
        }
    }

    playNote(note) {
        if (!this.initialized || !this.currentSynth) {
            console.warn("Audio engine not initialized yet");
            return;
        }
        try {
            this.currentSynth.triggerAttackRelease(note, "8n");
        } catch (error) {
            console.error("Error playing note:", error);
        }
    }

    stopNote() {
        if (!this.initialized || !this.currentSynth) return;
        try {
            this.currentSynth.releaseAll();
        } catch (error) {
            console.error("Error stopping note:", error);
        }
    }

    toggleBeat() {
        if (!this.initialized) return;
        try {
            if (this.sequencer.state === "started") {
                this.sequencer.stop();
                Tone.Transport.stop();
            } else {
                this.sequencer.start(0);
                Tone.Transport.start();
            }
        } catch (error) {
            console.error("Error toggling beat:", error);
        }
    }

    changePattern(pattern) {
        this.currentPattern = pattern;
        this.bpm = this.patterns[pattern].bpm;
        Tone.Transport.bpm.value = this.bpm;
    }

    updateBPM(value) {
        this.bpm = value;
        Tone.Transport.bpm.value = value;
    }

    updateBeatVolume(value) {
        this.beatVolume = value;
        this.beatChannel.volume.value = Tone.gainToDb(value);
    }

    updateSynthEnvelope(param, value) {
        Object.values(this.synths).forEach(synth => {
            synth.set({ envelope: { [param]: value } });
        });
    }

    updateEffect(effect, value) {
        this.effects[effect].wet.value = value;
    }

    updateFilter(value) {
        this.effects.filter.frequency.value = value;
    }

    updateSynthType(type) {
        this.currentSynth = this.synths[type];
    }

    // Add new DJ-focused methods
    async loadCustomSample(name, url) {
        try {
            const player = new Tone.Player({
                url: url,
                volume: -6,
                onload: () => console.log(`${name} loaded`)
            }).connect(this.beatChannel);
            
            await player.load();
            this.drums[name] = player;
            return true;
        } catch (error) {
            console.error(`Error loading sample ${name}:`, error);
            return false;
        }
    }

    createLoop(name, steps) {
        const loop = new Tone.Sequence(
            (time, step) => {
                if (steps[step]) {
                    const { note, velocity = 1 } = steps[step];
                    if (this.drums[note]) {
                        this.drums[note].volume.value = Tone.gainToDb(velocity);
                        this.drums[note].start(time);
                    }
                }
            },
            Array.from({ length: 16 }, (_, i) => i),
            "16n"
        );
        
        this.loops = this.loops || {};
        this.loops[name] = loop;
        return loop;
    }

    toggleLoop(name) {
        if (this.loops && this.loops[name]) {
            if (this.loops[name].state === "started") {
                this.loops[name].stop();
            } else {
                this.loops[name].start(0);
            }
        }
    }

    crossfade(source, target, duration = 1) {
        const now = Tone.now();
        source.volume.rampTo(-60, duration, now);
        target.volume.rampTo(0, duration, now);
    }

    // Add beat slicing
    sliceBeat(beat, slices = 4) {
        const duration = beat.buffer.duration;
        const sliceDuration = duration / slices;
        
        for (let i = 0; i < slices; i++) {
            const startTime = i * sliceDuration;
            beat.start(startTime);
        }
    }

    // Add beat stuttering
    stutterBeat(beat, rate = 0.1, duration = 0.5) {
        const now = Tone.now();
        for (let i = 0; i < duration / rate; i++) {
            beat.start(now + i * rate);
        }
    }
}

// Initialize audio context on user interaction
document.addEventListener('click', () => {
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
}, { once: true });

// Add touch event listener for mobile devices
document.addEventListener('touchstart', () => {
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
}, { once: true }); 
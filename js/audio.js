class AudioEngine {
    constructor() {
        this.initializeAudio();
        this.initializeEffects();
        this.initializeSynths();
        this.initializeBeatSequencer();
    }

    initializeAudio() {
        // Initialize Tone.js
        this.masterVolume = new Tone.Volume(-10).toDestination();
        this.mixer = new Tone.Gain(1).connect(this.masterVolume);
        
        // Create channels
        this.beatChannel = new Tone.Channel().connect(this.mixer);
        this.synthChannel = new Tone.Channel().connect(this.mixer);
        this.effectsChannel = new Tone.Channel().connect(this.mixer);
    }

    initializeEffects() {
        // Reverb
        this.reverb = new Tone.Reverb({
            decay: 4,
            wet: 0.3
        }).connect(this.effectsChannel);

        // Delay
        this.delay = new Tone.FeedbackDelay({
            delayTime: 0.25,
            feedback: 0.3,
            wet: 0.2
        }).connect(this.effectsChannel);

        // Distortion
        this.distortion = new Tone.Distortion({
            distortion: 0.1,
            wet: 0.1
        }).connect(this.effectsChannel);

        // Filter
        this.filter = new Tone.Filter({
            frequency: 1000,
            type: "lowpass"
        }).connect(this.effectsChannel);
    }

    initializeSynths() {
        // Basic synth
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.1,
                decay: 0.2,
                sustain: 0.5,
                release: 0.8
            }
        }).connect(this.filter);

        // FM synth for more complex sounds
        this.fmSynth = new Tone.FMSynth({
            harmonicity: 3,
            modulationIndex: 10,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.1,
                decay: 0.2,
                sustain: 0.5,
                release: 0.8
            },
            modulation: {
                type: "square"
            },
            modulationEnvelope: {
                attack: 0.5,
                decay: 0.2,
                sustain: 0.5,
                release: 0.8
            }
        }).connect(this.filter);

        // AM synth for metallic sounds
        this.amSynth = new Tone.AMSynth({
            harmonicity: 3,
            detune: 0,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.1,
                decay: 0.2,
                sustain: 0.5,
                release: 0.8
            },
            modulation: {
                type: "square"
            },
            modulationEnvelope: {
                attack: 0.5,
                decay: 0.2,
                sustain: 0.5,
                release: 0.8
            }
        }).connect(this.filter);

        // Membrane synth for drum-like sounds
        this.membraneSynth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 2,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.01,
                decay: 0.2,
                sustain: 0.2,
                release: 1.4,
                attackCurve: "exponential"
            }
        }).connect(this.filter);
    }

    initializeBeatSequencer() {
        this.bpm = 128;
        this.beatVolume = 0.5;
        this.currentPattern = 'house';
        this.isPlaying = false;

        // Define beat patterns
        this.patterns = {
            house: {
                name: "House",
                bpm: 128,
                steps: [
                    { note: "C2", time: "0:0" },
                    { note: "E2", time: "0:1" },
                    { note: "G2", time: "0:2" },
                    { note: "E2", time: "0:3" },
                    { note: "C2", time: "1:0" },
                    { note: "E2", time: "1:1" },
                    { note: "G2", time: "1:2" },
                    { note: "E2", time: "1:3" }
                ]
            },
            techno: {
                name: "Techno",
                bpm: 130,
                steps: [
                    { note: "C2", time: "0:0" },
                    { note: "E2", time: "0:1" },
                    { note: "G2", time: "0:2" },
                    { note: "E2", time: "0:3" },
                    { note: "C2", time: "1:0" },
                    { note: "E2", time: "1:1" },
                    { note: "G2", time: "1:2" },
                    { note: "E2", time: "1:3" }
                ]
            },
            dubstep: {
                name: "Dubstep",
                bpm: 140,
                steps: [
                    { note: "C2", time: "0:0" },
                    { note: "E2", time: "0:1" },
                    { note: "G2", time: "0:2" },
                    { note: "E2", time: "0:3" },
                    { note: "C2", time: "1:0" },
                    { note: "E2", time: "1:1" },
                    { note: "G2", time: "1:2" },
                    { note: "E2", time: "1:3" }
                ]
            },
            trance: {
                name: "Trance",
                bpm: 138,
                steps: [
                    { note: "C2", time: "0:0" },
                    { note: "E2", time: "0:1" },
                    { note: "G2", time: "0:2" },
                    { note: "E2", time: "0:3" },
                    { note: "C2", time: "1:0" },
                    { note: "E2", time: "1:1" },
                    { note: "G2", time: "1:2" },
                    { note: "E2", time: "1:3" }
                ]
            },
            drumandbass: {
                name: "Drum & Bass",
                bpm: 174,
                steps: [
                    { note: "C2", time: "0:0" },
                    { note: "E2", time: "0:1" },
                    { note: "G2", time: "0:2" },
                    { note: "E2", time: "0:3" },
                    { note: "C2", time: "1:0" },
                    { note: "E2", time: "1:1" },
                    { note: "G2", time: "1:2" },
                    { note: "E2", time: "1:3" }
                ]
            },
            hardstyle: {
                name: "Hardstyle",
                bpm: 150,
                steps: [
                    { note: "C2", time: "0:0" },
                    { note: "E2", time: "0:1" },
                    { note: "G2", time: "0:2" },
                    { note: "E2", time: "0:3" },
                    { note: "C2", time: "1:0" },
                    { note: "E2", time: "1:1" },
                    { note: "G2", time: "1:2" },
                    { note: "E2", time: "1:3" }
                ]
            },
            progressive: {
                name: "Progressive",
                bpm: 126,
                steps: [
                    { note: "C2", time: "0:0" },
                    { note: "E2", time: "0:1" },
                    { note: "G2", time: "0:2" },
                    { note: "E2", time: "0:3" },
                    { note: "C2", time: "1:0" },
                    { note: "E2", time: "1:1" },
                    { note: "G2", time: "1:2" },
                    { note: "E2", time: "1:3" }
                ]
            },
            futurebass: {
                name: "Future Bass",
                bpm: 150,
                steps: [
                    { note: "C2", time: "0:0" },
                    { note: "E2", time: "0:1" },
                    { note: "G2", time: "0:2" },
                    { note: "E2", time: "0:3" },
                    { note: "C2", time: "1:0" },
                    { note: "E2", time: "1:1" },
                    { note: "G2", time: "1:2" },
                    { note: "E2", time: "1:3" }
                ]
            }
        };

        // Create sequencer
        this.sequencer = new Tone.Sequence(
            (time, step) => {
                const pattern = this.patterns[this.currentPattern];
                if (pattern && pattern.steps[step]) {
                    const note = pattern.steps[step].note;
                    this.membraneSynth.triggerAttackRelease(note, "16n", time);
                }
            },
            [0, 1, 2, 3, 4, 5, 6, 7],
            "16n"
        );
    }

    // Play a note
    playNote(note) {
        this.synth.triggerAttackRelease(note, "8n");
    }

    // Toggle beat sequencer
    toggleBeat() {
        if (this.isPlaying) {
            this.sequencer.stop();
            this.isPlaying = false;
        } else {
            this.sequencer.start();
            this.isPlaying = true;
        }
    }

    // Change beat pattern
    changePattern(pattern) {
        this.currentPattern = pattern;
        if (this.isPlaying) {
            this.sequencer.stop();
            this.sequencer.start();
        }
    }

    // Update BPM
    updateBPM(bpm) {
        this.bpm = bpm;
        Tone.Transport.bpm.value = bpm;
    }

    // Update beat volume
    updateBeatVolume(volume) {
        this.beatVolume = volume;
        this.beatChannel.volume.value = Tone.gainToDb(volume);
    }

    // Update synth envelope
    updateSynthEnvelope(param, value) {
        this.synth.set({ envelope: { [param]: value } });
        this.fmSynth.set({ envelope: { [param]: value } });
        this.amSynth.set({ envelope: { [param]: value } });
    }

    // Update effects
    updateEffect(effect, value) {
        switch(effect) {
            case 'reverb':
                this.reverb.set({ wet: value });
                break;
            case 'delay':
                this.delay.set({ wet: value });
                break;
            case 'distortion':
                this.distortion.set({ wet: value });
                break;
        }
    }

    // Update filter
    updateFilter(frequency) {
        this.filter.set({ frequency: frequency });
    }

    // Update synth type
    updateSynthType(type) {
        // Disconnect current synth
        this.synth.disconnect();
        this.fmSynth.disconnect();
        this.amSynth.disconnect();
        this.membraneSynth.disconnect();

        // Connect new synth
        switch(type) {
            case 'synth':
                this.synth.connect(this.filter);
                break;
            case 'fm':
                this.fmSynth.connect(this.filter);
                break;
            case 'am':
                this.amSynth.connect(this.filter);
                break;
            case 'membrane':
                this.membraneSynth.connect(this.filter);
                break;
        }
    }
}

// Initialize audio context on user interaction
document.addEventListener('click', () => {
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
}, { once: true }); 
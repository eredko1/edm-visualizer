class AudioEngine {
    constructor() {
        this.initializeAudio();
        this.initializeEffects();
        this.initializeSynths();
        this.initializeBeatSequencer();
    }

    async initializeAudio() {
        // Wait for user interaction before starting audio
        await Tone.start();
        
        // Create master volume and mixer
        this.masterVolume = new Tone.Volume(-10).toDestination();
        this.mixer = new Tone.Channel().connect(this.masterVolume);
        
        // Create channels for beats, synths, and effects
        this.beatChannel = new Tone.Channel().connect(this.mixer);
        this.synthChannel = new Tone.Channel().connect(this.mixer);
        this.effectsChannel = new Tone.Channel().connect(this.mixer);
        
        // Initialize drum samples
        this.drums = {
            kick: new Tone.Player({
                url: "https://tonejs.github.io/audio/drum-samples/CR78/kick.mp3",
                volume: -10
            }).connect(this.beatChannel),
            snare: new Tone.Player({
                url: "https://tonejs.github.io/audio/drum-samples/CR78/snare.mp3",
                volume: -8
            }).connect(this.beatChannel),
            hihat: new Tone.Player({
                url: "https://tonejs.github.io/audio/drum-samples/CR78/hihat.mp3",
                volume: -12
            }).connect(this.beatChannel),
            clap: new Tone.Player({
                url: "https://tonejs.github.io/audio/drum-samples/CR78/clap.mp3",
                volume: -8
            }).connect(this.beatChannel),
            tom: new Tone.Player({
                url: "https://tonejs.github.io/audio/drum-samples/CR78/tom.mp3",
                volume: -10
            }).connect(this.beatChannel)
        };

        // Load all samples
        await Promise.all(Object.values(this.drums).map(drum => drum.load()));
    }

    initializeEffects() {
        // Create effects chain
        this.effects = {
            reverb: new Tone.Reverb({
                decay: 2.5,
                wet: 0.3
            }).connect(this.effectsChannel),
            delay: new Tone.FeedbackDelay({
                delayTime: 0.25,
                feedback: 0.4,
                wet: 0.2
            }).connect(this.effectsChannel),
            distortion: new Tone.Distortion({
                distortion: 0.4,
                wet: 0.1
            }).connect(this.effectsChannel),
            filter: new Tone.Filter({
                frequency: 1000,
                type: "lowpass"
            }).connect(this.effectsChannel)
        };
    }

    initializeSynths() {
        // Create different synth types
        this.synths = {
            basic: new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    type: "sine"
                },
                envelope: {
                    attack: 0.1,
                    decay: 0.2,
                    sustain: 0.5,
                    release: 0.8
                }
            }).connect(this.synthChannel),
            
            fm: new Tone.PolySynth(Tone.FMSynth, {
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
                    decay: 0.1,
                    sustain: 0.2,
                    release: 0.1
                }
            }).connect(this.synthChannel),
            
            am: new Tone.PolySynth(Tone.AMSynth, {
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
                    decay: 0.1,
                    sustain: 0.2,
                    release: 0.1
                }
            }).connect(this.synthChannel),
            
            membrane: new Tone.PolySynth(Tone.MembraneSynth, {
                pitchDecay: 0.05,
                octaves: 2,
                oscillator: {
                    type: "sine"
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.2,
                    sustain: 0.2,
                    release: 1
                }
            }).connect(this.synthChannel)
        };

        this.currentSynth = this.synths.basic;
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

    playNote(note) {
        this.currentSynth.triggerAttackRelease(note, "8n");
    }

    stopNote() {
        this.currentSynth.releaseAll();
    }

    toggleBeat() {
        if (this.sequencer.state === "started") {
            this.sequencer.stop();
            Tone.Transport.stop();
        } else {
            this.sequencer.start(0);
            Tone.Transport.start();
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
}

// Initialize audio context on user interaction
document.addEventListener('click', () => {
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
}, { once: true }); 
class AudioEngine {
    constructor() {
        this.synth = null;
        this.effects = {
            reverb: new Tone.Reverb(),
            delay: new Tone.FeedbackDelay(),
            distortion: new Tone.Distortion(),
            filter: new Tone.Filter()
        };
        
        this.beatPatterns = {
            house: [
                { note: 'C3', duration: '8n', time: '0:0' },
                { note: 'E3', duration: '8n', time: '0:1' },
                { note: 'G3', duration: '8n', time: '0:2' },
                { note: 'B3', duration: '8n', time: '0:3' },
                { note: 'C4', duration: '4n', time: '1:0' },
                { note: 'B3', duration: '8n', time: '1:2' },
                { note: 'G3', duration: '8n', time: '1:3' },
                { note: 'E3', duration: '8n', time: '2:0' }
            ],
            techno: [
                { note: 'C3', duration: '8n', time: '0:0' },
                { note: 'E3', duration: '8n', time: '0:2' },
                { note: 'G3', duration: '8n', time: '1:0' },
                { note: 'B3', duration: '8n', time: '1:2' },
                { note: 'C4', duration: '8n', time: '2:0' },
                { note: 'B3', duration: '8n', time: '2:2' },
                { note: 'G3', duration: '8n', time: '3:0' },
                { note: 'E3', duration: '8n', time: '3:2' }
            ],
            dubstep: [
                { note: 'C3', duration: '4n', time: '0:0' },
                { note: 'G3', duration: '8n', time: '0:2' },
                { note: 'B3', duration: '8n', time: '1:0' },
                { note: 'C4', duration: '4n', time: '1:2' },
                { note: 'B3', duration: '8n', time: '2:0' },
                { note: 'G3', duration: '8n', time: '2:2' },
                { note: 'E3', duration: '8n', time: '3:0' },
                { note: 'C3', duration: '8n', time: '3:2' }
            ],
            trance: [
                { note: 'C3', duration: '8n', time: '0:0' },
                { note: 'E3', duration: '8n', time: '0:1' },
                { note: 'G3', duration: '8n', time: '0:2' },
                { note: 'B3', duration: '8n', time: '0:3' },
                { note: 'C4', duration: '8n', time: '1:0' },
                { note: 'B3', duration: '8n', time: '1:1' },
                { note: 'G3', duration: '8n', time: '1:2' },
                { note: 'E3', duration: '8n', time: '1:3' }
            ]
        };
        
        this.currentPattern = 'house';
        this.isPlaying = false;
        this.bpm = 128;
        
        this.setupAudioChain();
        this.setupEventListeners();
        this.initializeSynth();
        this.setupKeyboardControls();
    }

    setupAudioChain() {
        // Connect effects in series
        this.effects.reverb.toDestination();
        this.effects.delay.connect(this.effects.reverb);
        this.effects.distortion.connect(this.effects.delay);
        this.effects.filter.connect(this.effects.distortion);
    }

    setupEventListeners() {
        // Synth controls
        document.getElementById('synthType').addEventListener('change', (e) => this.changeSynthType(e.target.value));
        document.getElementById('attack').addEventListener('input', (e) => this.updateEnvelope('attack', e.target.value));
        document.getElementById('decay').addEventListener('input', (e) => this.updateEnvelope('decay', e.target.value));
        document.getElementById('sustain').addEventListener('input', (e) => this.updateEnvelope('sustain', e.target.value));
        document.getElementById('release').addEventListener('input', (e) => this.updateEnvelope('release', e.target.value));

        // Effects controls
        document.getElementById('reverb').addEventListener('input', (e) => this.updateEffect('reverb', 'wet', e.target.value));
        document.getElementById('delay').addEventListener('input', (e) => this.updateEffect('delay', 'wet', e.target.value));
        document.getElementById('distortion').addEventListener('input', (e) => this.updateEffect('distortion', 'distortion', e.target.value));
        document.getElementById('filterCutoff').addEventListener('input', (e) => this.updateEffect('filter', 'frequency', e.target.value));

        // Beat controls
        document.getElementById('bpm').addEventListener('input', (e) => {
            this.bpm = parseInt(e.target.value);
            Tone.Transport.bpm.value = this.bpm;
            document.querySelector('.bpm-value').textContent = this.bpm;
        });

        document.getElementById('beatVolume').addEventListener('input', (e) => {
            this.synth.volume.value = Tone.gainToDb(e.target.value);
        });

        // Beat pattern buttons
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentPattern = e.target.dataset.pattern;
                document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateBeatPattern();
            });
        });

        // Beat pads
        document.querySelectorAll('.beat-pad').forEach(pad => {
            pad.addEventListener('click', (e) => {
                const note = e.target.dataset.note;
                this.playNote(note);
                e.target.classList.add('active');
                setTimeout(() => e.target.classList.remove('active'), 100);
            });
        });
    }

    setupKeyboardControls() {
        const keyMap = {
            'a': 'C3', 's': 'D3', 'd': 'E3', 'f': 'F3', 'g': 'G3', 'h': 'A3', 'j': 'B3', 'k': 'C4',
            'z': 'C4', 'x': 'D4', 'c': 'E4', 'v': 'F4', 'b': 'G4', 'n': 'A4', 'm': 'B4'
        };

        document.addEventListener('keydown', (e) => {
            if (keyMap[e.key.toLowerCase()]) {
                this.playNote(keyMap[e.key.toLowerCase()]);
            }
            
            // Space to toggle beat
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleBeat();
            }
            
            // Number keys for patterns
            if (e.key >= '1' && e.key <= '4') {
                const patterns = ['house', 'techno', 'dubstep', 'trance'];
                this.currentPattern = patterns[parseInt(e.key) - 1];
                this.updateBeatPattern();
            }
            
            // Arrow keys for BPM and filter
            if (e.key === 'ArrowUp') {
                this.bpm = Math.min(this.bpm + 1, 180);
                Tone.Transport.bpm.value = this.bpm;
                document.getElementById('bpm').value = this.bpm;
                document.querySelector('.bpm-value').textContent = this.bpm;
            }
            if (e.key === 'ArrowDown') {
                this.bpm = Math.max(this.bpm - 1, 60);
                Tone.Transport.bpm.value = this.bpm;
                document.getElementById('bpm').value = this.bpm;
                document.querySelector('.bpm-value').textContent = this.bpm;
            }
            if (e.key === 'ArrowLeft') {
                const currentFreq = this.effects.filter.frequency.value;
                this.effects.filter.frequency.value = Math.max(currentFreq - 100, 20);
                document.getElementById('filterCutoff').value = this.effects.filter.frequency.value;
            }
            if (e.key === 'ArrowRight') {
                const currentFreq = this.effects.filter.frequency.value;
                this.effects.filter.frequency.value = Math.min(currentFreq + 100, 20000);
                document.getElementById('filterCutoff').value = this.effects.filter.frequency.value;
            }
        });
    }

    initializeSynth() {
        this.changeSynthType('synth');
        this.startAutoPlay();
    }

    changeSynthType(type) {
        if (this.synth) {
            this.synth.dispose();
        }

        switch(type) {
            case 'fm':
                this.synth = new Tone.FMSynth().connect(this.effects.filter);
                break;
            case 'am':
                this.synth = new Tone.AMSynth().connect(this.effects.filter);
                break;
            case 'membrane':
                this.synth = new Tone.MembraneSynth().connect(this.effects.filter);
                break;
            default:
                this.synth = new Tone.Synth().connect(this.effects.filter);
        }

        this.updateEnvelope('attack', document.getElementById('attack').value);
        this.updateEnvelope('decay', document.getElementById('decay').value);
        this.updateEnvelope('sustain', document.getElementById('sustain').value);
        this.updateEnvelope('release', document.getElementById('release').value);
    }

    updateEnvelope(param, value) {
        if (this.synth && this.synth.envelope) {
            this.synth.envelope[param] = parseFloat(value);
        }
    }

    updateEffect(effect, param, value) {
        if (this.effects[effect]) {
            this.effects[effect][param] = parseFloat(value);
        }
    }

    startAutoPlay() {
        this.updateBeatPattern();
        Tone.Transport.start();
    }

    updateBeatPattern() {
        // Clear existing pattern
        Tone.Transport.cancel();
        
        // Schedule new pattern
        this.beatPatterns[this.currentPattern].forEach(step => {
            Tone.Transport.schedule((time) => {
                this.synth.triggerAttackRelease(step.note, step.duration, time);
            }, step.time);
        });
    }

    toggleBeat() {
        if (this.isPlaying) {
            Tone.Transport.stop();
        } else {
            Tone.Transport.start();
        }
        this.isPlaying = !this.isPlaying;
    }

    playNote(note, duration = '8n') {
        if (this.synth) {
            this.synth.triggerAttackRelease(note, duration);
        }
    }

    stopNote() {
        if (this.synth) {
            this.synth.triggerRelease();
        }
    }
}

// Initialize audio context on user interaction
document.addEventListener('click', () => {
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
}, { once: true }); 
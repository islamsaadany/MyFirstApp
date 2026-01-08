// Sound Library - Different notification sounds
const SoundLibrary = {
    createAudioContext: function() {
        return new (window.AudioContext || window.webkitAudioContext)();
    },

    sounds: {
        'default': {
            name: 'Default Chime',
            play: function(audioContext, loop = false) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800;
                oscillator.type = 'sine';

                if (loop) {
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    oscillator.start(audioContext.currentTime);
                    return { oscillator, gainNode, stop: () => {
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                        oscillator.stop(audioContext.currentTime + 0.3);
                    }};
                } else {
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.5);
                }
            }
        },
        'bell': {
            name: 'Bell',
            play: function(audioContext, loop = false) {
                if (loop) {
                    return this.createLoopingBell(audioContext);
                } else {
                    this.createBellSound(audioContext, audioContext.currentTime);
                }
            },
            createBellSound: function(audioContext, startTime) {
                const frequencies = [800, 1000, 1200];
                frequencies.forEach((freq, index) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();

                    osc.connect(gain);
                    gain.connect(audioContext.destination);

                    osc.frequency.value = freq;
                    osc.type = 'sine';

                    gain.gain.setValueAtTime(0.2, startTime + index * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, startTime + index * 0.1 + 0.8);

                    osc.start(startTime + index * 0.1);
                    osc.stop(startTime + index * 0.1 + 0.8);
                });
            },
            createLoopingBell: function(audioContext) {
                let isPlaying = true;
                const playBell = () => {
                    if (isPlaying) {
                        this.createBellSound(audioContext, audioContext.currentTime);
                        setTimeout(() => playBell(), 1500);
                    }
                };
                playBell();
                return {
                    stop: () => { isPlaying = false; }
                };
            }
        },
        'chime': {
            name: 'Soft Chime',
            play: function(audioContext, loop = false) {
                if (loop) {
                    return this.createLoopingChime(audioContext);
                } else {
                    this.createChimeSound(audioContext, audioContext.currentTime);
                }
            },
            createChimeSound: function(audioContext, startTime) {
                const notes = [523.25, 659.25, 783.99]; // C, E, G
                notes.forEach((freq, index) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();

                    osc.connect(gain);
                    gain.connect(audioContext.destination);

                    osc.frequency.value = freq;
                    osc.type = 'triangle';

                    gain.gain.setValueAtTime(0.15, startTime + index * 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.01, startTime + index * 0.15 + 1);

                    osc.start(startTime + index * 0.15);
                    osc.stop(startTime + index * 0.15 + 1);
                });
            },
            createLoopingChime: function(audioContext) {
                let isPlaying = true;
                const playChime = () => {
                    if (isPlaying) {
                        this.createChimeSound(audioContext, audioContext.currentTime);
                        setTimeout(() => playChime(), 2000);
                    }
                };
                playChime();
                return {
                    stop: () => { isPlaying = false; }
                };
            }
        },
        'ding': {
            name: 'Ding',
            play: function(audioContext, loop = false) {
                if (loop) {
                    return this.createLoopingDing(audioContext);
                } else {
                    this.createDingSound(audioContext, audioContext.currentTime);
                }
            },
            createDingSound: function(audioContext, startTime) {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.connect(gain);
                gain.connect(audioContext.destination);

                osc.frequency.value = 1200;
                osc.type = 'sine';

                gain.gain.setValueAtTime(0.4, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

                osc.start(startTime);
                osc.stop(startTime + 0.3);
            },
            createLoopingDing: function(audioContext) {
                let isPlaying = true;
                const playDing = () => {
                    if (isPlaying) {
                        this.createDingSound(audioContext, audioContext.currentTime);
                        setTimeout(() => playDing(), 1000);
                    }
                };
                playDing();
                return {
                    stop: () => { isPlaying = false; }
                };
            }
        },
        'gentle': {
            name: 'Gentle Alert',
            play: function(audioContext, loop = false) {
                if (loop) {
                    return this.createLoopingGentle(audioContext);
                } else {
                    this.createGentleSound(audioContext, audioContext.currentTime);
                }
            },
            createGentleSound: function(audioContext, startTime) {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.connect(gain);
                gain.connect(audioContext.destination);

                osc.frequency.setValueAtTime(400, startTime);
                osc.frequency.exponentialRampToValueAtTime(600, startTime + 0.4);
                osc.type = 'sine';

                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);

                osc.start(startTime);
                osc.stop(startTime + 0.6);
            },
            createLoopingGentle: function(audioContext) {
                let isPlaying = true;
                const playGentle = () => {
                    if (isPlaying) {
                        this.createGentleSound(audioContext, audioContext.currentTime);
                        setTimeout(() => playGentle(), 1800);
                    }
                };
                playGentle();
                return {
                    stop: () => { isPlaying = false; }
                };
            }
        }
    },

    playSound: function(soundName, loop = false) {
        const audioContext = this.createAudioContext();
        const sound = this.sounds[soundName] || this.sounds['default'];
        return sound.play(audioContext, loop);
    },

    getSoundName: function(soundKey) {
        return this.sounds[soundKey]?.name || 'Default Chime';
    },

    getAllSounds: function() {
        return Object.keys(this.sounds).map(key => ({
            key: key,
            name: this.sounds[key].name
        }));
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundLibrary;
}

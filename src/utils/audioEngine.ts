/**
 * Web Audio API Engine for AlightStudio
 * Handles synthetic beat playback, frequency analysis for sound-reactive visualizers,
 * and user audio upload decoding.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying = false;
  private currentGenre = 'trap';
  private bpm = 130;
  private timerId: number | null = null;
  private beatStep = 0;
  private masterGain: GainNode | null = null;
  private customAudioElement: HTMLAudioElement | null = null;
  private customSourceNode: MediaElementAudioSourceNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    this.ctx = new AudioCtxClass();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  public setVolume(vol: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, vol));
    }
  }

  public startPlayback(genre = 'trap', bpm = 130) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;
    this.currentGenre = genre;
    this.bpm = bpm;
    this.beatStep = 0;

    // Start synthetic sequencer loop
    const stepInterval = (60 / this.bpm / 4) * 1000; // 16th notes
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = window.setInterval(() => {
      if (!this.isPlaying) return;
      this.triggerStep(this.beatStep % 16);
      this.beatStep++;
    }, stepInterval);
  }

  public stopPlayback() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.customAudioElement) {
      this.customAudioElement.pause();
    }
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(32).fill(0);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  private triggerStep(step: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    if (this.currentGenre === 'trap' || this.currentGenre === 'phonk') {
      // 808 Kick on 0, 8, 10
      if (step === 0 || step === 8 || step === 10) {
        this.playKick(now);
      }
      // Snare / Clap on 4 and 12
      if (step === 4 || step === 12) {
        this.playSnare(now);
      }
      // Rapid trap hi-hats
      if (step % 2 === 0 || (step >= 12 && step % 1 === 0)) {
        this.playHiHat(now, step % 4 === 0 ? 0.35 : 0.2);
      }
    } else if (this.currentGenre === 'lofi') {
      // Smooth laid-back lofi beat
      if (step === 0 || step === 7) {
        this.playLofiKick(now);
      }
      if (step === 4 || step === 12) {
        this.playLofiSnare(now);
      }
      if (step % 4 === 2) {
        this.playLofiChords(now);
      }
    } else {
      // Cinematic pulse
      if (step % 8 === 0) {
        this.playKick(now);
        this.playSynthPulse(now);
      }
    }
  }

  private playKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.35);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  private playLofiKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(90, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.2);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;
    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.15);
  }

  private playLofiSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.12);
  }

  private playHiHat(time: number, vol = 0.3) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.04);
  }

  private playSynthPulse(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65.41, time); // C2

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.6);
  }

  private playLofiChords(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const freqs = [261.63, 329.63, 392.0, 493.88]; // C maj7
    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(time);
      osc.stop(time + 0.8);
    });
  }

  public loadCustomAudioFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      this.init();
      if (!this.ctx) {
        resolve(url);
        return;
      }
      if (this.customAudioElement) {
        this.customAudioElement.pause();
      }
      this.customAudioElement = new Audio(url);
      this.customAudioElement.crossOrigin = 'anonymous';
      if (!this.customSourceNode && this.masterGain) {
        this.customSourceNode = this.ctx.createMediaElementSource(this.customAudioElement);
        this.customSourceNode.connect(this.masterGain);
      }
      resolve(url);
    });
  }
}

export const audioEngine = new AudioEngine();

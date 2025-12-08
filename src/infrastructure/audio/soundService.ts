/**
 * Sound Service - Generate game sounds using Web Audio API
 * No external audio files needed!
 */

type SoundType =
  | "click"
  | "placeMark"
  | "turnStart"
  | "win"
  | "lose"
  | "draw"
  | "gameStart"
  | "error"
  | "playerJoin"
  | "playerReady"
  | "countdown"
  | "chat"
  | "hover";

type BgmType = "waiting" | "game";
type GameBgmStyle = "adventure" | "battle" | "castle" | "tavern" | "tension";

class SoundService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;
  private bgmEnabled: boolean = true;
  private bgmVolume: number = 0.15;
  private bgmInterval: NodeJS.Timeout | null = null;
  private bgmPlaying: boolean = false;
  private currentBgmType: BgmType | null = null;
  private gameBgmStyle: GameBgmStyle = "tavern";

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopBgm();
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }

  // BGM Controls
  setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.stopBgm();
    }
  }

  setBgmVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
  }

  isBgmEnabled(): boolean {
    return this.bgmEnabled;
  }

  isBgmPlaying(): boolean {
    return this.bgmPlaying;
  }

  setGameBgmStyle(style: GameBgmStyle) {
    this.gameBgmStyle = style;
    // If any BGM is playing, restart with new style (switch to game BGM)
    if (this.bgmPlaying) {
      this.stopBgm();
      this.startBgm("game");
    }
  }

  getGameBgmStyle(): GameBgmStyle {
    return this.gameBgmStyle;
  }

  /**
   * Play a sound effect
   */
  play(type: SoundType) {
    if (!this.enabled || typeof window === "undefined") return;

    try {
      const ctx = this.getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      switch (type) {
        case "click":
          this.playClickSound(ctx);
          break;
        case "placeMark":
          this.playPlaceMarkSound(ctx);
          break;
        case "turnStart":
          this.playTurnSound(ctx);
          break;
        case "win":
          this.playWinSound(ctx);
          break;
        case "lose":
          this.playLoseSound(ctx);
          break;
        case "draw":
          this.playDrawSound(ctx);
          break;
        case "gameStart":
          this.playGameStartSound(ctx);
          break;
        case "error":
          this.playErrorSound(ctx);
          break;
        case "playerJoin":
          this.playPlayerJoinSound(ctx);
          break;
        case "playerReady":
          this.playPlayerReadySound(ctx);
          break;
        case "countdown":
          this.playCountdownSound(ctx);
          break;
        case "chat":
          this.playChatSound(ctx);
          break;
        case "hover":
          this.playHoverSound(ctx);
          break;
      }
    } catch (e) {
      console.warn("Sound play failed:", e);
    }
  }

  // Simple click
  private playClickSound(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  }

  // Place mark - satisfying snap
  private playPlaceMarkSound(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);

    // Add a second pop
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(1200, ctx.currentTime + 0.05);
    gain2.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc2.start(ctx.currentTime + 0.05);
    osc2.stop(ctx.currentTime + 0.1);
  }

  // Turn start - notification ding
  private playTurnSound(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  // Win - happy ascending melody
  private playWinSound(ctx: AudioContext) {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.12;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  }

  // Lose - sad descending melody
  private playLoseSound(ctx: AudioContext) {
    const notes = [392, 349, 330, 262]; // G4, F4, E4, C4

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.2;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  // Draw - neutral sound
  private playDrawSound(ctx: AudioContext) {
    const notes = [440, 440, 330]; // A4, A4, E4

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.15;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  // Game start - fanfare
  private playGameStartSound(ctx: AudioContext) {
    const notes = [262, 330, 392, 523]; // C4, E4, G4, C5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.08;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  // Error - buzz
  private playErrorSound(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(150, ctx.currentTime);

    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  // Player join - welcome chime
  private playPlayerJoinSound(ctx: AudioContext) {
    const notes = [440, 554, 659]; // A4, C#5, E5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.1;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  }

  // Player ready - confirmation sound
  private playPlayerReadySound(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  // Countdown tick
  private playCountdownSound(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(600, ctx.currentTime);

    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  // Chat notification
  private playChatSound(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  // Hover sound - very soft
  private playHoverSound(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(600, ctx.currentTime);

    gain.gain.setValueAtTime(this.volume * 0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.02);
  }

  // Background music - ambient loop
  startBgm(type: BgmType = "waiting") {
    if (!this.bgmEnabled || typeof window === "undefined") return;

    // If already playing same type, do nothing
    if (this.bgmPlaying && this.currentBgmType === type) return;

    // Stop current BGM if switching types
    if (this.bgmPlaying) {
      this.stopBgm();
    }

    this.bgmPlaying = true;
    this.currentBgmType = type;

    if (type === "waiting") {
      this.playWaitingBgm();
    } else {
      this.playGameBgm();
    }
  }

  // Waiting room BGM - 16-bit retro game style
  private playWaitingBgm() {
    // 16-bit style melody - cheerful waiting theme
    const melodyPattern = [
      392.0,
      440.0,
      493.88,
      523.25, // G4, A4, B4, C5 - ascending
      493.88,
      440.0,
      392.0,
      329.63, // B4, A4, G4, E4 - descending
      349.23,
      392.0,
      440.0,
      392.0, // F4, G4, A4, G4 - bounce
      329.63,
      293.66,
      261.63,
      293.66, // E4, D4, C4, D4 - resolve
    ];

    // Bass pattern - simple but groovy
    const bassPattern = [
      130.81,
      130.81,
      98.0,
      98.0, // C3, C3, G2, G2
      110.0,
      110.0,
      87.31,
      98.0, // A2, A2, F2, G2
    ];

    // Arpeggio chords for that 16-bit sparkle
    const arpeggioChords = [
      [261.63, 329.63, 392.0], // C major
      [220.0, 261.63, 329.63], // A minor
      [174.61, 220.0, 261.63], // F major
      [196.0, 246.94, 293.66], // G major
    ];

    let stepIndex = 0;

    const play16BitBeat = () => {
      if (
        !this.bgmPlaying ||
        !this.bgmEnabled ||
        this.currentBgmType !== "waiting"
      )
        return;

      try {
        const ctx = this.getAudioContext();
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const vol = this.bgmVolume;

        // === MELODY (Square wave - classic 16-bit sound) ===
        const melodyNote = melodyPattern[stepIndex % melodyPattern.length];
        const melOsc = ctx.createOscillator();
        const melGain = ctx.createGain();

        melOsc.type = "square";
        melOsc.connect(melGain);
        melGain.connect(ctx.destination);

        melOsc.frequency.setValueAtTime(melodyNote, now);
        melGain.gain.setValueAtTime(vol * 0.08, now);
        melGain.gain.linearRampToValueAtTime(vol * 0.06, now + 0.1);
        melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        melOsc.start(now);
        melOsc.stop(now + 0.2);

        // === BASS (Triangle wave - warm 16-bit bass) ===
        const bassNote = bassPattern[stepIndex % bassPattern.length];
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();

        bassOsc.type = "triangle";
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);

        bassOsc.frequency.setValueAtTime(bassNote, now);
        bassGain.gain.setValueAtTime(vol * 0.12, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        bassOsc.start(now);
        bassOsc.stop(now + 0.18);

        // === ARPEGGIO (Every 4 steps - sparkly effect) ===
        if (stepIndex % 4 === 0) {
          const chordIndex = Math.floor(stepIndex / 4) % arpeggioChords.length;
          const chord = arpeggioChords[chordIndex];

          chord.forEach((note, i) => {
            const arpOsc = ctx.createOscillator();
            const arpGain = ctx.createGain();

            arpOsc.type = "square";
            arpOsc.connect(arpGain);
            arpGain.connect(ctx.destination);

            const noteTime = now + i * 0.05;
            arpOsc.frequency.setValueAtTime(note * 2, noteTime); // One octave up

            arpGain.gain.setValueAtTime(0, noteTime);
            arpGain.gain.linearRampToValueAtTime(vol * 0.04, noteTime + 0.02);
            arpGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);

            arpOsc.start(noteTime);
            arpOsc.stop(noteTime + 0.15);
          });
        }

        // === DRUM (Noise-based - every 2 steps) ===
        if (stepIndex % 2 === 0) {
          // Kick-like sound
          const kickOsc = ctx.createOscillator();
          const kickGain = ctx.createGain();

          kickOsc.type = "sine";
          kickOsc.connect(kickGain);
          kickGain.connect(ctx.destination);

          kickOsc.frequency.setValueAtTime(150, now);
          kickOsc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
          kickGain.gain.setValueAtTime(vol * 0.15, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

          kickOsc.start(now);
          kickOsc.stop(now + 0.1);
        }

        // Hi-hat on off-beats
        if (stepIndex % 2 === 1) {
          const bufferSize = ctx.sampleRate * 0.02;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
          }

          const noise = ctx.createBufferSource();
          const noiseGain = ctx.createGain();
          const noiseFilter = ctx.createBiquadFilter();

          noise.buffer = buffer;
          noiseFilter.type = "highpass";
          noiseFilter.frequency.value = 7000;

          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(ctx.destination);

          noiseGain.gain.setValueAtTime(vol * 0.05, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

          noise.start(now);
          noise.stop(now + 0.03);
        }

        stepIndex++;
      } catch (e) {
        console.warn("Waiting BGM failed:", e);
      }
    };

    play16BitBeat();
    this.bgmInterval = setInterval(play16BitBeat, 180); // Fast 16-bit tempo (~166 BPM)
  }

  // Game BGM - Dragon Quest inspired styles
  private playGameBgm() {
    switch (this.gameBgmStyle) {
      case "adventure":
        this.playAdventureBgm();
        break;
      case "battle":
        this.playBattleBgm();
        break;
      case "castle":
        this.playCastleBgm();
        break;
      case "tavern":
        this.playTavernBgm();
        break;
      case "tension":
        this.playTensionBgm();
        break;
    }
  }

  // Adventure BGM - Heroic overworld theme
  private playAdventureBgm() {
    let noteIndex = 0;
    const melody = [
      { note: 392, dur: 0.3 },
      { note: 440, dur: 0.15 },
      { note: 494, dur: 0.3 },
      { note: 523, dur: 0.45 },
      { note: 494, dur: 0.15 },
      { note: 440, dur: 0.3 },
      { note: 392, dur: 0.45 },
      { note: 330, dur: 0.3 },
    ];

    const playNote = () => {
      if (
        !this.bgmPlaying ||
        this.currentBgmType !== "game" ||
        this.gameBgmStyle !== "adventure"
      )
        return;

      try {
        const ctx = this.getAudioContext();
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        const { note, dur } = melody[noteIndex % melody.length];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(note, now);
        gain.gain.setValueAtTime(this.bgmVolume * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
        osc.start(now);
        osc.stop(now + dur);

        if (noteIndex % 2 === 0) {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = "sine";
          bassOsc.connect(bassGain);
          bassGain.connect(ctx.destination);
          bassOsc.frequency.setValueAtTime(note / 2, now);
          bassGain.gain.setValueAtTime(this.bgmVolume * 0.2, now);
          bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          bassOsc.start(now);
          bassOsc.stop(now + 0.4);
        }

        noteIndex++;
      } catch (e) {
        console.warn("Adventure BGM failed:", e);
      }
    };

    playNote();
    this.bgmInterval = setInterval(playNote, 350);
  }

  // Battle BGM - Intense combat
  private playBattleBgm() {
    let beatIndex = 0;

    const playBeat = () => {
      if (
        !this.bgmPlaying ||
        this.currentBgmType !== "game" ||
        this.gameBgmStyle !== "battle"
      )
        return;

      try {
        const ctx = this.getAudioContext();
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        const bassPattern = [147, 147, 165, 147, 175, 165, 147, 131];
        const bass = bassPattern[beatIndex % bassPattern.length];

        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = "sawtooth";
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.frequency.setValueAtTime(bass, now);
        bassGain.gain.setValueAtTime(this.bgmVolume * 0.15, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        bassOsc.start(now);
        bassOsc.stop(now + 0.15);

        if (beatIndex % 2 === 1) {
          const melodyNotes = [587, 659, 698, 784];
          const mel =
            melodyNotes[Math.floor(beatIndex / 2) % melodyNotes.length];
          const melOsc = ctx.createOscillator();
          const melGain = ctx.createGain();
          melOsc.type = "square";
          melOsc.connect(melGain);
          melGain.connect(ctx.destination);
          melOsc.frequency.setValueAtTime(mel, now);
          melGain.gain.setValueAtTime(this.bgmVolume * 0.1, now);
          melGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          melOsc.start(now);
          melOsc.stop(now + 0.1);
        }

        beatIndex++;
      } catch (e) {
        console.warn("Battle BGM failed:", e);
      }
    };

    playBeat();
    this.bgmInterval = setInterval(playBeat, 180);
  }

  // Castle BGM - Royal/majestic
  private playCastleBgm() {
    let noteIndex = 0;
    const melody = [
      { notes: [262, 330, 392], dur: 0.6 },
      { notes: [294, 370, 440], dur: 0.6 },
      { notes: [330, 415, 494], dur: 0.6 },
      { notes: [349, 440, 523], dur: 0.9 },
      { notes: [330, 415, 494], dur: 0.6 },
      { notes: [294, 370, 440], dur: 0.6 },
      { notes: [262, 330, 392], dur: 0.9 },
    ];

    const playChord = () => {
      if (
        !this.bgmPlaying ||
        this.currentBgmType !== "game" ||
        this.gameBgmStyle !== "castle"
      )
        return;

      try {
        const ctx = this.getAudioContext();
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        const { notes, dur } = melody[noteIndex % melody.length];

        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.connect(gain);
          gain.connect(ctx.destination);

          const startTime = now + i * 0.08;
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(
            this.bgmVolume * 0.2,
            startTime + 0.1
          );
          gain.gain.linearRampToValueAtTime(
            this.bgmVolume * 0.15,
            startTime + dur * 0.5
          );
          gain.gain.linearRampToValueAtTime(0, startTime + dur);

          osc.start(startTime);
          osc.stop(startTime + dur);
        });

        noteIndex++;
      } catch (e) {
        console.warn("Castle BGM failed:", e);
      }
    };

    playChord();
    this.bgmInterval = setInterval(playChord, 700);
  }

  // Tavern BGM - Cheerful/relaxed (Best for board games)
  private playTavernBgm() {
    let beatIndex = 0;
    const melody = [392, 440, 494, 523, 494, 440, 392, 330];

    const playBeat = () => {
      if (
        !this.bgmPlaying ||
        this.currentBgmType !== "game" ||
        this.gameBgmStyle !== "tavern"
      )
        return;

      try {
        const ctx = this.getAudioContext();
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;

        const bassNote = beatIndex % 2 === 0 ? 196 : 147;
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = "sine";
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.frequency.setValueAtTime(bassNote, now);
        bassGain.gain.setValueAtTime(this.bgmVolume * 0.2, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        bassOsc.start(now);
        bassOsc.stop(now + 0.2);

        const mel = melody[beatIndex % melody.length];
        const melOsc = ctx.createOscillator();
        const melGain = ctx.createGain();
        melOsc.type = "triangle";
        melOsc.connect(melGain);
        melGain.connect(ctx.destination);
        melOsc.frequency.setValueAtTime(mel, now);
        melGain.gain.setValueAtTime(this.bgmVolume * 0.18, now);
        melGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        melOsc.start(now);
        melOsc.stop(now + 0.25);

        if (beatIndex % 4 === 0) {
          [294, 370, 440, 494].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(freq, now + i * 0.03);
            gain.gain.setValueAtTime(this.bgmVolume * 0.1, now + i * 0.03);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.03 + 0.15);
            osc.start(now + i * 0.03);
            osc.stop(now + i * 0.03 + 0.15);
          });
        }

        beatIndex++;
      } catch (e) {
        console.warn("Tavern BGM failed:", e);
      }
    };

    playBeat();
    this.bgmInterval = setInterval(playBeat, 280);
  }

  // Tension BGM - Suspenseful
  private playTensionBgm() {
    let beatIndex = 0;

    const playBeat = () => {
      if (
        !this.bgmPlaying ||
        this.currentBgmType !== "game" ||
        this.gameBgmStyle !== "tension"
      )
        return;

      try {
        const ctx = this.getAudioContext();
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;

        const droneFreq = 65 + Math.sin(beatIndex * 0.2) * 5;
        const droneOsc = ctx.createOscillator();
        const droneGain = ctx.createGain();
        droneOsc.type = "sine";
        droneOsc.connect(droneGain);
        droneGain.connect(ctx.destination);
        droneOsc.frequency.setValueAtTime(droneFreq, now);
        droneGain.gain.setValueAtTime(this.bgmVolume * 0.15, now);
        droneGain.gain.linearRampToValueAtTime(this.bgmVolume * 0.1, now + 0.8);
        droneOsc.start(now);
        droneOsc.stop(now + 0.8);

        if (beatIndex % 4 === 0 || beatIndex % 4 === 1) {
          const beatOsc = ctx.createOscillator();
          const beatGain = ctx.createGain();
          beatOsc.type = "sine";
          beatOsc.connect(beatGain);
          beatGain.connect(ctx.destination);
          beatOsc.frequency.setValueAtTime(55, now);
          const vol = beatIndex % 4 === 0 ? 0.25 : 0.15;
          beatGain.gain.setValueAtTime(this.bgmVolume * vol, now);
          beatGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          beatOsc.start(now);
          beatOsc.stop(now + 0.15);
        }

        beatIndex++;
      } catch (e) {
        console.warn("Tension BGM failed:", e);
      }
    };

    playBeat();
    this.bgmInterval = setInterval(playBeat, 400);
  }

  stopBgm() {
    this.bgmPlaying = false;
    this.currentBgmType = null;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  getCurrentBgmType(): BgmType | null {
    return this.currentBgmType;
  }

  toggleBgm(type?: BgmType) {
    if (this.bgmPlaying) {
      this.stopBgm();
    } else {
      this.startBgm(type || "waiting");
    }
    return this.bgmPlaying;
  }
}

// Singleton instance
export const soundService = new SoundService();

// Tactile Web Audio Synthesizer for Tabletop Board Game feedback

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
}

export function getSoundMuted(): boolean {
  return isMuted;
}

export function playTapSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Ignore audio error gracefully
  }
}

export function playChitSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // Ignore audio error gracefully
  }
}

export function playDiceRollSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (isMuted) return;
        try {
          const innerCtx = getAudioContext();
          if (!innerCtx) return;
          const osc = innerCtx.createOscillator();
          const gain = innerCtx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(240 + Math.random() * 260, innerCtx.currentTime);
          gain.gain.setValueAtTime(0.12, innerCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, innerCtx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(innerCtx.destination);
          osc.start();
          osc.stop(innerCtx.currentTime + 0.05);
        } catch {
          // Ignore
        }
      }, i * 65);
    }
  } catch {
    // Ignore
  }
}

export function playVictorySound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (isMuted) return;
        try {
          const innerCtx = getAudioContext();
          if (!innerCtx) return;
          const osc = innerCtx.createOscillator();
          const gain = innerCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, innerCtx.currentTime);
          gain.gain.setValueAtTime(0.18, innerCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, innerCtx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(innerCtx.destination);
          osc.start();
          osc.stop(innerCtx.currentTime + 0.25);
        } catch {
          // Ignore
        }
      }, idx * 90);
    });
  } catch {
    // Ignore
  }
}

export function playTurnPassSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch {
    // Ignore
  }
}

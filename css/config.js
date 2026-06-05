/* js/config.js
   Entrena Consulting SAS – Pausa Activa
   v2.3 – Dificultad progresiva cada segundo · 60s */

'use strict';

const CONFIG = {
  BASE_W: 900,
  BASE_H: 468,

  WALL_W_RATIO:  0.10,
  WIN_Y_RATIO:   0.18,
  WIN2_Y_RATIO:  0.44,
  WIN_W_RATIO:   0.055,
  WIN_H_RATIO:   0.09,
  FLOOR_RATIO:   0.895,

  TRUCK_X_RATIO: 0.60,
  TRUCK_W_RATIO: 0.18,
  TRUCK_H_RATIO: 0.17,
  CROWD_X_RATIO: 0.82,

  /* ── Personaje que cae – valores BASE (segundo 0) ── */
  JP: {
    VX_MIN:      0.55,
    VX_MAX:      1.0,
    VY_MIN:     -2.0,
    VY_MAX:     -1.0,
    GRAVITY:     0.048,
    GRAVITY_VAR: 0.012,
    WOBBLE_MAX:  0.035,
    WOBBLE_STEP: 0.0018,
    VX_MAX_ABS:  4.0,   // techo absoluto de velocidad horizontal
  },

  /* ── Dificultad progresiva ──────────────────────────
     Cada segundo el factor sube: 1 + segundo * STEP
     Con STEP=0.025 y 60s → factor final = 2.5
     Velocidad aumenta suavemente de 1× a 2.5×          */
  DIFFICULTY: {
    STEP:      0.025,  // incremento por segundo transcurrido
    MAX_FACTOR: 2.5,   // techo máximo

    /* Niveles visuales mostrados en el HUD */
    LEVELS: [
      { min: 1.00, label: '😌 CALMA',    color: '#00ff88' },
      { min: 1.35, label: '🏃 ACTIVO',   color: '#ffe600' },
      { min: 1.75, label: '⚡ INTENSO',  color: '#ff9900' },
      { min: 2.15, label: '🔥 ¡MÁXIMO!', color: '#ff3333' },
    ],
  },

  /* ── Rescatista ── */
  RESCUER: {
    MAX_SPEED: 3.2,
    ACCEL:     0.18,
    DECEL:     0.28,
    W_RATIO:   0.040,
    H_RATIO:   0.065,
    DEAD_ZONE: 18,
  },

  SMOKE_PER_FRAME: 1,

  TIMER_SECONDS:   60,
  MISS_DELAY_MS:   1400,
  RESCUE_DELAY_MS: 1000,
  ONOMATO_FRAMES:  90,

  CROWD_COLORS: [
    '#ff6b6b','#ffd93d','#6bcb77','#4d96ff',
    '#ff9ff3','#f8a978','#a29bfe','#fd79a8',
  ],
};

/* ── Factor de dificultad según segundos transcurridos ── */
function getDifficultyFactor() {
  const elapsed = CONFIG.TIMER_SECONDS - State.timeLeft;
  return Math.min(1 + elapsed * CONFIG.DIFFICULTY.STEP, CONFIG.DIFFICULTY.MAX_FACTOR);
}

/* ── Nivel visual actual ── */
function getDifficultyLevel() {
  const f   = getDifficultyFactor();
  let level = CONFIG.DIFFICULTY.LEVELS[0];
  for (const l of CONFIG.DIFFICULTY.LEVELS) {
    if (f >= l.min) level = l;
  }
  return { ...level, factor: f };
}

/* ── Dimensiones absolutas ── */
function buildDimensions(W, H) {
  const WALL_W = Math.round(W * CONFIG.WALL_W_RATIO);
  const WIN_W  = Math.round(W * CONFIG.WIN_W_RATIO);
  const WIN_H  = Math.round(H * CONFIG.WIN_H_RATIO);
  return {
    W, H, WALL_W,
    FLOOR:   Math.round(H * CONFIG.FLOOR_RATIO),
    WIN_X:   WALL_W - Math.round(W * 0.012),
    WIN_Y:   Math.round(H * CONFIG.WIN_Y_RATIO),
    WIN2_Y:  Math.round(H * CONFIG.WIN2_Y_RATIO),
    WIN_W, WIN_H,
    TRUCK_X: Math.round(W * CONFIG.TRUCK_X_RATIO),
    TRUCK_W: Math.round(W * CONFIG.TRUCK_W_RATIO),
    TRUCK_H: Math.round(H * CONFIG.TRUCK_H_RATIO),
    CROWD_X: Math.round(W * CONFIG.CROWD_X_RATIO),
    SCALE:   W / CONFIG.BASE_W,
  };
}

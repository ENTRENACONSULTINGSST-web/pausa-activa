/* js/physics.js
   Entrena Consulting SAS – Pausa Activa
   v2.3 – Velocidades escaladas por factor de dificultad cada segundo */

'use strict';

const rnd = (a, b) => Math.random() * (b - a) + a;

/* ════════ HUMO ════════ */
function spawnSmoke(dim) {
  const add = (sx, sy) => State.smoke.push({
    x: sx + rnd(-4, 4), y: sy + rnd(-4, 2),
    vx: rnd(-0.25, 0.25), vy: rnd(-0.55, -0.22),
    life: rnd(40, 75), maxLife: 70, r: rnd(4, 9),
  });
  const { WIN_X, WIN_Y, WIN2_Y, WIN_W } = dim;
  for (let i = 0; i < CONFIG.SMOKE_PER_FRAME; i++) {
    add(WIN_X + WIN_W * 0.5, WIN_Y);
    add(WIN_X + WIN_W * 0.5, WIN2_Y);
  }
}

function updateSmoke() {
  State.smoke = State.smoke.filter(p => p.life > 0);
  State.smoke.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; });
}

/* ════════ PERSONAJE QUE CAE ════════ */
function spawnJP() {
  const { WIN_X, WIN_W, WIN_Y, WIN_H, SCALE } = State.dim;
  const c  = CONFIG.JP;
  const df = getDifficultyFactor();   // ← factor actual al momento de nacer

  /* Velocidades BASE × factor de dificultad × escala del canvas */
  const sc = SCALE * df;

  State.jp = {
    x:        WIN_X + WIN_W / 2,
    y:        WIN_Y + WIN_H / 2,
    vx:       rnd(c.VX_MIN, c.VX_MAX) * sc,
    vy:       rnd(c.VY_MIN, c.VY_MAX) * sc,
    gravity:  (c.GRAVITY + rnd(0, c.GRAVITY_VAR)) * SCALE * (0.8 + df * 0.2),
    wobble:   0,
    vxMax:    c.VX_MAX_ABS * SCALE,
    alive:    true,
    caught:   false,
    showMiss: false,
    frame:    0,
  };
}

function updateJP() {
  const jp = State.jp;
  if (!jp || !jp.alive) return;

  const { WALL_W, FLOOR, TRUCK_X, SCALE } = State.dim;
  const c = CONFIG.JP;

  jp.frame++;

  /* Wobble con límite */
  jp.wobble += rnd(-c.WOBBLE_STEP, c.WOBBLE_STEP) * SCALE;
  jp.wobble  = Math.max(-c.WOBBLE_MAX * SCALE, Math.min(c.WOBBLE_MAX * SCALE, jp.wobble));
  jp.vx     += jp.wobble;
  jp.vx      = Math.max(-jp.vxMax, Math.min(jp.vxMax, jp.vx));  // límite duro

  jp.x  += jp.vx;
  jp.vy += jp.gravity;
  jp.y  += jp.vy;

  /* Rebotar en paredes */
  if (jp.x < WALL_W + 4)   { jp.x = WALL_W + 4;   jp.vx =  Math.abs(jp.vx) * 0.55; }
  if (jp.x > TRUCK_X - 10) { jp.x = TRUCK_X - 10; jp.vx = -Math.abs(jp.vx) * 0.55; }

  /* ── Colisión con rescatista – hitbox generoso ── */
  const r = State.rescuer;
  if (r && !jp.caught) {
    const halfW  = r.w * 0.7;
    const catchY = r.y - 30;
    if (jp.x > r.x - halfW && jp.x < r.x + r.w + halfW &&
        jp.y > catchY       && jp.y < r.y + r.h + 8) {
      jp.caught = jp.alive = false;
      r.carrying = true;
      State.score++;
      State.rescuedAnim = { x: jp.x, y: jp.y, t: 45 };
      showOnomato('¡Eeeh!', '#fff176', '#f9a825', '#333');
      vibrate();
      setTimeout(() => {
        if (State.rescuer) State.rescuer.carrying = false;
        if (State.running) spawnJP();
      }, CONFIG.RESCUE_DELAY_MS);
    }
  }

  /* Caída al suelo */
  if (!jp.caught && jp.y >= FLOOR + 8) {
    jp.alive = false;
    State.misses++;
    showOnomato('¡Oooh!', '#ff6b6b', '#cc0000', '#fff');
    setTimeout(() => { if (State.running) spawnJP(); }, CONFIG.MISS_DELAY_MS);
  }
}

/* ════════ RESCATISTA ════════ */
function spawnRescuer() {
  const { W, H, FLOOR, WALL_W } = State.dim;
  const c = CONFIG.RESCUER;
  State.rescuer = {
    x:        W / 2 - 10,
    y:        FLOOR - Math.round(H * 0.07),
    vx:       0,
    speed:    0,
    maxSpeed: c.MAX_SPEED,
    accel:    c.ACCEL,
    decel:    c.DECEL,
    w:        Math.round(W * c.W_RATIO),
    h:        Math.round(H * c.H_RATIO),
    frame:    0,
    carrying: false,
  };
}

function updateRescuer(keys, touchX) {
  const r = State.rescuer;
  if (!r) return;
  const { WALL_W, TRUCK_X } = State.dim;
  const DEAD = CONFIG.RESCUER.DEAD_ZONE;
  r.frame++;

  let dir = 0, moving = false;

  if (keys.left)       { dir = -1; moving = true; }
  else if (keys.right) { dir =  1; moving = true; }
  else if (touchX !== null) {
    const diff = touchX - (r.x + r.w / 2);
    if (Math.abs(diff) > DEAD) {
      dir    = diff < 0 ? -1 : 1;
      moving = true;
      /* Velocidad proporcional a distancia del dedo */
      const ratio = Math.min(Math.abs(diff) / 110, 1);
      r.speed = Math.min(r.speed + r.accel, r.maxSpeed * ratio);
      r.vx    = dir * r.speed;
      r.x     = Math.max(WALL_W, Math.min(TRUCK_X - r.w - 4, r.x + r.vx));
      return;
    }
  }

  if (moving) {
    r.speed = Math.min(r.speed + r.accel, r.maxSpeed);
    r.vx    = dir * r.speed;
  } else {
    r.speed = Math.max(0, r.speed - r.decel);
    r.vx   *= 0.65;
  }

  r.x = Math.max(WALL_W, Math.min(TRUCK_X - r.w - 4, r.x + r.vx));
}

/* ════════ ONOMATOPEYA ════════ */
function showOnomato(text, bg, border, color) {
  State.onomatoAnim = { text, bg, border, color,
    t: CONFIG.ONOMATO_FRAMES, maxT: CONFIG.ONOMATO_FRAMES };
}

/* ════════ VIBRACIÓN ════════ */
function vibrate() {
  if (navigator.vibrate) navigator.vibrate([50, 20, 60]);
}

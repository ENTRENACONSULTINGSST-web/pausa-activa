/* js/game.js
   Entrena Consulting SAS – Pausa Activa
   v2.3 – Indicador de dificultad · barra de progreso · velocidad por segundo */

'use strict';

const canvas   = document.getElementById('gameCanvas');
const ctx      = canvas.getContext('2d');
const overlay  = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

let _rafId  = null;
let _lastTs = 0;

/* ════════ RESIZE ════════ */
function resize() {
  const container = document.getElementById('canvasContainer');
  const W = container.clientWidth;
  const H = Math.round(W * (CONFIG.BASE_H / CONFIG.BASE_W));
  canvas.width  = W;
  canvas.height = H;
  State.dim = buildDimensions(W, H);
}

let _resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    resize();
    if (State.rescuer && State.dim) {
      const { WALL_W, TRUCK_X, FLOOR, H } = State.dim;
      const r = State.rescuer;
      r.x = Math.max(WALL_W, Math.min(TRUCK_X - r.w - 4, r.x));
      r.y = FLOOR - Math.round(H * 0.07);
    }
  }, 80);
});

/* ════════ INDICADOR DE DIFICULTAD EN CANVAS ════════ */
function drawDifficultyHUD(ctx, dim) {
  const { W, H, WALL_W } = dim;
  const lv     = getDifficultyLevel();
  const factor = lv.factor;

  /* ── Barra de progreso de velocidad ── */
  const barX  = WALL_W + 6;
  const barY  = H - 18;
  const barW  = Math.round(W * 0.30);
  const barH  = 8;
  const fill  = Math.min((factor - 1) / (CONFIG.DIFFICULTY.MAX_FACTOR - 1), 1);

  /* Fondo barra */
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(barX - 2, barY - 14, barW + 60, 24);

  /* Track gris */
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY, barW, barH);

  /* Relleno con color del nivel */
  ctx.fillStyle = lv.color;
  ctx.fillRect(barX, barY, Math.round(barW * fill), barH);

  /* Borde */
  ctx.strokeStyle = '#555';
  ctx.lineWidth   = 1;
  ctx.strokeRect(barX, barY, barW, barH);

  /* Etiqueta de nivel */
  ctx.fillStyle = lv.color;
  ctx.font      = `bold ${Math.round(H * 0.032)}px Courier New`;
  ctx.fillText(lv.label, barX + barW + 6, barY + 7);

  /* Porcentaje de velocidad */
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font      = `${Math.round(H * 0.025)}px Courier New`;
  ctx.fillText(`×${factor.toFixed(1)}`, barX, barY - 4);
}

/* ════════ LOOP PRINCIPAL ════════ */
function loop(ts) {
  if (!State.running) return;

  _lastTs = ts;
  State.frame++;

  const dim = State.dim;
  const { W, H, WALL_W, WIN_X, WIN_Y, WIN2_Y, WIN_W, WIN_H, FLOOR } = dim;

  /* Física */
  spawnSmoke(dim);
  updateSmoke();
  updateRescuer(Input.keys, Input.touchX);
  updateJP();

  /* Dibujo */
  ctx.clearRect(0, 0, W, H);
  drawBackground(ctx, dim);
  drawBricks(ctx, 0, 0, WALL_W, H);
  drawWindow(ctx, WIN_X, WIN_Y,  WIN_W, WIN_H);
  drawWindow(ctx, WIN_X, WIN2_Y, WIN_W, WIN_H);
  drawSmoke(ctx);
  drawFloor(ctx, dim);
  drawFireTruck(ctx, dim);
  drawCrowd(ctx, dim);

  /* Rescatista */
  if (State.rescuer) {
    const r = State.rescuer;
    /* Zona de captura visual (sutil) */
    ctx.save();
    ctx.globalAlpha = 0.10;
    ctx.fillStyle   = '#00ff88';
    ctx.fillRect(r.x - r.w * 0.7, r.y - 28, r.w * 2.4, 14);
    ctx.restore();
    drawStickFigure(ctx, r.x + r.w / 2, r.y, 1.2, '#00ff88', false, r.frame, r.carrying);
  }

  /* Personaje que cae + sombra */
  const jp = State.jp;
  if (jp && jp.alive) {
    const shadowA = Math.max(0, 1 - (jp.y / FLOOR) * 0.88) * 0.28;
    ctx.save();
    ctx.globalAlpha = shadowA;
    ctx.fillStyle   = '#000';
    ctx.beginPath();
    ctx.ellipse(jp.x, FLOOR + 2, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawStickFigure(ctx, jp.x, jp.y, 1, jp.caught ? '#ffcc00' : '#ff8888', true, jp.frame, false);
  }

  drawOnomato(ctx, dim);
  drawRescuedAnim(ctx, dim);
  drawDifficultyHUD(ctx, dim);   // ← indicador de velocidad/nivel

  _rafId = requestAnimationFrame(loop);
}

/* ════════ TIMER – sube dificultad cada segundo ════════ */
function startTimer() {
  if (State.timerInterval) clearInterval(State.timerInterval);
  State.timerInterval = setInterval(() => {
    State.timeLeft--;
    State.updateHUD();

    /* Flash en el HUD del nivel cuando cambia */
    const lv = getDifficultyLevel();
    const timerEl = document.getElementById('timerEl');
    timerEl.style.color = lv.color;

    if (State.timeLeft <= 0) {
      clearInterval(State.timerInterval);
      State.timerInterval = null;
      State.running = false;
      if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
      showEndScreen();
    }
  }, 1000);
}

/* ════════ INICIAR PARTIDA ════════ */
function startGame() {
  if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  State.reset();
  resize();
  overlay.classList.add('hidden');
  State.running = true;
  spawnRescuer();
  spawnJP();
  startTimer();
  State.updateHUD();
  _lastTs = performance.now();
  _rafId  = requestAnimationFrame(loop);
}

/* ════════ PANTALLA FINAL ════════ */
function showEndScreen() {
  const total = State.score + State.misses;
  const pct   = total > 0 ? Math.round(State.score / total * 100) : 0;
  const star  = pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪';
  const msg   = pct >= 80 ? '¡Excelente trabajo de equipo!'
              : pct >= 50 ? '¡Buen intento, sigue practicando!'
              : '¡La práctica hace al maestro!';

  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <h2 style="color:#ffe600">⬛ FIN DE RONDA ⬛</h2>
    <p class="overlay-brand">ENTRENA CONSULTING SAS</p>
    <p class="overlay-emoji">${star}</p>
    <p style="color:#aef;font-size:clamp(10px,1.8vw,14px);margin:4px 0">${msg}</p>
    <p class="overlay-score">
      RESCATADOS: <b style="color:#00ff88">${State.score}</b> &nbsp;|&nbsp;
      CAÍDAS: <b style="color:#ff7777">${State.misses}</b> &nbsp;|&nbsp;
      EFECTIVIDAD: <b style="color:#ffe600">${pct}%</b>
    </p>
    <p style="color:#444;font-size:10px;margin-top:6px">pausa activa · entrena consulting sas</p>
    <button id="restartBtn">▶ JUGAR DE NUEVO</button>
  `;
  document.getElementById('restartBtn').addEventListener('click', startGame);
}

/* ════════ BOOT ════════ */
(function init() {
  resize();
  Input.init(canvas);
  startBtn.addEventListener('click', startGame);

  /* Preview estática */
  const dim = State.dim;
  drawBackground(ctx, dim);
  drawBricks(ctx, 0, 0, dim.WALL_W, dim.H);
  drawWindow(ctx, dim.WIN_X, dim.WIN_Y,  dim.WIN_W, dim.WIN_H);
  drawWindow(ctx, dim.WIN_X, dim.WIN2_Y, dim.WIN_W, dim.WIN_H);
  drawFloor(ctx, dim);
  drawFireTruck(ctx, dim);
  drawCrowd(ctx, dim);
})();

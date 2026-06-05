/* js/state.js
   Estado global mutable. Un único objeto para facilitar el reset.
   Entrena Consulting SAS – Pausa Activa */

'use strict';

const State = {
  /* ── Puntuación ── */
  score:    0,
  misses:   0,
  timeLeft: CONFIG.TIMER_SECONDS,

  /* ── Control de flujo ── */
  running:  false,
  timerInterval: null,

  /* ── Dimensiones dinámicas (recalculadas en resize) ── */
  dim: null,        // objeto devuelto por buildDimensions()

  /* ── Entidades ── */
  jp:      null,    // personaje que cae (jump person)
  rescuer: null,    // rescatista

  /* ── Partículas de humo ── */
  smoke: [],

  /* ── Animaciones de texto ── */
  onomatoAnim:  null,   // burbuja de cómic
  rescuedAnim:  null,   // texto "¡RESCATADO!"

  /* ── Fase de luces del camión ── */
  lightPhase: 0,

  /* ── Frame global ── */
  frame: 0,

  /* ─── Métodos de utilidad ─── */

  reset() {
    this.score    = 0;
    this.misses   = 0;
    this.timeLeft = CONFIG.TIMER_SECONDS;
    this.running  = false;
    this.jp       = null;
    this.rescuer  = null;
    this.smoke    = [];
    this.onomatoAnim = null;
    this.rescuedAnim = null;
    this.frame    = 0;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  updateHUD() {
    document.getElementById('scoreEl').textContent = this.score;
    document.getElementById('timerEl').textContent = this.timeLeft;
    document.getElementById('missEl').textContent  = this.misses;

    const timerEl = document.getElementById('timerEl');
    timerEl.classList.toggle('danger', this.timeLeft <= 10);

    const missEl = document.getElementById('missEl');
    missEl.classList.toggle('hud-miss-danger', this.misses > 0);
  },
};

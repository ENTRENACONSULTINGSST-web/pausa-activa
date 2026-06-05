/* js/input.js
   Manejo de entrada: teclado, touch y mouse.
   Entrena Consulting SAS – Pausa Activa
   v2.1 – Touch con zona muerta · sin mezcla mouse/touch · multi-touch */

'use strict';

const Input = {
  keys:      { left: false, right: false },
  touchX:    null,
  _usingTouch: false,   // bloquea mouse cuando hay touch activo

  /* Convierte coordenada de pantalla a coordenada lógica del canvas */
  _toCanvasX(clientX, canvas) {
    const rect = canvas.getBoundingClientRect();
    return (clientX - rect.left) * (canvas.width / rect.width);
  },

  init(canvas) {

    /* ════ TECLADO ════ */
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') {
        this.keys.left  = true; e.preventDefault();
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keys.right = true; e.preventDefault();
      }
    });
    document.addEventListener('keyup', e => {
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') this.keys.left  = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
    });

    /* ════ TOUCH ════
       - Se usa el primer toque (touches[0])
       - passive:false solo donde hace falta prevenir scroll
       - touchX se actualiza solo si el toque está dentro del canvas
    */
    const onTouchStart = e => {
      this._usingTouch = true;
      // Usar changedTouches para capturar el primer nuevo toque
      this.touchX = this._toCanvasX(e.changedTouches[0].clientX, canvas);
    };

    const onTouchMove = e => {
      e.preventDefault(); // evitar scroll mientras se juega
      this.touchX = this._toCanvasX(e.changedTouches[0].clientX, canvas);
    };

    const onTouchEnd = e => {
      // Solo limpiar si ya no quedan toques activos
      if (e.touches.length === 0) {
        this.touchX      = null;
        this._usingTouch = false;
      }
    };

    canvas.addEventListener('touchstart',  onTouchStart, { passive: true  });
    canvas.addEventListener('touchmove',   onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',    onTouchEnd,   { passive: true  });
    canvas.addEventListener('touchcancel', onTouchEnd,   { passive: true  });

    /* ════ MOUSE (solo laptop/desktop, ignorado si hay touch) ════ */
    canvas.addEventListener('mousemove', e => {
      if (this._usingTouch) return;   // touch tiene prioridad
      if (!State.running)  return;
      this.touchX = this._toCanvasX(e.clientX, canvas);
    });

    canvas.addEventListener('mouseleave', () => {
      if (!this._usingTouch) this.touchX = null;
    });

    /* Clic en el canvas (alternativa al toque para laptop) */
    canvas.addEventListener('click', e => {
      if (!this._usingTouch) {
        this.touchX = this._toCanvasX(e.clientX, canvas);
      }
    });
  },
};

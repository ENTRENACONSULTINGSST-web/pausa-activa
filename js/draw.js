/* js/draw.js
   Funciones de dibujo canvas: fondo, edificio, entidades, efectos.
   Entrena Consulting SAS – Pausa Activa */

'use strict';

/* ════════════════════════════════
   FONDO / CIELO
   ════════════════════════════════ */
function drawBackground(ctx, dim) {
  const { W, H, FLOOR, WALL_W } = dim;

  /* Degradado nocturno */
  const sky = ctx.createLinearGradient(0, 0, 0, FLOOR);
  sky.addColorStop(0,   '#030310');
  sky.addColorStop(0.5, '#0c0c28');
  sky.addColorStop(1,   '#18183a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  /* Estrellas con parpadeo */
  const t = Date.now() / 2000;
  for (let i = 0; i < 60; i++) {
    const sx = (i * 97 + 13) % W;
    const sy = (i * 53 +  7) % (FLOOR - 50);
    const br = i % 7 === 0 ? 1.5 : 0.8;
    const alpha = 0.4 + 0.3 * Math.sin(t + i);
    ctx.fillStyle = i % 5 === 0
      ? `rgba(200,200,255,${alpha})`
      : `rgba(180,180,255,${alpha * 0.8})`;
    ctx.fillRect(sx, sy, br * 2, br * 2);
  }

  /* Luna */
  const moonX = W * 0.82, moonY = H * 0.09, moonR = W * 0.030;
  ctx.fillStyle = '#fffae0';
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  /* Edificios del horizonte */
  for (let i = 0; i < 6; i++) {
    const bx  = WALL_W + 30 + i * ((W - WALL_W - 60) / 6);
    const bh  = 28 + i * 14 + (i * 7) % 18;
    const bw  = 20 + i * 4;
    ctx.fillStyle = `hsl(230,18%,${7 + i * 2}%)`;
    ctx.fillRect(bx, FLOOR - bh, bw, bh);
    /* ventanas de edificios */
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(255,220,80,0.50)';
      ctx.fillRect(bx + 3, FLOOR - bh + 6, 6, 5);
      ctx.fillRect(bx + 12, FLOOR - bh + 16, 6, 5);
    }
  }
}

/* ════════════════════════════════
   SUELO / CALLE
   ════════════════════════════════ */
function drawFloor(ctx, dim) {
  const { W, H, FLOOR } = dim;
  const st = ctx.createLinearGradient(0, FLOOR, 0, H);
  st.addColorStop(0, '#2a2a2a');
  st.addColorStop(1, '#101010');
  ctx.fillStyle = st;
  ctx.fillRect(0, FLOOR, W, H - FLOOR);

  /* Línea de borde */
  ctx.fillStyle = '#444';
  ctx.fillRect(0, FLOOR, W, 3);

  /* Baldosas */
  for (let i = 0; i < W; i += 18) {
    ctx.fillStyle = i % 36 === 0 ? '#333' : '#222';
    ctx.fillRect(i, FLOOR + 3, 17, H - FLOOR - 3);
  }

  /* Línea discontinua de calle */
  ctx.fillStyle = 'rgba(255,255,180,0.07)';
  for (let i = 0; i < W; i += 42) ctx.fillRect(i, FLOOR + 6, 22, 3);
}

/* ════════════════════════════════
   EDIFICIO (ladrillos + ventanas)
   ════════════════════════════════ */
function drawBricks(ctx, x, y, w, h) {
  ctx.fillStyle = '#3a1e08';
  ctx.fillRect(x, y, w, h);
  const bh = Math.max(8, Math.round(h / 11));
  const bw = Math.round(w / 3);
  for (let row = 0; row * bh < h; row++) {
    const off = row % 2 === 0 ? 0 : bw / 2;
    ctx.fillStyle = row % 3 === 0 ? '#6b3d18' : row % 2 === 0 ? '#5a3014' : '#4e2810';
    for (let col = -1; col * bw < w + bw; col++) {
      const bx = x + col * bw + off;
      const by = y + row * bh;
      if (bx + bw > x && bx < x + w) {
        ctx.fillRect(
          Math.max(bx, x) + 1, by + 1,
          Math.min(bx + bw, x + w) - Math.max(bx, x) - 2,
          bh - 2,
        );
      }
    }
  }
}

function drawWindow(ctx, wx, wy, ww, wh) {
  ctx.fillStyle = '#1a3a5c';
  ctx.fillRect(wx, wy, ww, wh);

  /* Brillo interior (fuego/luz cálida) */
  const grd = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
  grd.addColorStop(0, 'rgba(255,200,80,0.22)');
  grd.addColorStop(1, 'rgba(255,100,30,0.12)');
  ctx.fillStyle = grd;
  ctx.fillRect(wx, wy, ww, wh);

  /* Marco */
  ctx.strokeStyle = '#8b6914';
  ctx.lineWidth = 3;
  ctx.strokeRect(wx - 1, wy - 1, ww + 2, wh + 2);

  /* Travesaños */
  ctx.strokeStyle = '#5a4a1a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(wx, wy + wh / 2);     ctx.lineTo(wx + ww, wy + wh / 2);
  ctx.moveTo(wx + ww / 2, wy);     ctx.lineTo(wx + ww / 2, wy + wh);
  ctx.stroke();
}

/* ════════════════════════════════
   HUMO
   ════════════════════════════════ */
function drawSmoke(ctx) {
  State.smoke.forEach(p => {
    const a = (p.life / p.maxLife) * 0.42;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = `hsl(${220 + p.life * 0.5},8%,${62 + p.life * 0.3}%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

/* ════════════════════════════════
   CAMIÓN DE BOMBEROS
   ════════════════════════════════ */
function drawFireTruck(ctx, dim) {
  const { FLOOR, TRUCK_X: tx, TRUCK_W: tw, TRUCK_H: th, H, W } = dim;
  const ty = FLOOR - th;

  /* Cuerpo principal */
  ctx.fillStyle = '#cc2200';
  ctx.fillRect(tx, ty, tw, th);

  /* Franja decorativa superior */
  ctx.fillStyle = '#ff4422';
  ctx.fillRect(tx + 2, ty + 2, tw - 4, Math.round(th * 0.08));

  /* Cabina (ventanas) */
  ctx.fillStyle = 'rgba(180,220,255,0.72)';
  ctx.fillRect(tx + Math.round(tw * 0.04), ty + Math.round(th * 0.15), Math.round(tw * 0.28), Math.round(th * 0.30));
  ctx.fillRect(tx + Math.round(tw * 0.36), ty + Math.round(th * 0.15), Math.round(tw * 0.28), Math.round(th * 0.30));
  ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1;
  ctx.strokeRect(tx + Math.round(tw * 0.04), ty + Math.round(th * 0.15), Math.round(tw * 0.28), Math.round(th * 0.30));
  ctx.strokeRect(tx + Math.round(tw * 0.36), ty + Math.round(th * 0.15), Math.round(tw * 0.28), Math.round(th * 0.30));

  /* Compartimiento trasero + escaleras */
  ctx.fillStyle = '#888';
  ctx.fillRect(tx + Math.round(tw * 0.68), ty + Math.round(th * 0.15), Math.round(tw * 0.28), Math.round(th * 0.55));
  ctx.fillStyle = '#bbb';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(tx + Math.round(tw * 0.70), ty + Math.round(th * 0.18) + i * Math.round(th * 0.11), Math.round(tw * 0.24), Math.round(th * 0.07));
  }

  /* Ruedas */
  const wr = Math.round(Math.min(tw, th) * 0.18);
  [[tx + Math.round(tw * 0.20), FLOOR - wr],
   [tx + Math.round(tw * 0.75), FLOOR - wr]].forEach(([cx, cy]) => {
    ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(cx, cy, wr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#444';     ctx.beginPath(); ctx.arc(cx, cy, Math.round(wr * 0.62), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#888';     ctx.beginPath(); ctx.arc(cx, cy, Math.round(wr * 0.24), 0, Math.PI * 2); ctx.fill();
  });

  /* Luces de emergencia parpadeantes */
  const phase = Date.now() / 280;
  const l1 = Math.sin(phase) > 0;
  const l2 = !l1;
  const LY  = ty - Math.round(H * 0.042);
  const LH  = Math.round(H * 0.038);
  const LW  = Math.round(tw * 0.20);

  ctx.fillStyle = l1 ? '#ff2200' : '#3a0000';
  ctx.fillRect(tx + Math.round(tw * 0.04), LY, LW, LH);
  if (l1) {
    ctx.save(); ctx.globalAlpha = 0.32;
    ctx.fillStyle = '#ff4400';
    ctx.beginPath(); ctx.arc(tx + Math.round(tw * 0.14), LY + LH / 2, W * 0.038, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = l2 ? '#0044ff' : '#00003a';
  ctx.fillRect(tx + Math.round(tw * 0.28), LY, LW, LH);
  if (l2) {
    ctx.save(); ctx.globalAlpha = 0.32;
    ctx.fillStyle = '#0066ff';
    ctx.beginPath(); ctx.arc(tx + Math.round(tw * 0.38), LY + LH / 2, W * 0.038, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* Faros delanteros y traseros */
  ctx.fillStyle = '#ffff66';
  ctx.fillRect(tx + tw - Math.round(tw * 0.06), ty + Math.round(th * 0.40), Math.round(tw * 0.05), Math.round(th * 0.14));
  ctx.fillRect(tx, ty + Math.round(th * 0.40), Math.round(tw * 0.05), Math.round(th * 0.14));
}

/* ════════════════════════════════
   MULTITUD PIXELADA
   ════════════════════════════════ */
function drawCrowd(ctx, dim) {
  const { CROWD_X, FLOOR, W, H } = dim;
  const cs  = Math.round(H * 0.052);
  const gap = Math.round(W * 0.031);
  const t   = Date.now() / 420;
  const count = Math.round((W - CROWD_X) / gap);

  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < count && i < 16; i++) {
      const cx = CROWD_X + i * gap + (row % 2) * Math.round(gap / 2);
      if (cx > W - 6) continue;
      const cy  = FLOOR - (row ? cs * 1.6 : 0) - cs * 0.15;
      const col = CONFIG.CROWD_COLORS[(i + row * 3) % CONFIG.CROWD_COLORS.length];

      ctx.strokeStyle = col;
      ctx.lineWidth   = Math.max(1.5, cs * 0.16);
      ctx.lineCap     = 'square';
      ctx.fillStyle   = col;

      /* Cabeza */
      ctx.beginPath(); ctx.arc(cx, cy - cs * 1.4, cs * 0.36, 0, Math.PI * 2); ctx.fill();

      /* Cuerpo */
      ctx.beginPath(); ctx.moveTo(cx, cy - cs * 0.95); ctx.lineTo(cx, cy + cs * 0.05); ctx.stroke();

      /* Brazos animados (agitando) */
      const arm = Math.sin(t + i * 1.4) * cs * 0.55;
      ctx.beginPath();
      ctx.moveTo(cx, cy - cs * 0.7); ctx.lineTo(cx - cs * 0.6, cy - cs * 0.32 + arm);
      ctx.moveTo(cx, cy - cs * 0.7); ctx.lineTo(cx + cs * 0.6, cy - cs * 0.32 - arm);
      ctx.stroke();

      /* Piernas */
      ctx.beginPath();
      ctx.moveTo(cx, cy + cs * 0.05); ctx.lineTo(cx - cs * 0.32, cy + cs * 0.88);
      ctx.moveTo(cx, cy + cs * 0.05); ctx.lineTo(cx + cs * 0.32, cy + cs * 0.88);
      ctx.stroke();
    }
  }
}

/* ════════════════════════════════
   STICK FIGURE (genérico)
   ════════════════════════════════ */
function drawStickFigure(ctx, x, y, scale, color, jumping, frame, carrying) {
  const s  = scale || 1;
  const sz = 8 * s;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color || '#fff';
  ctx.lineWidth   = Math.max(1.5, 2 * s);
  ctx.lineCap     = 'square';

  /* Cabeza */
  ctx.beginPath(); ctx.arc(0, -sz * 2.4, sz * 0.75, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = color || '#fff'; ctx.fill();

  /* Cuerpo */
  ctx.beginPath(); ctx.moveTo(0, -sz * 1.6); ctx.lineTo(0, 0); ctx.stroke();

  if (jumping) {
    const arm = (frame % 20 < 10) ? 0.5 : -0.3;
    ctx.beginPath();
    ctx.moveTo(0, -sz * 1.2); ctx.lineTo(-sz * 1.4, -sz * 0.5 + arm * sz);
    ctx.moveTo(0, -sz * 1.2); ctx.lineTo( sz * 1.4, -sz * 0.5 - arm * sz);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-sz * 0.8,  sz * 1.2);
    ctx.moveTo(0, 0); ctx.lineTo( sz * 0.8,  sz * 1.2);
    ctx.stroke();
  } else {
    const walk = Math.sin(frame * 0.25) * 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -sz * 1.2); ctx.lineTo(-sz * 1.3, -sz * 0.3 + walk * sz * 0.3);
    ctx.moveTo(0, -sz * 1.2); ctx.lineTo( sz * 1.3, -sz * 0.3 - walk * sz * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-sz * 0.6, sz * 1.4 + walk * sz * 0.4);
    ctx.moveTo(0, 0); ctx.lineTo( sz * 0.6, sz * 1.4 - walk * sz * 0.4);
    ctx.stroke();

    if (carrying) {
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth   = Math.max(1.5, 1.5 * s);
      ctx.beginPath(); ctx.moveTo(sz * 1.3, -sz * 0.6); ctx.lineTo(sz * 2.5, -sz * 1.8); ctx.stroke();
      ctx.save();
      ctx.translate(sz * 2.5, -sz * 1.8);
      ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = Math.max(1, s);
      ctx.beginPath(); ctx.arc(0, -sz * 1.4, sz * 0.5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#ffcc00'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -sz * 0.85); ctx.lineTo(0, sz * 0.2); ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

/* ════════════════════════════════
   ONOMATOPEYA (burbuja cómic)
   ════════════════════════════════ */
function drawOnomato(ctx, dim) {
  const o = State.onomatoAnim;
  if (!o) return;
  o.t--;

  const { CROWD_X, FLOOR, W, H } = dim;
  const bx   = CROWD_X + Math.round(W * 0.01);
  const by   = FLOOR   - Math.round(H * 0.38);
  const bw   = Math.round(W * 0.135);
  const bh   = Math.round(H * 0.13);
  const prog = o.t / o.maxT;

  ctx.save();
  ctx.globalAlpha = Math.min(1, prog * 2.8);
  const sc = 1 + (1 - prog) * 0.12;
  ctx.translate(bx + bw / 2, by + bh / 2);
  ctx.scale(sc, sc);
  ctx.translate(-bw / 2, -bh / 2);

  /* Fondo de burbuja */
  ctx.fillStyle = o.bg;
  ctx.beginPath(); ctx.ellipse(bw / 2, bh / 2, bw / 2, bh / 2, 0, 0, Math.PI * 2); ctx.fill();

  /* Borde dentado (estrella cómic) */
  const spikes = 8, ir = bh / 2 * 0.76, or = bh / 2 * 1.10;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / spikes) * Math.PI;
    const r = i % 2 === 0 ? or : ir;
    ctx.lineTo(bw / 2 + Math.cos(a) * r, bh / 2 + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle   = o.bg;
  ctx.strokeStyle = o.border;
  ctx.lineWidth   = 2.5;
  ctx.fill(); ctx.stroke();

  /* Cola de burbuja */
  ctx.fillStyle   = o.bg;
  ctx.strokeStyle = o.border;
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(bw * 0.22, bh * 0.84);
  ctx.lineTo(bw * 0.08, bh + bh * 0.18);
  ctx.lineTo(bw * 0.40, bh * 0.90);
  ctx.fill(); ctx.stroke();

  /* Texto */
  ctx.fillStyle    = o.color;
  ctx.font         = `bold ${Math.round(bh * 0.40)}px 'Courier New',monospace`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(o.text, bw / 2, bh / 2);

  ctx.restore();
  if (o.t <= 0) State.onomatoAnim = null;
}

/* ════════════════════════════════
   TEXTO "¡RESCATADO!"
   ════════════════════════════════ */
function drawRescuedAnim(ctx, dim) {
  const ra = State.rescuedAnim;
  if (!ra) return;
  ra.t--;
  ctx.save();
  ctx.globalAlpha = ra.t / 40;
  ctx.fillStyle   = '#00ff88';
  ctx.font        = `bold ${Math.round(dim.W * 0.024)}px Courier New`;
  ctx.fillText('¡RESCATADO!', ra.x - 44, ra.y - ra.t * 0.55);
  ctx.restore();
  if (ra.t <= 0) State.rescuedAnim = null;
}

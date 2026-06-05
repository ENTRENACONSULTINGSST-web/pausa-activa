# 🚒 Pausa Activa – Juego 8-bits de Rescate

**Entrena Consulting SAS** · *Pausa Activa*

Juego estilo 8-bits donde el jugador controla a un rescatista que debe atrapar personas que saltan de un edificio en llamas antes de que caigan al suelo.

---

## 🎮 Cómo jugar

| Acción | Control |
|--------|---------|
| Mover izquierda | ← / `A` |
| Mover derecha   | → / `D` |
| Control táctil  | Toca o desliza en la pantalla |
| Control mouse   | Mueve el cursor sobre el canvas |

- **Objetivo:** atrapar al personaje que salta de la ventana antes de que caiga al suelo.
- **Tiempo:** 60 segundos por ronda.
- **Rescate exitoso:** el personaje queda sobre el rescatista · aparece la burbuja *¡Eeeh!* · vibración en móvil.
- **Caída:** aparece la burbuja *¡Oooh!* · se cuenta como caída.

---

## 🗂️ Estructura del repositorio

```
pausa-activa/
│
├── index.html              # Entrada principal
│
├── css/
│   ├── reset.css           # Normalización base
│   ├── layout.css          # Layout responsive (laptop · tablet · móvil)
│   ├── hud.css             # Barra de información (puntos, tiempo, caídas)
│   ├── overlay.css         # Pantallas de inicio y fin de ronda
│   └── watermark.css       # Marca de agua semitransparente
│
├── js/
│   ├── config.js           # Constantes y ratios del juego
│   ├── state.js            # Estado global mutable + HUD helpers
│   ├── physics.js          # Física: gravedad, colisiones, humo, spawn
│   ├── draw.js             # Renderizado canvas: fondo, entidades, efectos
│   ├── input.js            # Teclado, touch y mouse
│   └── game.js             # Bucle principal, resize, timer, pantallas
│
└── README.md
```

---

## 🚀 Instalación y uso

### Opción 1 – Abrir directamente

```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/pausa-activa.git
cd pausa-activa

# Abrir en el navegador (sin servidor necesario)
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

### Opción 2 – Servidor local (recomendado para móvil / vibración)

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# Acceder en: http://localhost:8080
```

### Opción 3 – GitHub Pages

1. Ve a **Settings → Pages** en tu repositorio.
2. Selecciona rama `main` y carpeta `/ (root)`.
3. Guarda. URL disponible en `https://TU_USUARIO.github.io/pausa-activa`.

---

## 📐 Compatibilidad de dispositivos

| Dispositivo | Resolución típica | Controles |
|-------------|-------------------|-----------|
| Laptop      | ≥ 900 px          | Teclado + mouse |
| Tablet      | 600–900 px        | Touch + teclado |
| Móvil       | ≤ 600 px          | Touch · vibración |
| Landscape   | Altura < 480 px   | Touch · layout compacto |

---

## ⚙️ Mecánicas

- **Física real:** gravedad, componente horizontal aleatoria, rebote en paredes.
- **Aleatoriedad:** velocidad, ángulo y bamboleo del personaje varían cada salto.
- **Aceleración:** el rescatista gana velocidad progresivamente y frena con inercia.
- **Humo animado:** partículas salen de las dos ventanas del edificio.
- **Camión de bomberos:** luces rojas y azules parpadeantes.
- **Multitud:** personajes agitando brazos en tiempo real.
- **Onomatopeyas:** burbujas de cómic con *¡Eeeh!* (rescate) y *¡Oooh!* (caída).
- **Vibración haptic:** se activa en dispositivos compatibles al rescatar.

---

## 🏢 Créditos

Desarrollado para **Entrena Consulting SAS** como herramienta de *Pausa Activa*.  
Arte y física: estilo retro 8-bits, canvas HTML5 puro, sin dependencias externas.

---

## 📄 Licencia

© Entrena Consulting SAS – Todos los derechos reservados.

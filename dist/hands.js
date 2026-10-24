/* MarkStrap / controlled motion. Standalone, dependency-free ASCII canvas art. */
(function () {
  'use strict';

  const HUMAN = { w: 680, h: 390 };
  const ROBOT = { w: 540, h: 540 };
  const chars = ' .,:;i+*oO#@';

  function path(ctx, d, fill, stroke, width) {
    const p = new Path2D(d);
    if (fill) { ctx.fillStyle = fill; ctx.fill(p); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width || 1; ctx.stroke(p); }
  }

  function humanMask(ctx) {
    const skin = ctx.createLinearGradient(180, 330, 600, 55);
    skin.addColorStop(0, '#666666'); skin.addColorStop(.32, '#dddddd');
    skin.addColorStop(.65, '#f8f8f8'); skin.addColorStop(1, '#777777');
    // The wrist and palm are one volume. Separate, overlapping finger volumes
    // retain natural knuckles and a readable, tapered five-finger silhouette.
    path(ctx, 'M680 0L568 30C530 40 499 67 477 95C449 108 413 120 389 144C372 164 374 200 392 224C412 251 456 264 486 249C512 236 532 212 554 185C586 163 632 137 680 118Z', skin);
    // Extended index: the gesture's longest, clearest contour.
    path(ctx, 'M414 135C385 132 348 147 318 162L250 190L162 222C148 227 141 234 144 243C147 254 162 256 178 251L267 226L332 207C365 199 393 198 420 189Z', skin);
    // Middle, ring and little finger naturally curl underneath the palm.
    path(ctx, 'M392 174C371 189 349 216 335 238L306 268C296 279 294 291 303 298C313 307 327 303 337 292L373 259L411 221Z', skin);
    path(ctx, 'M423 192C402 215 388 241 376 263L363 286C356 301 360 314 371 319C384 324 394 316 401 302L417 280L447 238Z', skin);
    path(ctx, 'M455 208C438 226 430 248 424 269L419 291C416 305 422 315 433 316C446 317 454 307 458 294L468 273L485 238Z', skin);
    // Thumb opens from the near side of the palm.
    path(ctx, 'M502 172C508 198 497 223 481 243L461 270C450 283 440 285 430 277C422 270 425 259 434 248L446 224C452 207 452 193 458 182Z', skin);
    // Tapered shading, tendons and flexion creases appear as sparse dark glyphs.
    path(ctx, 'M564 42C535 77 510 99 480 122C447 145 429 164 420 193', null, '#777777', 4);
    path(ctx, 'M604 34C558 75 539 111 520 139C499 164 493 191 484 209', null, '#a3a3a3', 2);
    path(ctx, 'M517 117C486 124 464 137 446 152M500 128C472 135 456 145 446 158', null, '#878787', 2);
    path(ctx, 'M401 157C393 166 391 178 394 187M331 171L338 194M265 197L270 216M187 222L191 243', null, '#808080', 2);
    path(ctx, 'M371 226L388 236M346 256L358 268M392 265L408 276M434 267L448 274M459 238L471 247', null, '#666666', 3);
    path(ctx, 'M454 179C470 175 484 179 491 188M451 189C463 185 473 188 481 194M423 213C431 219 439 222 446 220', null, '#8c8c8c', 2);
    path(ctx, 'M151 236Q157 229 171 228L187 226L191 237Q172 245 155 244Z', '#bbbbbb', '#777777', 1);
    path(ctx, 'M303 283Q310 278 319 280L328 286L319 296Q306 298 303 290Z', '#bbbbbb');
    path(ctx, 'M367 299Q375 294 385 302L385 312Q375 318 367 309Z', '#bbbbbb');
    path(ctx, 'M424 299Q434 293 441 300L439 310Q428 315 424 305Z', '#bbbbbb');
    path(ctx, 'M432 264Q438 255 448 258L457 266Q450 278 440 277Z', '#bbbbbb');
    // Edge highlights give the dithering a sculptural, engraved quality.
    path(ctx, 'M151 230L253 193L321 165C348 151 381 137 410 137M478 99C505 67 536 43 568 33', null, '#ffffff', 2);
  }

  function robotMask(ctx) {
    const metal = ctx.createLinearGradient(100, 490, 365, 170);
    metal.addColorStop(0, '#4e4e4e'); metal.addColorStop(.45, '#a1a1a1');
    metal.addColorStop(.7, '#dddddd'); metal.addColorStop(1, '#818181');
    // Forearm, cuff, and the faceted metacarpal plate.
    path(ctx, 'M0 448L77 540L217 391L153 333Z', metal, '#eeeeee', 3);
    path(ctx, 'M92 431L155 355L196 391L130 468Z', '#303030', '#bbbbbb', 2);
    path(ctx, 'M145 342L182 302L241 339L218 391L195 405Z', '#bababa', '#eeeeee', 3);
    path(ctx, 'M177 300L197 246L251 211L294 231L319 285L280 340L233 360L196 336Z', metal, '#eeeeee', 3);
    path(ctx, 'M192 299L213 260L252 236L280 249L294 281L267 321L235 337L210 323Z', '#484848', '#b8b8b8', 3);
    path(ctx, 'M214 297L240 264L268 270L275 293L254 319L230 323Z', '#919191', '#eeeeee', 2);
    // An articulated finger consists of distinct beveled phalanges and joints.
    function segment(ax, ay, bx, by, width) {
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(Math.atan2(dy, dx));
      const bevel = Math.min(8, width * .3);
      path(ctx, `M4 ${-width/2}L${len-8} ${-width/2}L${len} ${-width/2+bevel}L${len} ${width/2-bevel}L${len-8} ${width/2}L4 ${width/2}L0 ${width/2-bevel}L0 ${-width/2+bevel}Z`, '#a8a8a8', '#f4f4f4', 2);
      path(ctx, `M8 ${-width/2+5}L${len-11} ${-width/2+5}`, null, '#ffffff', 2);
      path(ctx, `M9 ${width/2-6}L${len-10} ${width/2-6}`, null, '#4e4e4e', 3);
      ctx.restore();
    }
    function joint(x, y, r) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#383838'; ctx.fill(); ctx.strokeStyle = '#e7e7e7'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, r * .36, 0, Math.PI * 2); ctx.fillStyle = '#c8c8c8'; ctx.fill();
    }
    // Index: points towards the lightly moving human hand.
    segment(248, 231, 311, 169, 35); joint(250, 232, 18);
    segment(316, 164, 372, 111, 29); joint(313, 166, 15);
    segment(378, 106, 422, 72, 23); joint(374, 109, 13);
    path(ctx, 'M416 61Q427 56 437 65Q444 75 431 83L422 84Z', '#ededed', '#ffffff', 2);
    // Three curled fingers, each with a separate knuckle and fingertip.
    segment(281, 250, 327, 214, 32); joint(281, 251, 16);
    segment(332, 217, 356, 243, 27); joint(330, 216, 14);
    segment(354, 250, 330, 269, 23); joint(357, 246, 12);
    segment(295, 280, 336, 262, 29); joint(297, 280, 15);
    segment(343, 268, 351, 292, 25); joint(340, 266, 13);
    segment(345, 300, 321, 306, 21); joint(350, 295, 11);
    segment(280, 315, 315, 305, 25); joint(280, 315, 13);
    segment(321, 311, 322, 334, 21); joint(319, 309, 11);
    segment(316, 338, 295, 342, 18); joint(322, 335, 9);
    // Thumb separates from the side plate, opening the palm silhouette.
    segment(224, 332, 273, 358, 36); joint(224, 332, 19);
    segment(284, 354, 323, 327, 31); joint(279, 357, 16);
    segment(331, 321, 354, 297, 25); joint(327, 324, 13);
    joint(176, 362, 19);
    // Conductors, assembly holes and engraved plate seams.
    path(ctx, 'M36 456L139 353M49 472L150 365M61 486L159 378', null, '#353535', 4);
    path(ctx, 'M198 257L216 268M210 324L202 337M269 320L280 331M244 242L248 253', null, '#ffffff', 3);
    [[205,286],[229,345],[284,285]].forEach(([x,y])=>joint(x,y,4));
  }

  function makeAscii(kind, scale, dpr) {
    const spec = kind === 'human' ? HUMAN : ROBOT;
    const mask = document.createElement('canvas'); mask.width = spec.w; mask.height = spec.h;
    const m = mask.getContext('2d', { willReadFrequently: true });
    (kind === 'human' ? humanMask : robotMask)(m);
    const pixels = m.getImageData(0, 0, spec.w, spec.h).data;
    const out = document.createElement('canvas');
    out.width = Math.ceil(spec.w * scale * dpr); out.height = Math.ceil(spec.h * scale * dpr);
    const c = out.getContext('2d'); c.scale(scale * dpr, scale * dpr);
    // Constant screen-space cell size keeps ASCII intentional on every display.
    const pitchX = Math.max(3.8, 5.15 / scale), pitchY = pitchX * 1.15;
    c.font = `${pitchY * 1.14}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const rgb = kind === 'human' ? [229, 232, 230] : [108, 190, 232];
    for (let y = pitchY / 2; y < spec.h; y += pitchY) {
      for (let x = pitchX / 2; x < spec.w; x += pitchX) {
        const at = (Math.floor(y) * spec.w + Math.floor(x)) * 4;
        const alpha = pixels[at + 3] / 255;
        if (alpha < .16) continue;
        const lum = pixels[at] / 255;
        const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const value = Math.max(.08, Math.min(.99, lum + noise * .09));
        const index = Math.max(1, Math.min(chars.length - 1, Math.floor(value * (chars.length - 1))));
        c.fillStyle = `rgba(${rgb.join(',')},${alpha * (.3 + value * .68)})`;
        c.fillText(chars[index], x, y);
      }
    }
    return out;
  }

  window.initHands = function initHands(canvas) {
    if (!canvas || !canvas.getContext) return { resize() {}, setPaused() {}, destroy() {} };
    const ctx = canvas.getContext('2d');
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, dpr = 1, scale = 1, human, robot;
    let frame = 0, last = 0, paused = false, dead = false, visible = true;
    let humanX = 0, humanY = 0, robotX = 0, robotY = 0;

    function configure() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width); height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.min(width / 1440, height / 880) * 1.06;
      // Let hands slightly crop at the frame boundary, like an editorial plate.
      humanX = width - HUMAN.w * scale + 45 * scale;
      humanY = -28 * scale;
      robotX = -90 * scale; robotY = height - ROBOT.h * scale + 25 * scale;
      if (width < 700) {
        scale = Math.min(width / 820, height / 850);
        humanX = width - HUMAN.w * scale + 145 * scale;
        humanY = -16 * scale;
        robotX = -165 * scale; robotY = height * .54;
      }
      human = makeAscii('human', scale, dpr);
      robot = makeAscii('robot', scale, dpr);
      // The editorial persona sits at the lower left. Fade the entering wrist
      // before that caption, preserving the palm and index as the focal gesture.
      const robotContext = robot.getContext('2d');
      robotContext.save();
      robotContext.setTransform(1, 0, 0, 1, 0, 0);
      robotContext.globalCompositeOperation = 'destination-in';
      const fadeStart = Math.max(0, (height - 210 - robotY) * dpr);
      const fadeEnd = Math.max(fadeStart + 1, (height - 120 - robotY) * dpr);
      const captionFade = robotContext.createLinearGradient(0, fadeStart, 0, fadeEnd);
      captionFade.addColorStop(0, 'rgba(0,0,0,1)');
      captionFade.addColorStop(1, 'rgba(0,0,0,0)');
      robotContext.fillStyle = captionFade;
      robotContext.fillRect(0, 0, robot.width, robot.height);
      robotContext.restore();
      draw(0);
    }

    function draw(time) {
      if (!human || !robot) return;
      ctx.clearRect(0, 0, width, height);
      const reduced = media.matches;
      const phase = reduced ? 0 : time * .00048;
      const humanMotion = Math.sin(phase) * 2.5 * scale;
      const robotMotion = Math.sin(phase - .24) * 12 * scale;
      const humanTurn = Math.sin(phase * .83) * .006;
      const robotTurn = Math.sin(phase * .83 - .24) * .018;
      // The threads are deliberately quiet behind the central reading area.
      const ends = [[163, 239, 429, 73], [313, 287, 354, 243], [375, 307, 348, 292]];
      ends.forEach(([hx, hy, rx, ry], i) => {
        const x1 = humanX + hx * scale, y1 = humanY + hy * scale + humanMotion;
        const x2 = robotX + rx * scale, y2 = robotY + ry * scale + robotMotion;
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, 'rgba(220,228,230,.31)');
        gradient.addColorStop(.3, 'rgba(142,182,207,.045)');
        gradient.addColorStop(.68, 'rgba(142,182,207,.045)');
        gradient.addColorStop(1, 'rgba(103,199,255,.36)');
        ctx.strokeStyle = gradient; ctx.lineWidth = .65;
        ctx.beginPath(); ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(x1 - 40 * scale, y1 + 80 * scale, x2 + 75 * scale, y2 - 90 * scale, x2, y2);
        ctx.stroke();
        ctx.fillStyle = i ? 'rgba(103,199,255,.32)' : 'rgba(169,225,255,.7)';
        ctx.beginPath(); ctx.arc(x2, y2, 2 * scale, 0, Math.PI * 2); ctx.fill();
      });
      ctx.save();
      ctx.translate(humanX + HUMAN.w * scale, humanY + 80 * scale + humanMotion);
      ctx.rotate(humanTurn);
      ctx.drawImage(human, -HUMAN.w * scale, -80 * scale, HUMAN.w * scale, HUMAN.h * scale);
      ctx.restore();
      ctx.save();
      ctx.translate(robotX + 65 * scale, robotY + 495 * scale + robotMotion);
      ctx.rotate(robotTurn);
      ctx.drawImage(robot, -65 * scale, -495 * scale, ROBOT.w * scale, ROBOT.h * scale);
      ctx.restore();
      // Small registration marks echo technical drawing rather than sci-fi UI.
      if (width > 800) {
        ctx.strokeStyle = 'rgba(180,207,226,.21)'; ctx.lineWidth = .6;
        [[width - 39, 194], [44, height - 232]].forEach(([x,y]) => {
          ctx.beginPath(); ctx.moveTo(x-5,y); ctx.lineTo(x+5,y); ctx.moveTo(x,y-5); ctx.lineTo(x,y+5); ctx.stroke();
        });
      }
    }

    function tick(now) {
      frame = 0;
      if (dead || paused || !visible || document.hidden) return;
      if (now - last > 1000 / 24) { draw(now); last = now; }
      if (!media.matches) frame = requestAnimationFrame(tick);
    }
    function resume() {
      if (!dead && !paused && visible && !document.hidden && !frame) frame = requestAnimationFrame(tick);
    }
    function stop() { if (frame) cancelAnimationFrame(frame); frame = 0; }
    function onMotion() { stop(); draw(0); resume(); }
    function onVisibility() { if (document.hidden) stop(); else resume(); }
    const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting; if (visible) resume(); else stop();
    }) : null;
    if (observer) observer.observe(canvas);
    if (media.addEventListener) media.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    configure(); resume();
    return {
      resize: configure,
      setPaused(value) { paused = Boolean(value); if (paused) stop(); else resume(); },
      destroy() {
        dead = true; stop(); if (observer) observer.disconnect();
        if (media.removeEventListener) media.removeEventListener('change', onMotion);
        document.removeEventListener('visibilitychange', onVisibility);
        human = null; robot = null;
      }
    };
  };
})();


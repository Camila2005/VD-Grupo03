/*═══════════════════════════════════════════════════════════════
      ANIMACIONES DEL PROYECTO
  ----------------------------------------------------------------
  Este archivo contiene las animaciones principales del
  scrollytelling.

  La mayoría de ellas utilizan GSAP y ScrollTrigger.

  Organización:

  • Intro
  • Acto I
  • Acto II
  • Acto III
  • ...

  Cada acto puede modificarse de forma independiente.

  IMPORTANTE:
  Muchos elementos se seleccionan mediante su id (#).
  Si se cambia el nombre de un id en el HTML, también deberá
  actualizarse aquí para que las animaciones sigan funcionando.
═══════════════════════════════════════════════════════════════*/

/*═══════════════════════════════════════════════════════════════
  ANTES DE MODIFICAR ESTE ARCHIVO

  1. Verificar que el id del elemento exista en el HTML.

  2. Si se cambia un id en el HTML, actualizar también este archivo.

  3. Si una animación deja de funcionar, revisar primero que el
  selector (#...) siga teniendo el mismo nombre.

  La mayoría de los errores en este archivo suelen deberse a que
  el selector ya no coincide con el HTML.
═══════════════════════════════════════════════════════════════*/

gsap.registerPlugin(ScrollTrigger);
/* Activa el plugin ScrollTrigger para poder disparar
   animaciones cuando el usuario hace scroll. */

/* ── INTRO: video de apertura ── */
(function() {
  const video        = document.getElementById('videoIntro');
  const btnSaltar    = document.getElementById('btnSaltarIntro');
  const scrollCta    = document.getElementById('introScrollCta');
  let yaTermino = false;

  function congelarEnUltimoFrame() {
    if (yaTermino) return;
    yaTermino = true;
    video.pause();
    // se asegura de quedar exactamente en el último frame
    if (video.duration && isFinite(video.duration)) {
      video.currentTime = video.duration;
    }
    btnSaltar.classList.add('oculto');
    scrollCta.classList.add('visible');
  }

  // al llegar naturalmente al final, se queda congelado ahí (con el título visible)
  video.addEventListener('ended', congelarEnUltimoFrame);

  // si el archivo no carga (404, formato no soportado, etc.) no dejamos
  // al usuario con una sección rota — mostramos el CTA igual para que pueda seguir
  video.addEventListener('error', () => {
    btnSaltar.classList.add('oculto');
    scrollCta.classList.add('visible');
  });

  // "Saltar" avanza el video directo al final y lo congela ahí
  btnSaltar.addEventListener('click', congelarEnUltimoFrame);

  // si el usuario scrollea antes de que termine el video, ocultamos el CTA igual
  // (por si vuelve a subir y el video ya está congelado, no queremos el CTA tapando nada raro)
  window.addEventListener('scroll', () => {
    if (yaTermino && window.scrollY > window.innerHeight * 0.3) {
      scrollCta.classList.remove('visible');
    } else if (yaTermino && window.scrollY <= window.innerHeight * 0.3) {
      scrollCta.classList.add('visible');
    }
  });
})();

/*═══════════════════════════════════════════════════════════════
  FUNCIÓN AUXILIAR

  Esta función evita repetir siempre el mismo código de GSAP.

  En lugar de escribir toda la configuración de ScrollTrigger
  cada vez, simplemente llamamos:

  alEntrar(
      selector,
      propiedades,
      trigger,
      posición
  );

  Ejemplo:

  alEntrar('#precioTitulo',
      { opacity:1, duration:0.8 },
      '#p9'
  );

  Esto hará que el elemento aparezca cuando la sección indicada
  entre en pantalla.
═══════════════════════════════════════════════════════════════*/
/* ── helper: animación al entrar en viewport ── */
function alEntrar(sel, props, triggerSel, startPos = 'top 65%') {
  gsap.to(sel, {
    ...props,
    scrollTrigger: {
      trigger: triggerSel || sel,
      start: startPos,
      toggleActions: 'play none none reverse',
    }
  });
}

/* ── ACTO I ── */
/* ── ACTO I: título ── */
alEntrar('#subIntro',    { opacity:1, y:0, duration:1.2, delay:0.3, ease:'power3.out' }, '#p2', 'top 55%');
alEntrar('#pausaVisual', { opacity:1, duration:1, delay:0.7 }, '#p2', 'top 50%');
alEntrar('#pregunta',    { opacity:1, duration:1.5, ease:'power2.out' }, '#p3');

/* ── ACTO III: reloj animado ── */
const tiempos = [
  '07:00','07:01','07:03','07:08','07:17',
  '07:31','07:52','08:14','08:41','09:23'
];
let relojIdx = 0;
let relojInterval = null;

ScrollTrigger.create({
  trigger: '#p8',
  start: 'top 60%',
  onEnter: () => {
    gsap.to('#reloj', { opacity:1, y:0, duration:0.8, ease:'power2.out' });
    // inicia el avance del reloj
    relojInterval = setInterval(() => {
      relojIdx++;
      if (relojIdx < tiempos.length) {
        document.getElementById('reloj').textContent = tiempos[relojIdx];
      } else {
        clearInterval(relojInterval);
      }
    }, 280);
  },
  onLeaveBack: () => {
    gsap.to('#reloj', { opacity:0, y:20, duration:0.4 });
    clearInterval(relojInterval);
    relojIdx = 0;
    document.getElementById('reloj').textContent = '07:00';
  }
});

alEntrar('#relojFrase1', { opacity:1, y:0, duration:1, ease:'power2.out' }, '#p8', 'top 40%');
alEntrar('#relojFrase2', { opacity:1, y:0, duration:1, delay:0.4, ease:'power2.out' }, '#p8', 'top 30%');

/* ── ACTO III: precios ── */
alEntrar('#precioTitulo', { opacity:1, duration:0.8 }, '#p9');
alEntrar('#columna1', { opacity:1, y:0, duration:0.9, ease:'power2.out' }, '#p9', 'top 60%');
alEntrar('#columna2', { opacity:1, y:0, duration:0.9, delay:0.2, ease:'power2.out' }, '#p9', 'top 60%');
alEntrar('#precioNota1', { opacity:1, y:0, duration:1, ease:'power2.out' }, '#p9', 'top 40%');
alEntrar('#precioNota2', { opacity:1, y:0, duration:1, delay:0.4, ease:'power2.out' }, '#p9', 'top 30%');

/*═══════════════════════════════════════════════════════════════
  LÓGICA DE LA DECISIÓN

  Esta sección controla toda la interacción del usuario.

  Se encarga de:

  • registrar la opción elegida
  • mostrar el feedback correspondiente
  • bloquear los botones elegidos
  • avanzar a la siguiente situación
  • mostrar la transición final
═══════════════════════════════════════════════════════════════*/
/* ── ACTO III.5: LA DECISIÓN — lógica interactiva ── */
(function() {

  let pasoActual = 1;
  const totalPasos = 3;
  let yaIniciado = false;

  const feedbacks = {
    casera: [
      "Elegiste cocinar. Tenías el tiempo y los recursos para hacerlo.",
      "De nuevo elegiste lo casero, aunque las condiciones ya eran más difíciles.",
      "",
    ],
    rapida: [
      "Elegiste comida rápida, incluso teniendo todo para cocinar.",
      "Con poco tiempo, la comida rápida apareció como la opción más simple.",
      "El entorno hizo que esta fuera, una vez más, la opción más fácil.",
    ]
  };

  function mostrarFeedbackYAvanzar(paso, eleccion) {
    const situacionActual = document.getElementById('situacion-' + paso);
    situacionActual.classList.add('completada');
    const feedbackEl = document.getElementById('feedback-' + paso);
    feedbackEl.textContent = feedbacks[eleccion][paso - 1];

    const botonElegido = situacionActual.querySelector(
      `.btn-${eleccion}`
    );
    botonElegido.classList.add('seleccionada');

    situacionActual.querySelectorAll('.decision-btn')
      .forEach(b => b.disabled = true);

    feedbackEl.textContent = feedbacks[eleccion][paso - 1];
    feedbackEl.classList.add('visible');

    // deshabilitar botones de esta situación para evitar doble click
    situacionActual.querySelectorAll('.decision-btn').forEach(b => b.disabled = true);

    requestAnimationFrame(() => feedbackEl.classList.add('visible'));

    const esperaFeedback = feedbacks[eleccion][paso - 1] ? 1100 : 0;

    setTimeout(() => {
      if (eleccion === 'rapida') {
        // camino corto: va directo a la transición final
        avanzarATransicion();
      } else if (paso < totalPasos) {
        // sigue a la próxima situación
        const siguiente = document.getElementById('situacion-' + (paso + 1));
        siguiente.classList.add('activa');
      } else {
        // terminó las 3 situaciones eligiendo siempre casera
        avanzarATransicion();
      }
    }, esperaFeedback);
  }

  function avanzarATransicion() {

    const transicion =
      document.getElementById('decisionTransicion');

    transicion.classList.add('activa');

    gsap.fromTo(
      transicion,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 }
    );
  }

  window.elegirOpcion = function(paso, eleccion) {
    mostrarFeedbackYAvanzar(paso, eleccion);
  };

  /* activa la primera situación cuando la sección entra en viewport */
  ScrollTrigger.create({
    trigger: '#p-decision',
    start: 'top 55%',
    onEnter: () => {
      if (yaIniciado) return;
      yaIniciado = true;
      document.getElementById('decisionEyebrow').classList.add('visible');
      gsap.fromTo('#situacion-1',
        { opacity:0, y:14 },
        { opacity:1, y:0, duration:0.8, ease:'power2.out' }
      );
    }
  });

})();

/* ── ACTO VII: cierre — cada frase aparece al llegar a ella ── */
['#cf1','#cf2','#cf3','#cf4','#cf5','#cierreSep','#preguntaFinal','#reflexionFinal','#cierreFirma'].forEach(sel => {
  gsap.to(sel, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: sel,
      start: 'top 80%',
      toggleActions: 'play none none none',
    }
  });
});
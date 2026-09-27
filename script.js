// Relógio "tempo real" no topo — reforça a identidade de transmissão ao vivo
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const clockEl = document.getElementById('clock');
  if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;
}
updateClock();
setInterval(updateClock, 1000);

// Ano no rodapé
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Fundo de vídeo trocando conforme o scroll ----------
// Cada seção com [data-bg="N"] ativa o clipe de fundo .bg-clip[data-clip="N"]
const bgClips = document.querySelectorAll('.bg-clip');
const bgSections = document.querySelectorAll('[data-bg]');

if (bgClips.length && bgSections.length && 'IntersectionObserver' in window) {
  const activateClip = (index) => {
    bgClips.forEach((clip) => {
      const isTarget = clip.dataset.clip === String(index);
      clip.classList.toggle('is-active', isTarget);
      if (isTarget) {
        // só dá play no clipe ativo — economiza recursos com os outros pausados
        clip.play().catch(() => {});
      } else {
        clip.pause();
      }
    });
  };

  // Elementos [data-bg] podem estar aninhados (ex.: um <article> com data-bg="3"
  // dentro da <section> do portfólio, que tem data-bg="2"). Quando a linha central
  // cruza os dois ao mesmo tempo, guardamos todos os que estão ativos no momento e
  // escolhemos o mais interno no DOM — ele que manda no fundo exibido.
  const activeSections = new Set();

  const pickActiveBg = () => {
    let winner = null;
    activeSections.forEach((el) => {
      const hasActiveDescendant = [...activeSections].some(
        (other) => other !== el && el.contains(other)
      );
      if (!hasActiveDescendant) winner = el;
    });
    if (winner) activateClip(winner.dataset.bg);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSections.add(entry.target);
        } else {
          activeSections.delete(entry.target);
        }
      });
      pickActiveBg();
    },
    // Em vez de medir "% da seção visível" (falha em seções mais altas que a tela,
    // como o Portfólio — a % de visibilidade nunca chega a 0.5), reduzimos a área de
    // observação a uma linha no meio da tela: a seção que estiver cruzando essa
    // linha central ativa seu vídeo, não importa a altura da seção.
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
  );

  bgSections.forEach((section) => observer.observe(section));

  // Garante que o primeiro clipe comece tocando
  activateClip('0');
}


/* ═══════════════════════════════════════════
   POSADA OCUMARE — script.js
═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     HERO SLIDESHOW (every 4 seconds)
  ───────────────────────────────────────── */
  const slides = document.querySelectorAll('.hero-slide');
  let currentSlide = 0;

  function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }

  if (slides.length > 1) {
    setInterval(nextSlide, 4000);
  }

  /* ─────────────────────────────────────────
     1. STICKY HEADER
  ───────────────────────────────────────── */
  const header = document.getElementById('header');

  function handleScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    highlightActiveNav();
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  /* ─────────────────────────────────────────
     2. HAMBURGER MENU (MOBILE)
  ───────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ─────────────────────────────────────────
     3. ACTIVE NAV HIGHLIGHT ON SCROLL
  ───────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link:not(.btn-nav)');

  function highlightActiveNav() {
    let currentId = '';
    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        currentId = section.getAttribute('id');
      }
    });

    navItems.forEach(function (item) {
      item.classList.remove('active');
      if (item.getAttribute('href') === '#' + currentId) {
        item.classList.add('active');
      }
    });
  }

  /* ─────────────────────────────────────────
     4. SCROLL-REVEAL ANIMATION (data-aos)
  ───────────────────────────────────────── */
  const animEls = document.querySelectorAll('[data-aos]');

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  animEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ─────────────────────────────────────────
     5. GALLERY LIGHTBOX (con soporte de VIDEO)
  ───────────────────────────────────────── */
  const lightbox        = document.getElementById('lightbox');
  const lightboxImg     = document.getElementById('lightboxImg');
  const lightboxVideo   = document.getElementById('lightboxVideo');
  const lightboxClose   = document.getElementById('lightboxClose');
  const lightboxPrev    = document.getElementById('lightboxPrev');
  const lightboxNext    = document.getElementById('lightboxNext');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const counterEl       = document.getElementById('lightboxCounter');

  const galleryItems = document.querySelectorAll('.gallery-item');
  const totalItems   = galleryItems.length;
  let currentIndex   = 0;

  // Construye el array de fuentes (imágenes O vídeo)
  const mediaSources = Array.from(galleryItems).map(function (item) {
    const type = item.getAttribute('data-type') || 'image';
    if (type === 'video') {
      const vid = item.querySelector('video');
      const src = vid ? (vid.querySelector('source') ? vid.querySelector('source').src : vid.src) : '';
      return { type: 'video', src: src };
    } else {
      const img = item.querySelector('img');
      return { type: 'image', src: img ? img.src : '', alt: img ? img.alt : '' };
    }
  });

  /* ── Abrir ── */
  function openLightbox(index) {
    currentIndex = index;
    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  /* ── Cerrar ── */
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';

    // Detiene el vídeo si está en reproducción
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.src = '';
    }

    if (galleryItems[currentIndex]) {
      galleryItems[currentIndex].focus();
    }
  }

  /* ── Actualizar contenido del lightbox ── */
    function updateLightboxContent() {
      const media = mediaSources[currentIndex];
      counterEl.textContent = (currentIndex + 1) + ' / ' + totalItems;

      if (media.type === 'video') {
        lightboxImg.style.display = 'none';
        lightboxVideo.style.display = 'block';
        lightboxVideo.src = media.src;
        
        // ESTA ES LA LÍNEA CLAVE PARA QUITAR EL AUDIO TOTALMENTE
        lightboxVideo.muted = true; 
        lightboxVideo.volume = 0; 

        lightboxVideo.load();
        lightboxVideo.play().catch(function () {
          /* Manejo de bloqueo de autoplay */
        });
      } else {
      // Muestra imagen, oculta vídeo
      if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.style.display = 'none';
      }
      lightboxImg.style.display = 'block';
      lightboxImg.style.opacity = '0';
      lightboxImg.style.transition = 'opacity 0.2s ease';

      setTimeout(function () {
        lightboxImg.src = media.src;
        lightboxImg.alt = media.alt;
        lightboxImg.style.opacity = '1';
      }, 180);
    }
  }

  /* ── Navegación ── */
  function goNext() {
    currentIndex = (currentIndex + 1) % totalItems;
    updateLightboxContent();
  }

  function goPrev() {
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    updateLightboxContent();
  }

  /* ── Event listeners de los ítems de galería ── */
  galleryItems.forEach(function (item) {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');

    const type = item.getAttribute('data-type') || 'image';
    const inlineVideo = item.querySelector('video');

    // Video hover: reproducir/pausar al pasar el ratón
    if (type === 'video' && inlineVideo) {
      item.addEventListener('mouseenter', function () {
        inlineVideo.play().catch(function () {});
      });
      item.addEventListener('mouseleave', function () {
        inlineVideo.pause();
        inlineVideo.currentTime = 0;
      });
    }

    item.addEventListener('click', function () {
      const index = parseInt(item.getAttribute('data-index'), 10);
      openLightbox(index);
    });

    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const index = parseInt(item.getAttribute('data-index'), 10);
        openLightbox(index);
      }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', goNext);
  lightboxPrev.addEventListener('click', goPrev);

  // Teclado dentro del lightbox
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;
    switch (e.key) {
      case 'ArrowRight': goNext();        break;
      case 'ArrowLeft':  goPrev();        break;
      case 'Escape':     closeLightbox(); break;
    }
  });

  // Swipe táctil
  let touchStartX = 0;
  let touchEndX   = 0;

  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) { goNext(); } else { goPrev(); }
    }
  }, { passive: true });

  /* ─────────────────────────────────────────
     6. CONTACT FORM
  ───────────────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  const formMsg     = document.getElementById('formMsg');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      formMsg.style.color = '#E2C06A';
      formMsg.textContent = 'Enviando tu consulta...';

      fetch('https://formsubmit.co/ajax/lilianapinango61@gmail.com', {
        method: 'POST',
        body: new FormData(contactForm),
      })
      .then(function (response) {
        return response.ok ? response.json() : Promise.reject(response);
      })
      .then(function (data) {
        formMsg.style.color   = '#4caf50';
        formMsg.textContent   = '¡Enviado exitosamente! Nos contactaremos pronto.';
        contactForm.reset();
      })
      .catch(function (error) {
        formMsg.style.color   = '#e87272';
        formMsg.textContent   = 'Hubo un error. Por favor, intenta de nuevo.';
      });
    });
  }

  /* ─────────────────────────────────────────
     7. SMOOTH SCROLL
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerHeight = header.offsetHeight;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
  });


  /* ─────────────────────────────────────────
     8. MAPA INTERACTIVO (Click para activar)
  ───────────────────────────────────────── */
  const mapWrap = document.querySelector('.location-map-wrap');
  
  if (mapWrap) {
    const mapIframe = mapWrap.querySelector('iframe');
    
    // Cuando el cliente hace clic en el contenedor, el mapa "despierta"
    mapWrap.addEventListener('click', function() {
      if (mapIframe) {
        mapIframe.style.pointerEvents = 'auto';
      }
    });

    // Cuando el cliente saca el ratón del mapa, se vuelve a bloquear para poder hacer scroll
    mapWrap.addEventListener('mouseleave', function() {
      if (mapIframe) {
        mapIframe.style.pointerEvents = 'none';
      }
    });
  }

  // Inicializar al cargar
  handleScroll();

})();
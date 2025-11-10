// Hamburger menu toggle
const hamburger = document.getElementById("hamburger-toggle");
const navRight = document.querySelector("nav .right");

if (hamburger && navRight) {
  hamburger.addEventListener("click", () => {
    navRight.classList.toggle("show");
  });
}
// Headshot image slideshow logic
const headshotElement = document.getElementById("headshot");
if (headshotElement) {
  let activeHeadshot = headshotElement;
  const headshotList = [
    "img1.webp", "img8.webp", "img3.webp", "img4.webp", "img5.webp",
    "img7.webp", "img9.webp", "img10.webp", "img11.webp", "img12.webp",
    "img13.webp", "img14.webp", "img15.webp", "img16.webp", "img17.webp", "img18.webp"
  ];
  let headshotIndex = 0;
  function updateHeadshot() {
    const nextIndex = (headshotIndex + 1) % headshotList.length;
    const newImg = document.createElement("img");
    newImg.src = "images/headshots/" + headshotList[nextIndex];
    newImg.alt = "klein cafa headshot";
    newImg.classList.add("headshot-img");
    newImg.style.opacity = 0;
    newImg.style.zIndex = "0";
    const container = activeHeadshot.parentElement;
    container.appendChild(newImg);
    requestAnimationFrame(() => {
      newImg.style.opacity = 1;
      activeHeadshot.style.opacity = 0;
    });
    newImg.onload = () => {
      setTimeout(() => {
        container.removeChild(activeHeadshot);
        newImg.id = "headshot";
        newImg.classList.remove("headshot-img");
        activeHeadshot = newImg;
      }, 500);
    };
    headshotIndex = nextIndex;
  }
  activeHeadshot.src = "images/headshots/" + headshotList[0];
  activeHeadshot.alt = "klein cafa headshot";
  headshotIndex = 0;
  setInterval(updateHeadshot, 5000);
}

// Fade-in effect
const faders = document.querySelectorAll('.fade-in-section');
const appearOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, {
  threshold: 0.1,
});
faders.forEach(section => {
  appearOnScroll.observe(section);
});

// Project sorting controls (projects page only)
const projectSortSelect = document.getElementById('project-sort-select');
if (projectSortSelect) {
  const projectContainer = document.querySelector('.project-cells');
  const originalCards = Array.from(projectContainer.querySelectorAll('.project-cell'));

  const getTitle = (card) =>
    (card.dataset.sortTitle || card.querySelector('h3')?.textContent || '').toLowerCase();
  const getDate = (card) => card.dataset.sortDate || '0000-00';

  const comparators = {
    newest: (a, b) =>
      getDate(b).localeCompare(getDate(a)) || getTitle(a).localeCompare(getTitle(b)),
    oldest: (a, b) =>
      getDate(a).localeCompare(getDate(b)) || getTitle(a).localeCompare(getTitle(b)),
    az: (a, b) => getTitle(a).localeCompare(getTitle(b)),
    za: (a, b) => getTitle(b).localeCompare(getTitle(a)),
  };

  const applyProjectSort = () => {
    const mode = projectSortSelect.value;
    const comparator = comparators[mode] || comparators.newest;
    const sortedCards = [...originalCards].sort(comparator);
    sortedCards.forEach(card => projectContainer.appendChild(card));
  };

  projectSortSelect.addEventListener('change', applyProjectSort);
  applyProjectSort();
}

// Slideshow helpers (used on project cards and modal clones)
const slideshowCleanups = new WeakMap();

const setupSlideshow = (slideshow) => {
  if (slideshowCleanups.has(slideshow)) return;
  const slides = slideshow.querySelectorAll('.slide');
  const nextBtn = slideshow.querySelector('.next');
  const prevBtn = slideshow.querySelector('.prev');
  if (!slides.length || !nextBtn || !prevBtn) return;

  let index = 0;
  const showSlide = (i) => {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[i].classList.add('active');
  };

  const nextSlide = () => {
    index = (index + 1) % slides.length;
    showSlide(index);
  };

  const prevSlide = () => {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
  };

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    nextSlide();
  });
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    prevSlide();
  });

  const intervalId = setInterval(nextSlide, 5000);
  slideshowCleanups.set(slideshow, () => clearInterval(intervalId));
};

const initSlideshows = (root = document) => {
  root.querySelectorAll('.slideshow').forEach(setupSlideshow);
};

const teardownSlideshows = (root) => {
  root.querySelectorAll('.slideshow').forEach(slideshow => {
    const cleanup = slideshowCleanups.get(slideshow);
    if (cleanup) {
      cleanup();
      slideshowCleanups.delete(slideshow);
    }
  });
};

initSlideshows();

// Project detail modal
const projectModal = document.getElementById('project-modal');
if (projectModal) {
  const modalTitle = projectModal.querySelector('.project-modal__title');
  const modalMeta = projectModal.querySelector('.project-modal__meta');
  const modalDescription = projectModal.querySelector('.project-modal__description');
  const modalMedia = projectModal.querySelector('.project-modal__media');
  const modalLinks = projectModal.querySelector('.project-modal__links');
  const modalCloseBtn = projectModal.querySelector('.project-modal__close');
  const projectCards = document.querySelectorAll('.project-cells .project-cell');

  const openProjectModal = (card) => {
    if (!card) return;

    modalTitle.textContent = card.dataset.modalTitle || card.querySelector('h3')?.textContent || 'Project Details';
    const metaText = card.dataset.modalMeta || card.querySelector('h4')?.textContent || '';
    modalMeta.textContent = metaText;
    modalMeta.style.display = metaText ? 'block' : 'none';
    modalDescription.textContent = card.dataset.modalDescription || card.querySelector('p')?.textContent.trim() || 'More information coming soon.';

    teardownSlideshows(modalMedia);
    modalMedia.innerHTML = "";
    modalLinks.innerHTML = "";

    const slideshow = card.querySelector('.slideshow');
    if (slideshow) {
      const slideshowClone = slideshow.cloneNode(true);
      modalMedia.appendChild(slideshowClone);
    }

    const videoSrc = card.dataset.modalVideoSrc;
    if (videoSrc) {
      const videoWrapper = document.createElement('div');
      videoWrapper.className = 'project-video';
      const iframe = document.createElement('iframe');
      iframe.src = videoSrc;
      iframe.title = card.dataset.modalVideoTitle || 'Project Video';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.style.width = '100%';
      iframe.style.height = '300px';
      iframe.style.borderRadius = '8px';
      videoWrapper.appendChild(iframe);
      modalMedia.appendChild(videoWrapper);
    } else {
      const video = card.querySelector('.project-video');
      if (video) {
        const videoClone = video.cloneNode(true);
        modalMedia.appendChild(videoClone);
      }
    }

    card.querySelectorAll('.project-btn').forEach(btn => {
      const buttonClone = btn.cloneNode(true);
      modalLinks.appendChild(buttonClone);
    });

    initSlideshows(modalMedia);
    projectModal.classList.add('is-open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  };

  const closeProjectModal = () => {
    teardownSlideshows(modalMedia);
    modalMedia.innerHTML = "";
    modalLinks.innerHTML = "";
    projectModal.classList.remove('is-open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  projectCards.forEach(card => {
    card.addEventListener('click', (event) => {
      const interactive = event.target.closest('a, button, iframe');
      if (interactive) return;
      openProjectModal(card);
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProjectModal(card);
      }
    });
  });

  modalCloseBtn.addEventListener('click', closeProjectModal);
  projectModal.addEventListener('click', (event) => {
    if (event.target === projectModal) {
      closeProjectModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && projectModal.classList.contains('is-open')) {
      closeProjectModal();
    }
  });
}

// Typewriter animation
const sentence = "Hello, World! I'm Klein ";
const emoji = "👋";
const typewriterTarget = document.getElementById("typewriter-text");
if (typewriterTarget) {
  let charIndex = 0;
  function typeCharacter() {
    if (charIndex < sentence.length) {
      if (sentence.slice(charIndex, charIndex + 5) === "Klein") {
        typewriterTarget.innerHTML += `<span class="highlight">Klein</span>`;
        charIndex += 5;
      } else {
        typewriterTarget.innerHTML += sentence.charAt(charIndex);
        charIndex++;
      }
      setTimeout(typeCharacter, 80);
    } else if (charIndex === sentence.length) {
      setTimeout(() => {
        typewriterTarget.innerHTML += `<span style="display:inline-block;">${emoji}</span>`;
      }, 150);
      charIndex++;
    }
  }
  typeCharacter();
}

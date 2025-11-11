const PROJECT_DATA = Array.isArray(window.PROJECT_DATA) ? window.PROJECT_DATA : [];
const projectDataMap = PROJECT_DATA.reduce((acc, project) => {
  if (project?.id) acc[project.id] = project;
  return acc;
}, {});

const buildSkillDirectory = () => {
  const directory = new Map();
  PROJECT_DATA.forEach(project => {
    const skills = project.skills || [];
    skills.forEach(skill => {
      if (!directory.has(skill)) {
        directory.set(skill, { name: skill, projects: [] });
      }
      const entry = directory.get(skill);
      if (!entry.projects.some(p => p.id === project.id)) {
        entry.projects.push({ id: project.id, name: project.name || project.id });
      }
    });
  });
  return Array.from(directory.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const skillDirectory = buildSkillDirectory();

const createSkillTagsElement = (skills = [], labelText = '', options = {}) => {
  if (!skills.length) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'project-tags';
  if (labelText) wrapper.setAttribute('aria-label', labelText);
  const maxVisible = typeof options.maxVisible === 'number' ? options.maxVisible : null;
  const visibleSkills = maxVisible ? skills.slice(0, maxVisible) : skills;
  visibleSkills.forEach(skill => {
    const tag = document.createElement('span');
    tag.className = 'project-tag';
    tag.textContent = skill;
    wrapper.appendChild(tag);
  });
  if (maxVisible && skills.length > maxVisible) {
    const remainder = document.createElement('span');
    remainder.className = 'project-tag project-tag--more';
    remainder.textContent = `+${skills.length - maxVisible}`;
    wrapper.appendChild(remainder);
  }
  return wrapper;
};

const applySkillsToProjectCards = () => {
  document.querySelectorAll('.project-cells .project-cell').forEach(card => {
    if (card.querySelector('.project-tags')) return;
    const projectId = card.dataset.projectId;
    const projectInfo = projectDataMap[projectId];
    const skills = projectInfo?.skills || [];
    if (!skills.length) return;
    const labelText = `Skills used on ${projectInfo?.name || card.dataset.modalTitle || card.querySelector('h3')?.textContent || 'this project'}`;
    const tagsElement = createSkillTagsElement(skills, labelText, { maxVisible: 5 });
    if (!tagsElement) return;
    const insertAfter = card.querySelector('h4') || card.querySelector('h3');
    if (insertAfter) {
      insertAfter.insertAdjacentElement('afterend', tagsElement);
    } else {
      card.prepend(tagsElement);
    }
  });
};

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

const createSlideshowElement = (images = [], altPrefix = 'Project image') => {
  if (!images.length) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'slideshow';

  images.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `${altPrefix} ${index + 1}`;
    img.className = 'slide';
    if (index === 0) img.classList.add('active');
    wrapper.appendChild(img);
  });

  const prevBtn = document.createElement('button');
  prevBtn.className = 'prev';
  prevBtn.innerHTML = '&#10094;';
  prevBtn.setAttribute('aria-label', 'Previous slide');

  const nextBtn = document.createElement('button');
  nextBtn.className = 'next';
  nextBtn.innerHTML = '&#10095;';
  nextBtn.setAttribute('aria-label', 'Next slide');

  wrapper.appendChild(prevBtn);
  wrapper.appendChild(nextBtn);

  return wrapper;
};

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
applySkillsToProjectCards();

// Project detail modal
const projectModal = document.getElementById('project-modal');
if (projectModal) {
  const modalTitle = projectModal.querySelector('.project-modal__title');
  const modalMeta = projectModal.querySelector('.project-modal__meta');
  const modalDescription = projectModal.querySelector('.project-modal__description');
  const modalMedia = projectModal.querySelector('.project-modal__media');
  const modalTagsSection = projectModal.querySelector('.project-modal__tags');
  const modalTagsList = projectModal.querySelector('.project-modal__tags-list');
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
    if (modalTagsList) {
      modalTagsList.innerHTML = "";
    }
    if (modalTagsSection) {
      modalTagsSection.style.display = 'none';
    }
    modalLinks.innerHTML = "";

    const slideshow = card.querySelector('.slideshow');
    const projectId = card.dataset.projectId;
    const projectInfo = projectDataMap[projectId];
    const projectSkills = projectInfo?.skills || [];
    const modalSlides = (card.dataset.modalSlides || '')
      .split('|')
      .map(src => src.trim())
      .filter(Boolean);

    if (modalSlides.length) {
      const modalSlideshow = createSlideshowElement(modalSlides, `${modalTitle.textContent} modal image`);
      if (modalSlideshow) {
        modalMedia.appendChild(modalSlideshow);
      }
    } else if (slideshow) {
      const slideshowClone = slideshow.cloneNode(true);
      modalMedia.appendChild(slideshowClone);
    }

    if (projectSkills.length && modalTagsList && modalTagsSection) {
      const modalTagsElement = createSkillTagsElement(projectSkills);
      if (modalTagsElement) {
        modalTagsList.innerHTML = '';
        modalTagsList.appendChild(modalTagsElement);
        modalTagsSection.style.display = 'block';
      }
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

  const openProjectById = (projectId) => {
    if (!projectId) return;
    const targetCard = Array.from(projectCards).find(card => card.dataset.projectId === projectId);
    if (targetCard) {
      openProjectModal(targetCard);
    }
  };

  const closeProjectModal = () => {
    teardownSlideshows(modalMedia);
    modalMedia.innerHTML = "";
    if (modalTagsList) {
      modalTagsList.innerHTML = "";
    }
    if (modalTagsSection) {
      modalTagsSection.style.display = 'none';
    }
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

  const handleProjectDeepLink = () => {
    if (!window.URLSearchParams) return;
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('project');
    if (targetId) {
      openProjectById(targetId);
      if (history.replaceState) {
        params.delete('project');
        const queryString = params.toString();
        const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`;
        history.replaceState(null, '', newUrl);
      }
    }
  };

  handleProjectDeepLink();
}

const initSkillsPage = () => {
  const skillsPageRoot = document.getElementById('skills-page');
  if (!skillsPageRoot) return;

  const searchInput = document.getElementById('skill-search');
  const projectFilter = document.getElementById('skill-project-filter');
  const skillsGrid = document.getElementById('skills-grid');
  if (!skillsGrid) return;

  let sectionsRevealed = false;
  const revealSections = () => {
    if (sectionsRevealed) return;
    sectionsRevealed = true;
    requestAnimationFrame(() => {
      skillsPageRoot.querySelectorAll('.fade-in-section').forEach(section => {
        section.classList.add('visible');
      });
    });
  };

  const renderSkillCards = (skills) => {
    const fragment = document.createDocumentFragment();
    if (!skills.length) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'skills-empty';
      emptyMsg.textContent = 'No skills match your filters yet.';
      fragment.appendChild(emptyMsg);
      skillsGrid.innerHTML = '';
      skillsGrid.appendChild(fragment);
      return;
    }
    skills.forEach(skill => {
      const card = document.createElement('div');
      card.className = 'skill-card';
      const projectCount = skill.projects.length;
      const projectLabel = projectCount === 1 ? 'project' : 'projects';
      card.innerHTML = `
        <h3>${skill.name}</h3>
        <p>${projectCount} ${projectLabel}</p>
      `;
      const projectList = document.createElement('div');
      projectList.className = 'skill-card__projects';
      skill.projects.forEach(project => {
        const badge = document.createElement('button');
        badge.type = 'button';
        badge.className = 'skill-card__project-btn';
        badge.dataset.projectId = project.id;
        badge.textContent = project.name;
        badge.addEventListener('click', () => {
          window.location.href = `/projects/?project=${encodeURIComponent(project.id)}`;
        });
        projectList.appendChild(badge);
      });
      card.appendChild(projectList);
      fragment.appendChild(card);
    });
    skillsGrid.innerHTML = '';
    skillsGrid.appendChild(fragment);
  };

  if (projectFilter) {
    PROJECT_DATA.forEach(project => {
      const option = document.createElement('option');
      option.value = project.id;
      option.textContent = project.name;
      projectFilter.appendChild(option);
    });
  }

  const applySkillFilters = () => {
    const term = (searchInput?.value || '').toLowerCase().trim();
    const projectId = projectFilter?.value || 'all';
    const filtered = skillDirectory.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(term);
      const matchesProject = projectId === 'all' || skill.projects.some(p => p.id === projectId);
      return matchesSearch && matchesProject;
    });
    renderSkillCards(filtered);
  };

  searchInput?.addEventListener('input', applySkillFilters);
  projectFilter?.addEventListener('change', applySkillFilters);
  renderSkillCards(skillDirectory);
  revealSections();
};

initSkillsPage();

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

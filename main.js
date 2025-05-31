// Headshot image slideshow logic
const headshotList = [
  "img1.webp", "img8.webp", "img3.webp", "img4.webp", "img5.webp",
  "img7.webp", "img9.webp", "img10.webp", "img11.webp", "img12.webp",
  "img13.webp", "img14.webp", "img15.webp", "img16.webp", "img17.webp"
];
let headshotElement = document.getElementById("headshot");
let headshotIndex = 0;
function updateHeadshot() {
  const nextIndex = (headshotIndex + 1) % headshotList.length;
  const newImg = document.createElement("img");
  newImg.src = "images/headshots/" + headshotList[nextIndex];
  newImg.alt = "klein cafa headshot";
  newImg.classList.add("headshot-img");
  newImg.style.opacity = 0;
  newImg.style.zIndex = "0";
  const container = headshotElement.parentElement;
  container.appendChild(newImg);
  requestAnimationFrame(() => {
    newImg.style.opacity = 1;
    headshotElement.style.opacity = 0;
  });
  newImg.onload = () => {
    setTimeout(() => {
      container.removeChild(headshotElement);
      newImg.id = "headshot";
      newImg.classList.remove("headshot-img");
      headshotElement = newImg;
    }, 500);
  };
  headshotIndex = nextIndex;
}
headshotElement.src = "images/headshots/" + headshotList[0];
headshotElement.alt = "klein cafa headshot";
headshotIndex = 0;
setInterval(updateHeadshot, 5000);

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

// Project modals and navigation
let currentModalSlides = [];
let currentModalIndex = 0;
document.querySelectorAll('.slideshow').forEach(slideshow => {
  const slides = slideshow.querySelectorAll('.slide');
  const nextBtn = slideshow.querySelector('.next');
  const prevBtn = slideshow.querySelector('.prev');
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
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      const modal = document.getElementById("modal");
      modal.style.display = "flex";
      modal.querySelector("img").src = slide.src;
      currentModalSlides = Array.from(slides);
      currentModalIndex = i;
    });
  });
  setInterval(nextSlide, 5000);
});
document.querySelector('.modal-prev').addEventListener('click', e => {
  e.stopPropagation();
  if (currentModalSlides.length > 0) {
    currentModalIndex = (currentModalIndex - 1 + currentModalSlides.length) % currentModalSlides.length;
    document.querySelector("#modal img").src = currentModalSlides[currentModalIndex].src;
  }
});
document.querySelector('.modal-next').addEventListener('click', e => {
  e.stopPropagation();
  if (currentModalSlides.length > 0) {
    currentModalIndex = (currentModalIndex + 1) % currentModalSlides.length;
    document.querySelector("#modal img").src = currentModalSlides[currentModalIndex].src;
  }
});
document.querySelector('.modal-close').addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById("modal").style.display = "none";
});

// Typewriter animation
const sentence = "Hello, World! I'm Klein ";
const emoji = "👋";
const typewriterTarget = document.getElementById("typewriter-text");
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
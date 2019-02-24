const CSS_CLASSES = {
  SLIDER: `slider`,
  SLIDES_CONTAINER: `slider__slides`,
  SLIDE: `slider__slides__slide`,
  ANIMATING: `slider__slides__slide--animating`,
  SLIDE_FROM_LEFT: `slider__slides__slide--slide-from-left`,
  SLIDE_FROM_RIGHT: `slider__slides__slide--slide-from-right`,
};

const slider = document.querySelector(`.${CSS_CLASSES.SLIDER}`);
const slidesContainer = slider.querySelector(`.${CSS_CLASSES.SLIDES_CONTAINER}`);
const slides = slider.querySelectorAll(`.${CSS_CLASSES.SLIDE}`);

let activeSlideIndex = 0;
let nextSlideIndex = 0;

const nextSlideTimeout = 2000; // intervalul intre care se schimba slide-urile

slidesContainer.setAttribute('role', 'listbox');
slidesContainer.setAttribute('aria-live', 'polite');

slides.forEach(slide => {
  slide.setAttribute('role', 'option');
  slide.setAttribute('aria-hidden', 'true');

  slide.addEventListener('transitionend', () => {
    // cand se termina tranzitia
    if (!slide.classList.contains(CSS_CLASSES.SLIDE_FROM_LEFT)) {
      return;
    } // daca nu e slide care a trecut in stanga il ignoram

    // il mutam la dreapta fara tranzitie (il "teleportam")
    slide.classList.remove(CSS_CLASSES.ANIMATING);
    slide.classList.remove(CSS_CLASSES.SLIDE_FROM_LEFT);
    slide.classList.add(CSS_CLASSES.SLIDE_FROM_RIGHT);

    // ii redam tranzitia dupa ce l-am mutat
    requestAnimationFrame(() =>
      requestAnimationFrame(() => slide.classList.add(CSS_CLASSES.ANIMATING))
    );
  });
});

function slideFromRight(index) {
  const activeSlide = slides[activeSlideIndex];

  activeSlide.classList.add(CSS_CLASSES.ANIMATING); // in cazul in care tranzitiile erau dezactivate, le reactivam
  activeSlide.classList.add(CSS_CLASSES.SLIDE_FROM_LEFT); // mutam slide-ul curent in stanga

  nextSlideIndex = index % slides.length;

  const nextSlide = slides[nextSlideIndex];

  // nextSlide = activeSlide.nextElementSibling || slides[0]; // daca nu mai avem slide mai la dreapta, urmatorul slide este primul

  nextSlide.classList.add(CSS_CLASSES.ANIMATING); // reactivam tranzitiile pentru slide-ul din dreapta
  nextSlide.classList.remove(CSS_CLASSES.SLIDE_FROM_RIGHT); // il aducem din dreapta, in mijloc

  activeSlide.setAttribute('aria-hidden', 'true');
  nextSlide.setAttribute('aria-hidden', 'false');

  activeSlideIndex = nextSlideIndex; // trecem mai departe
}

function slideFromLeft(index) {
  const nextSlide = slides[activeSlideIndex];
  nextSlideIndex = activeSlideIndex;

  activeSlideIndex = index;
  if (activeSlideIndex < 0) {
    activeSlideIndex = slides.length - 1;
  }

  const activeSlide = slides[activeSlideIndex];

  // nextSlide = activeSlide; // slide-ul care trece in dreapta este cel curent
  // activeSlide = activeSlide.previousElementSibling || slides[slides.length - 1]; // slide-ul curent este cel din stanga; daca nu mai sunt elemente in stanga, luam ultimul slide (ex: de la slide-ul 1 la slide-ul 5)

  activeSlide.setAttribute('aria-hidden', 'false');
  nextSlide.setAttribute('aria-hidden', 'true');

  // slide-ul curent desi vine din stanga, a fost "teleportat" in dreapta
  // trebuie sa il "teleportam" inapoi in stanga ca sa putem sa facem tranzitia
  activeSlide.classList.add(CSS_CLASSES.SLIDE_FROM_LEFT);
  activeSlide.classList.remove(CSS_CLASSES.ANIMATING);
  activeSlide.classList.remove(CSS_CLASSES.SLIDE_FROM_RIGHT);

  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      // mutam slide-ul din centru spre dreapta
      nextSlide.classList.add(CSS_CLASSES.SLIDE_FROM_RIGHT);

      // reactivam tranzitia pentru slide-ul curent si il mutam de la stanga spre centru
      activeSlide.classList.add(CSS_CLASSES.ANIMATING);
      activeSlide.classList.remove(CSS_CLASSES.SLIDE_FROM_LEFT);
    })
  );
}

function showSlide(index) {
  index > activeSlideIndex ? slideFromRight(index) : slideFromLeft(index);
}

function showNextSlide() {
  showSlide(activeSlideIndex + 1); // treci la slide-ul urmator
}

function showPreviousSlide() {
  showSlide(activeSlideIndex - 1); // treci la slide-ul precedent
}

let interval = setInterval(showNextSlide, nextSlideTimeout); // muta automat slide-urile

window.addEventListener('keyup', event => {
  switch (event.key) {
    case 'ArrowLeft':
      showSlide(activeSlideIndex - 1); // treci la slide-ul precedent
      break;

    case 'ArrowRight':
      showSlide(activeSlideIndex + 1); // treci la slide-ul urmator
      break;

    default:
      break;
  }

  // reseteaza intervalul
  clearInterval(interval);
  interval = setInterval(showNextSlide, nextSlideTimeout);
});

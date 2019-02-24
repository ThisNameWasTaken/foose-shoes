const CSS_CLASSES = {
  SLIDER: `slider`,
  SLIDES_CONTAINER: `slider__slides`,
  SLIDE: `slider__slides__slide`,
  ANIMATING: `slider__slides__slide--animating`,
  SLIDE_TO_LEFT: `slider__slides__slide--slide-to-left`,
  SLIDE_FROM_RIGHT: `slider__slides__slide--slide-from-right`,
};

class Slider {
  static lorem = '';
}

const _slider = document.querySelector(`.${CSS_CLASSES.SLIDER}`);
const _slidesContainer = _slider.querySelector(`.${CSS_CLASSES.SLIDES_CONTAINER}`);
const _slides = _slider.querySelectorAll(`.${CSS_CLASSES.SLIDE}`);

let _activeSlideIndex = 0;
let _nextSlideIndex = 0;

const _nextSlideTimeout = 2000; // The interval between switching to the next slide.

// Set the aria attributes for the slider container
_slidesContainer.setAttribute('role', 'listbox');
_slidesContainer.setAttribute('aria-live', 'polite');

[..._slides].forEach(slide => {
  requestAnimationFrame(() => {
    slide.setAttribute('role', 'option'); // Add a proper aria role.
    slide.setAttribute('aria-hidden', 'true'); // Hide the slide from the screen readers.
    slide.setAttribute('tabindex', '-1'); // Remove the ability to focus elements inside the slide.

    slide.addEventListener('transitionend', () => {
      // If it's not a left slide.
      if (!slide.classList.contains(CSS_CLASSES.SLIDE_TO_LEFT)) {
        return; // Ignore it.
      }

      // Move it to the right without animating it.
      slide.classList.remove(CSS_CLASSES.ANIMATING);
      slide.classList.remove(CSS_CLASSES.SLIDE_TO_LEFT);
      slide.classList.add(CSS_CLASSES.SLIDE_FROM_RIGHT);

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const isActiveSlide = slide.getAttribute('aria-hidden') === 'false';
          if (isActiveSlide) {
            // If the active slide was moved to the right
            slide.classList.remove(CSS_CLASSES.SLIDE_FROM_RIGHT); // Move it to the center.
          }
          slide.classList.add(CSS_CLASSES.ANIMATING); // Restore the animations.
        })
      );
    });
  });
});

function _slideFromRight(index) {
  requestAnimationFrame(() => {
    const activeSlide = _slides[_activeSlideIndex];

    _nextSlideIndex = index % _slides.length;

    const nextSlide = _slides[_nextSlideIndex];

    activeSlide.setAttribute('aria-hidden', 'true'); // Show on screen readers.
    nextSlide.setAttribute('aria-hidden', 'false'); // Hide from screen readers.

    activeSlide.removeAttribute('tabindex'); // Restore focus.
    nextSlide.setAttribute('tabindex', '-1'); // Remove the ability to focus elements inside the next slide.

    activeSlide.classList.add(CSS_CLASSES.ANIMATING); // Enable animations.
    activeSlide.classList.add(CSS_CLASSES.SLIDE_TO_LEFT); // Slide to the left.

    nextSlide.classList.add(CSS_CLASSES.ANIMATING); // Enable animations for the next slide.
    nextSlide.classList.remove(CSS_CLASSES.SLIDE_FROM_RIGHT); // Slide from the right.

    _activeSlideIndex = _nextSlideIndex; // Update the active index.
  });
}

function _slideFromLeft(index) {
  requestAnimationFrame(() => {
    const activeSlide = _slides[_activeSlideIndex];
    _nextSlideIndex = _activeSlideIndex;

    _activeSlideIndex = index;
    if (_activeSlideIndex < 0) {
      _activeSlideIndex = _slides.length - 1;
    }

    const nextSlide = _slides[_activeSlideIndex];

    activeSlide.setAttribute('aria-hidden', 'true'); // Show on screen readers.
    nextSlide.setAttribute('aria-hidden', 'false'); // Hide from screen readers.

    activeSlide.removeAttribute('tabindex'); // Restore focus.
    nextSlide.setAttribute('tabindex', '-1'); // Remove the ability to focus elements inside the next slide.

    // Move the left slide to the left without animations
    nextSlide.classList.add(CSS_CLASSES.SLIDE_TO_LEFT);
    nextSlide.classList.remove(CSS_CLASSES.ANIMATING);
    nextSlide.classList.remove(CSS_CLASSES.SLIDE_FROM_RIGHT);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        activeSlide.classList.add(CSS_CLASSES.SLIDE_FROM_RIGHT); // Move the center slide to the right

        nextSlide.classList.add(CSS_CLASSES.ANIMATING); // Restore animations for the current slide.
        nextSlide.classList.remove(CSS_CLASSES.SLIDE_TO_LEFT); // Slide it from the left.
      })
    );
  });
}

function showSlide(index) {
  index > _activeSlideIndex ? _slideFromRight(index) : _slideFromLeft(index);
}

function showNextSlide() {
  showSlide(_activeSlideIndex + 1);
}

function showPreviousSlide() {
  showSlide(_activeSlideIndex - 1);
}

window.addEventListener('keyup', event => {
  switch (event.key) {
    case 'ArrowLeft':
      showSlide(_activeSlideIndex - 1);
      break;

    case 'ArrowRight':
      showSlide(_activeSlideIndex + 1);
      break;

    default:
      break;
  }
});

/**
 * @typedef SliderOptions
 * @type {Object}
 * @property {Boolean} [autoplay=true] - Automatically switch to the next slide. The switch is done after `speed` ms have passed.
 * @property {Number} [speed=2000] - The timeout (ms) before switching to the next slide when autoplay is enabled.
 */

export default class Slider {
  static CSS_CLASSES = {
    SLIDER: `slider`,
    SLIDES_CONTAINER: `slider__slides`,
    SLIDE: `slider__slides__slide`,
    ANIMATING: `slider__slides__slide--animating`,
    SLIDE_TO_LEFT: `slider__slides__slide--slide-to-left`,
    SLIDE_FROM_RIGHT: `slider__slides__slide--slide-from-right`,
    CONTROL: 'slider__controls__control',
    CONTROL_ACTIVE: 'slider__controls__control--active',
  };

  static _options = {
    autoplay: true,
    speed: 2000,
  };

  _activeSlideIndex = 0;
  _nextSlideIndex = 0;

  /**
   * @param {HTMLElement} root
   * @param {SliderOptions} [options={}]
   */
  constructor(root, options = {}) {
    // Bind methods to this instance.
    this.showSlide = this.showSlide.bind(this);
    this.showNextSlide = this.showNextSlide.bind(this);
    this.showPreviousSlide = this.showPreviousSlide.bind(this);

    this._slider = root;
    this._slidesContainer = this._slider.querySelector(
      `.${Slider.CSS_CLASSES.SLIDES_CONTAINER}`
    );
    this._slides = this._slider.querySelectorAll(`.${Slider.CSS_CLASSES.SLIDE}`);
    this._speed = options.speed || Slider._options.speed; // The interval between switching to the next slide.

    this._autoplay = options.autoplay || Slider._options.autoplay;
    if (this._autoplay) {
      this._interval = setInterval(this.showNextSlide, this._speed);
    }

    // Set the aria attributes for the slider container
    this._slidesContainer.setAttribute('role', 'listbox');
    this._slidesContainer.setAttribute('aria-live', 'polite');

    this._controls = this._slider.querySelectorAll(`.${Slider.CSS_CLASSES.CONTROL}`);

    [...this._slides].forEach((slide, index) => {
      requestAnimationFrame(() => {
        slide.setAttribute('role', 'option'); // Add a proper aria role.
        slide.setAttribute('aria-hidden', 'true'); // Hide the slide from the screen readers.
        slide.setAttribute('tabindex', '-1'); // Remove the ability to focus elements inside the slide.

        slide.addEventListener('transitionend', () => {
          // If it's not a left slide.
          if (!slide.classList.contains(Slider.CSS_CLASSES.SLIDE_TO_LEFT)) {
            return; // Ignore it.
          }

          // Move it to the right without animating it.
          slide.classList.remove(Slider.CSS_CLASSES.ANIMATING);
          slide.classList.remove(Slider.CSS_CLASSES.SLIDE_TO_LEFT);
          slide.classList.add(Slider.CSS_CLASSES.SLIDE_FROM_RIGHT);

          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              const isActiveSlide = slide.getAttribute('aria-hidden') === 'false';
              if (isActiveSlide) {
                // If the active slide was moved to the right
                slide.classList.remove(Slider.CSS_CLASSES.SLIDE_FROM_RIGHT); // Move it to the center.
              }
              slide.classList.add(Slider.CSS_CLASSES.ANIMATING); // Restore the animations.
            })
          );
        });

        this._controls[index].addEventListener('click', () => this.showSlide(index));
      });
    });
  }

  /**
   * @param {Number} index
   * @private
   */
  _slideFromRight(index) {
    requestAnimationFrame(() => {
      const activeSlide = this._slides[this._activeSlideIndex];

      this._nextSlideIndex = index % this._slides.length;

      const nextSlide = this._slides[this._nextSlideIndex];

      activeSlide.setAttribute('aria-hidden', 'true'); // Show on screen readers.
      nextSlide.setAttribute('aria-hidden', 'false'); // Hide from screen readers.

      activeSlide.removeAttribute('tabindex'); // Restore focus.
      nextSlide.setAttribute('tabindex', '-1'); // Remove the ability to focus elements inside the next slide.

      activeSlide.classList.add(Slider.CSS_CLASSES.ANIMATING); // Enable animations.
      activeSlide.classList.add(Slider.CSS_CLASSES.SLIDE_TO_LEFT); // Slide to the left.

      nextSlide.classList.add(Slider.CSS_CLASSES.ANIMATING); // Enable animations for the next slide.
      nextSlide.classList.remove(Slider.CSS_CLASSES.SLIDE_FROM_RIGHT); // Slide from the right.

      // Update the controls.
      this._controls[this._nextSlideIndex].classList.add(
        Slider.CSS_CLASSES.CONTROL_ACTIVE
      );
      this._controls[this._activeSlideIndex].classList.remove(
        Slider.CSS_CLASSES.CONTROL_ACTIVE
      );

      this._activeSlideIndex = this._nextSlideIndex; // Update the active index.
    });
  }

  /**
   * @param {Number} index
   * @private
   */
  _slideFromLeft(index) {
    requestAnimationFrame(() => {
      const activeSlide = this._slides[this._activeSlideIndex];
      this._nextSlideIndex = this._activeSlideIndex;

      this._activeSlideIndex = index;
      if (this._activeSlideIndex < 0) {
        this._activeSlideIndex = this._slides.length - 1;
      }

      const nextSlide = this._slides[this._activeSlideIndex];

      // Update the controls.
      this._controls[this._nextSlideIndex].classList.remove(
        Slider.CSS_CLASSES.CONTROL_ACTIVE
      );
      this._controls[this._activeSlideIndex].classList.add(
        Slider.CSS_CLASSES.CONTROL_ACTIVE
      );

      activeSlide.setAttribute('aria-hidden', 'true'); // Show on screen readers.
      nextSlide.setAttribute('aria-hidden', 'false'); // Hide from screen readers.

      activeSlide.removeAttribute('tabindex'); // Restore focus.
      nextSlide.setAttribute('tabindex', '-1'); // Remove the ability to focus elements inside the next slide.

      // Move the left slide to the left without animations
      nextSlide.classList.add(Slider.CSS_CLASSES.SLIDE_TO_LEFT);
      nextSlide.classList.remove(Slider.CSS_CLASSES.ANIMATING);
      nextSlide.classList.remove(Slider.CSS_CLASSES.SLIDE_FROM_RIGHT);

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          activeSlide.classList.add(Slider.CSS_CLASSES.SLIDE_FROM_RIGHT); // Move the center slide to the right

          nextSlide.classList.add(Slider.CSS_CLASSES.ANIMATING); // Restore animations for the current slide.
          nextSlide.classList.remove(Slider.CSS_CLASSES.SLIDE_TO_LEFT); // Slide it from the left.
        })
      );
    });
  }

  /**
   * Shows the slide at the given index.
   * @param {Number} index
   */
  showSlide(index) {
    // If autoplay is enabled.
    if (this._autoplay) {
      // Reset the interval.
      clearInterval(this._interval);
      this._interval = setInterval(this.showNextSlide, this._speed);
    }

    // If it's the active slide.
    if (index === this._activeSlideIndex) {
      return; // Do nothing;
    }

    // Decide whether to go backwards or forwards.
    index > this._activeSlideIndex
      ? this._slideFromRight(index)
      : this._slideFromLeft(index);
  }

  showNextSlide() {
    this.showSlide(this._activeSlideIndex + 1);
  }

  showPreviousSlide() {
    this.showSlide(this._activeSlideIndex - 1);
  }
}

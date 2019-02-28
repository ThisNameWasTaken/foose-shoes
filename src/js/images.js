(async () => {
  if (!('IntersectionObserver' in window)) {
    await import('intersection-observer');
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      }

      const image = entry.target;

      if (image.dataset.src) {
        // If it is an image tag.
        image.src = image.dataset.src; // Set the source.
      } else if (image.dataset.srcset) {
        // If it is a source tag.
        image.srcset = image.dataset.srcset; // Set the source set
      } else if (image.dataset.backgroundUrl) {
        // If it is a background
        image.style.backgroundImage = `url(${image.dataset.backgroundUrl})`; // Set the background image url
      }

      imageObserver.unobserve(image);
    });
  });

  const images = [
    ...document.querySelectorAll('[data-background-url],[data-src],[data-srcset]'),
  ];

  images.forEach(image => imageObserver.observe(image));
})();

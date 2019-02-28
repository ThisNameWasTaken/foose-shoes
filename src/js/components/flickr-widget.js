(async () => {
  if (!('IntersectionObserver' in window)) {
    await import('intersection-observer');
  }

  const flickrWidget = document.querySelector('#flickr-widget');
  const flickrImageElements = flickrWidget.querySelectorAll('.flickr-image');

  if (!flickrImageElements) {
    return;
  }

  const flickrObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(async entry => {
      if (!entry.isIntersecting) {
        return;
      }

      const flickrWidget = entry.target;

      try {
        const flickrResponse = await fetch(
          'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=316831150b042673f5f20cfd39581ce9&tags=shoe&per_page=6&page=1&format=json&nojsoncallback=1&auth_token=72157676868969617-25c0b9acf8f58a79&api_sig=add54c66a94f8ae650728b76c2744e97'
        ).then(res => res.json());

        const getImageSource = ({ farm, server, id, secret }) =>
          `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}.jpg`;

        const flickrImages = flickrResponse.photos.photo.map(photoData => ({
          src: getImageSource(photoData),
          alt: photoData.title,
        }));

        flickrImageElements.forEach((imageElement, index) => {
          imageElement.style.backgroundImage = `url(${flickrImages[index].src ||
            ''})`;
        });
      } catch (error) {
        console.error(error);
      }

      flickrObserver.unobserve(flickrWidget);
    });
  });

  flickrObserver.observe(flickrWidget);
})();

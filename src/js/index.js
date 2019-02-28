import Slider from './slider';
import './images';
import './components/search-field';
import './components/blog-news-widget';
import './components/twitter-widget';
import './components/flickr-widget';
import './components/login-or-register';
import './components/mobile-menu';

const sliderElement = document.querySelector(`.${Slider.CSS_CLASSES.SLIDER}`);
if (sliderElement) {
  new Slider(sliderElement);
}

(() => {
  const gridButton = document.querySelector('#display-grid');
  const listButton = document.querySelector('#display-list');

  if (!gridButton || !listButton) {
    return;
  }

  const shoeCards = [...document.querySelectorAll('.shoe-card')];
  const gridCells = shoeCards.map(shoeCard => shoeCard.parentElement);

  gridButton.addEventListener('click', () => {
    console.log('click');
    shoeCards.forEach(shoeCard => shoeCard.classList.remove('shoe-card--list'));
    gridCells.forEach(gridCell => {
      gridCell.classList.add('col-md-6');
      gridCell.classList.add('col-lg-4');
    });
  });

  listButton.addEventListener('click', () => {
    console.log('click');
    gridCells.forEach(gridCell => {
      gridCell.classList.remove('col-md-6');
      gridCell.classList.remove('col-lg-4');
    });
    shoeCards.forEach(shoeCard => shoeCard.classList.add('shoe-card--list'));
  });
})();

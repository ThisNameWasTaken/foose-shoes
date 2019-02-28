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

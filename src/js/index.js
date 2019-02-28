import Slider from './slider';
import './images';
import './components/search-field';
import './components/blog-news-widget';
import './components/twitter-widget';
import './components/flickr-widget';
import './components/login-or-register';

new Slider(document.querySelector(`.${Slider.CSS_CLASSES.SLIDER}`));

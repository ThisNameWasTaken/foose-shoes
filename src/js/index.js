import Slider from './slider';
import './images';
import './components/search-field';
import './components/blog-news-widget';
import './components/twitter-widget';
import './components/flickr-widget';

new Slider(document.querySelector(`.${Slider.CSS_CLASSES.SLIDER}`));

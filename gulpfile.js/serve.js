const { watch, series } = require('gulp');
const { DIR: { SRC, DEST, VIEWS, STYLES, JS, IMAGES }, SERVER: { CORS, PORT, HTTPS } } = require('./constants');
const { bundle, html, js, stylesheets, images } = require('./bundle');
const browserSync = require('./browserSyncInstance');
const build = require('./build');

// Production
const watchProd = done => {
  watch(`${SRC}/**/*.{html,js,mjs,css,scss,sass,jpg,jpeg,png,svg,gif,webp}`, build);

  watch(`${DEST}/**/!(*.css)`).on('change', browserSync.reload);

  browserSync.init({
    port: PORT,
    server: `./${DEST}`,
    cors: CORS,
    https: HTTPS,
  });

  return done();
};

const serve = series(build, watchProd);

// Development
const watchDev = done => {
  watch(`${SRC}/${VIEWS}/**/*.html`, bundle);

  watch(`${SRC}/${JS}/**/*.{js,mjs}`, js);

  watch(`${SRC}/${STYLES}/**/*.{css,scss,sass}`, series(stylesheets, images));

  watch(`${SRC}/${IMAGES}/**/*.{jpg,jpeg,png,svg,gif,webp}`, images);

  watch(`${DEST}/**/!(*.css)`).on('change', browserSync.reload);

  browserSync.init({
    port: PORT,
    server: `./${DEST}`,
    cors: CORS,
    https: HTTPS,
  });

  return done();
};

const start = series(bundle, watchDev);

module.exports = {
  serve,
  start,
};

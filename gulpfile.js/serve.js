const { task, watch } = require('gulp');
const { DIR: { SRC, DEST }, SERVER: { CORS, PORT, HTTPS } } = require('./constants');
const browserSync = require('browser-sync').create();
const shell = require('gulp-shell');

const serve = task('serve', done => {
  watch(
    `${SRC}/**/*.{html,js,mjs,css,scss,sass,jpg,jpeg,png,svg,gif,webp}`,
    shell.task(`npm run build && npx browser-sync reload --port ${PORT}`)
  );

  browserSync.init({
    port: PORT,
    server: `./${DEST}`,
    cors: CORS,
    https: HTTPS,
  });

  return done();
});

const start = task('start', done => {
  watch(
    `${SRC}/**/*.{html,js,mjs,css,scss,sass,jpg,jpeg,png,svg,gif,webp}`,
    shell.task(`npm run build:dev && npx browser-sync reload --port ${PORT}`)
  );

  browserSync.init({
    port: PORT,
    server: `./${DEST}`,
    cors: CORS,
    https: HTTPS,
  });

  return done();
});

module.exports = {
  serve,
  start,
};

const { task, watch, series, src } = require('gulp');
const { IS_PROD, DIR: { SRC, DEST } } = require('./constants');
// const connect = require('gulp-connect');
const browserSync = require('browser-sync').create();
const shell = require('gulp-shell');

const reload = task('reload', done => {
  console.log('reload')
  browserSync.reload();
  return done();
});

const serve = task('serve', done => {
  watch(
    `${SRC}/**/*.{html,js,mjs,css,scss,sass,jpg,jpeg,png,svg,gif,webp}`,
    shell.task('npx gulp bundle && npx gulp inlineCriticalStyles && npx gulp minifyHtml && npx browser-sync reload --port 5555')
  );

  browserSync.init({
    port: 5555,
    server: './dist',
  });

  return done();
});

module.exports = {
  serve,
  reload,
};

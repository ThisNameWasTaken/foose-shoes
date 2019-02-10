const { src, dest } = require('gulp');
const { IS_DEV, DIR: { DEST } } = require('./constants');
const htmlmin = require('gulp-htmlmin');

const minifyOptions = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  collapseInlineTagWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  sortAttributes: true,
  sortClassName: true,
};

const minifyHtml = done => {
  if (IS_DEV) { return done(); } // skip during development

  src(`${DEST}/*.html`)
    .pipe(htmlmin(minifyOptions))
    .pipe(dest(`${DEST}`));

  return done();
}
module.exports = minifyHtml;

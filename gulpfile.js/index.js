const { series, parallel } = require('gulp');
const bundle = require('./bundle');
const inlineCriticalStyles = require('./inlineCriticalStyles');
const minifyHtml = require('./minifyHtml');
const { serve, start } = require('./serve');

module.exports = {
  bundle,
  inlineCriticalStyles,
  minifyHtml,
  serve,
  start,
  default: series(bundle, inlineCriticalStyles, minifyHtml)
}

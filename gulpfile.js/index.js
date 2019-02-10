const { series, parallel } = require('gulp');
const bundle = require('./bundle');
const inlineCriticalStyles = require('./inlineCriticalStyles');
const minifyHtml = require('./minifyHtml');
const { serve, reload } = require('./serve');

module.exports = {
  bundle,
  inlineCriticalStyles,
  minifyHtml,
  serve,
  reload,
  default: series(bundle, inlineCriticalStyles, minifyHtml)
}

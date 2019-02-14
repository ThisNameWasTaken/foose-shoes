const { series } = require('gulp');
const { bundle } = require('./bundle');
const inlineCriticalStyles = require('./inlineCriticalStyles');
const minifyHtml = require('./minifyHtml');

const build = series(bundle, inlineCriticalStyles, minifyHtml);

module.exports = build;

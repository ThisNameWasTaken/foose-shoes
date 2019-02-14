const { serve, start } = require('./serve');
const build = require('./build');

module.exports = {
  serve,
  start,
  build,
  default: build,
};

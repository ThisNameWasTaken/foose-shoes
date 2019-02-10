
const IS_DEV = process.argv.includes('--development');
const IS_PROD = !IS_DEV;

module.exports = {
  DIR: {
    SRC: 'src',
    DEST: 'dist',
    STYLES: 'styles',
    JS: 'js',
    VIEWS: 'views',
    SW: 'serviceWorker.js',
  },
  IS_DEV,
  IS_PROD,
};

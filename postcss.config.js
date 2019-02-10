const { IS_PROD } = require('./gulpfile.js/constants');

module.exports = {
  plugins: [
    require('autoprefixer')({
      browsers: [
        'last 2 versions',
        '> 1%',
      ],
    }),
    IS_PROD && // skip during development
    require('cssnano')({
      preset: ['default', {
        cssDeclarationSorter: true,
        discardComments: {
          removeAll: true,
        },
        mergeIdents: true,
        reduceIdents: true,
      }],
    }),
  ],
};

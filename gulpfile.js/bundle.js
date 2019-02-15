const { src, dest, series, parallel } = require('gulp');
const { IS_PROD, DIR: { SRC, DEST, VIEWS } } = require('./constants');
const path = require('path');
const flatmap = require('gulp-flatmap');
const rename = require('gulp-rename');
const IF = require('gulp-if');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const purgecss = require('gulp-purgecss');
const webpack = require('webpack-stream');
const _webpack = require('webpack');
const webpackConfig = require('../webpack.config.js');
const imagemin = require('gulp-imagemin');
const browserSync = require('./browserSyncInstance');

sass.compiler = require('node-sass');

let jsPaths = [];
let stylesheetPaths = [];
let imagePaths = [];

const imageminOptions = [
  imagemin.jpegtran({
    progressive: true,
  }),
  imagemin.optipng({
    optimizationLevel: 7,
  }),
  imagemin.svgo(),
  imagemin.gifsicle({
    interlaced: true,
    optimizationLevel: 3,
  }),
];

const js = done => {
  if (!jsPaths.length) { return done(); } // if there are no js files to be bundled, exit

  const jsBlob = jsPaths.join(',');

  return src(jsBlob)
    .pipe(flatmap((stream, file) => { // create a bundle for each js file
      webpackConfig.entry[`${path.parse(file.path).name}`] = file.path;

      return src(file.path)
        .pipe(webpack(
          webpackConfig,
          _webpack
        ));
    }))
    .pipe(rename({
      dirname: '', // remove nested folders from the file path
    }))
    .pipe(dest(DEST));
};

const stylesheets = done => {
  if (!stylesheetPaths.length) { return done(); } // if there are no stylesheets, exit

  const stylesheetGlob = stylesheetPaths.join(',');

  return src(stylesheetGlob)
    .pipe(sass({
      includePaths: [
        'node_modules', // parse installed packages as well
      ],
    }).on('error', sass.logError))
    .pipe(postcss()) // minify and auto-prefix styles
    .pipe(IF(IS_PROD, purgecss({ // remove unused styles in production
      content: [
        path.join(__dirname, `../${SRC}/**/*.{html}`),
        path.join(__dirname, `../${SRC}/**/*.{js,mjs}`), // TODO: Add extractors that only looks at strings inside js files so that variable names and comment do not get picked up
      ],
    })))
    .pipe(rename({
      dirname: '', // remove nested folders from the file path
    }))
    .pipe(dest(DEST))
    .pipe(browserSync.stream());
};

const images = done => {
  if (!imagePaths.length) { return done(); } // if there are no images, exit

  const imageGlob = imagePaths.join(',');

  return src(imageGlob)
    .pipe(IF(IS_PROD, imagemin(imageminOptions))) // compress images in production
    .pipe(rename({
      dirname: '', // remove nested folders from the file path
    }))
    .pipe(dest(DEST));
};

const html = () =>
  src(`${SRC}/${VIEWS}/**.html`)
    .pipe(htmlmin({
      removeComments: true,
    }))
    .pipe(flatmap((stream, file) => {
      let contents = file.contents.toString('utf8');

      // get js files paths
      const jsFileMatches = contents.match(/src=".*\.js"/g);
      jsPaths = jsFileMatches
        ? jsFileMatches.map(jsFileMatch => {
          // create a js bundle
          const relativeFilePath = jsFileMatch.match(/src="(.*)"/)[1];

          // update file paths
          contents = contents.replace(
            relativeFilePath,
            path.basename(relativeFilePath)
          );

          const filePath = path.join(`${SRC}/${VIEWS}/`, relativeFilePath);
          return filePath;
        })
        : [];

      // get stylesheets paths
      const stylesheetMatches = contents.match(/href=".*\.(css|sass|scss)"/g);
      stylesheetPaths = stylesheetMatches
        ? stylesheetMatches.map(stylesheetMatch => {
          const relativeFilePath = stylesheetMatch.match(/href="(.*)"/)[1];

          // update file paths
          contents = contents.replace(
            relativeFilePath,
            path
              .basename(relativeFilePath)
              .replace(/\.(scss|sass)$/, '.css')
          );

          const filePath = path.join(`${SRC}/${VIEWS}/`, relativeFilePath);
          return filePath;
        })
        : [];

      // get image paths
      const images = contents.match(/=".*\.(jpeg|jpg|png|gif|svg|webp)"/gi);
      imagePaths = images
        ? images.map(imagePath => {
          const relativeFilePath = imagePath.match(/="(.*)"/)[1];

          // update file paths
          contents = contents.replace(
            relativeFilePath,
            path.basename(relativeFilePath)
          );

          const filePath = path.join(`${SRC}/${VIEWS}/`, relativeFilePath);
          return filePath;
        })
        : [];

      // update the paths inside the html file
      file.contents = Buffer.from(contents);

      return stream;
    }))
    .pipe(dest(DEST));

const bundle = series(html, parallel(js, stylesheets, images));

module.exports = {
  html,
  stylesheets,
  images,
  js,
  bundle,
};

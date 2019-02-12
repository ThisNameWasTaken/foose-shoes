const { src, dest } = require('gulp');
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

let jsPaths = [];
let stylesheetPaths = [];
let imagePaths = [];

sass.compiler = require('node-sass');

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

const js = () =>
  jsPaths.map(jsPath => {
    // create a js bundle

    webpackConfig.entry[`${path.parse(jsPath).name}`] = `.\\${jsPath}`;

    return src(jsPath) // TODO: return a stream
      .pipe(webpack(
        webpackConfig,
        _webpack
      ))
      .pipe(rename({
        dirname: '', // remove nested folders from the file path
      }))
      .pipe(dest(`${DEST}`));
  });

const stylesheets = () =>
  stylesheetPaths.map(stylesheetPath =>
    src(stylesheetPath)
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
      .pipe(dest(`${DEST}`))
  );

const images = () =>
  imagePaths.map(imagePath =>
    src(imagePath)
      .pipe(IF(IS_PROD, imagemin(imageminOptions))) // compress images in production
      .pipe(rename({
        dirname: '', // remove nested folders from the file path
      }))
  );

const updateFilePaths = flatmap((stream, file) => {
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
});

const bundle = () =>
  src(`${SRC}/${VIEWS}/**.html`)
    .pipe(htmlmin({
      removeComments: true,
    }))
    .pipe(updateFilePaths)
    .pipe(dest(`${DEST}`));

module.exports = bundle;

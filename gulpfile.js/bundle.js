const { src, dest, series, parallel } = require('gulp');
const { IS_PROD, DIR: { SRC, DEST, VIEWS, JS, STYLES, IMAGES } } = require('./constants');
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

  const jsBlob = jsPaths.length === 1 // if there is only one file
    ? jsPaths[0] // return the path to that file
    : `${SRC}/${JS}/{${ // else create a glob that points to those files
    jsPaths.map(jsPath =>
      jsPath
        .replace(/\\/g, '/')
        .replace(`${SRC}/${JS}/`, ''))
      .join(',')
    }}`;

  return src(jsBlob)
    .pipe(flatmap((stream, file) => { // create a bundle for each js file
      webpackConfig.entry[`${path.parse(file.path).name}`] = file.path;

      return src(file.path)
        .pipe(webpack(
          webpackConfig,
          _webpack
        ));
    }))
    .on('error', function (error) {
      console.log(error.toString());
      this.emit('end');
    })
    .pipe(rename({
      dirname: '', // remove nested folders from the file path
    }))
    .pipe(dest(DEST));
};

const stylesheets = done => {
  if (!stylesheetPaths.length) { return done(); } // if there are no stylesheets, exit

  const stylesheetGlob = stylesheetPaths.length === 1 // if there is only one file
    ? stylesheetPaths[0] // return the path to that file
    : `${SRC}/${STYLES}/{${ // else create a glob that points to those files
    stylesheetPaths.map(stylesheetPath =>
      stylesheetPath
        .replace(/\\/g, '/')
        .replace(`${SRC}/${STYLES}/`, ''))
      .join(',')
    }}`;

  return src(stylesheetGlob)
    .pipe(sass({
      includePaths: [
        'node_modules', // parse installed packages as well
      ],
    }).on('error', sass.logError))
    .pipe(postcss()) // minify and auto-prefix styles
    .pipe(IF(IS_PROD, purgecss({ // remove unused styles in production
      content: [
        `${SRC}/**/*.html`,
        `${SRC}/**/*.{js,mjs}`,
        // `./${SRC}/${JS}/**/*.{js,mjs}`, // TODO: Add extractors that only looks at strings inside js files so that variable names and comment do not get picked up
      ],
      keyframes: true,
      fontFace: true,
      rejected: true,
    })))
    .pipe(flatmap((stream, file) => {
      let contents = file.contents.toString('utf8');

      // get js files paths
      const imageMatches = contents.match(/url\(["']?(.*?\.(jpeg|jpg|png|gif|svg|webp))["']?\)/gi);

      if (imageMatches) {
        imagePaths.push(
          ... new Set(
            imageMatches
              .map(imageMatch => imageMatch.match(/url\(["']?(.*?\.(jpeg|jpg|png|gif|svg|webp))["']?\)/)[1])
              .filter(imageUrl => !imageUrl.startsWith('http')) // filter out external sources
              .map(relativeFilePath => {
                // update file paths
                contents = contents.replace(
                  relativeFilePath,
                  path.basename(relativeFilePath)
                );

                relativeFilePath = `./${IMAGES}/` + relativeFilePath.split(`${IMAGES}/`)[1];
                const filePath = path.join(`./${SRC}`, relativeFilePath).replace(/\\/g, '/');
                return filePath;
              })
          )
        );
      }

      // update the paths inside the stylesheets
      file.contents = Buffer.from(contents);

      return stream;
    }))
    .pipe(rename({
      dirname: '', // remove nested folders from the file path
    }))
    .pipe(dest(DEST))
    .pipe(browserSync.stream());
};

const images = done => {
  if (!imagePaths.length) { return done(); } // if there are no images, exit

  const imageGlob = imagePaths.length === 1 // if there is only one file
    ? imagePaths[0] // return the path to that file
    : `${SRC}/${IMAGES}/{${ // else create a glob that points to those files
    imagePaths.map(imagePath =>
      imagePath
        .replace(/\\/g, '/')
        .replace(`${SRC}/${IMAGES}/`, ''))
      .join(',')
    }}`;

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
        ? jsFileMatches
          .filter(jsFileMatch => !jsFileMatch.startsWith('src="http'))
          .map(jsFileMatch => {
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
        ? stylesheetMatches
          .filter(stylesheetMatch => !stylesheetMatch.startsWith('href="http')) // filter out external sources
          .map(stylesheetMatch => {
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
      const images = contents.match(/=["']*?.*?\.(jpeg|jpg|png|gif|svg|webp)["']*?/gi);

      imagePaths = images
        ? [
          ... new Set(
            images
              .filter(imagePath => !imagePath.startsWith('="http')) // filter out external sources
              .map(imagePath => {
                const relativeFilePath = imagePath.match(/[^"']*?\.(jpeg|jpg|png|gif|svg|webp)/i)[0];

                // update file paths
                contents = contents.replace(
                  relativeFilePath,
                  path.basename(relativeFilePath)
                );

                const filePath = path.join(`${SRC}/${VIEWS}/`, relativeFilePath);
                return filePath;
              })
          )
        ]
        : [];

      // update the paths inside the html file
      file.contents = Buffer.from(contents);

      return stream;
    }))
    .pipe(dest(DEST));

const bundle = series(html, parallel(js, stylesheets), images);

module.exports = {
  html,
  stylesheets,
  images,
  js,
  bundle,
};

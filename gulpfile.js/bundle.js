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

const bundle = () =>
  src(`${SRC}/${VIEWS}/**.html`)
    .pipe(htmlmin({
      removeComments: true,
    }))
    .pipe(flatmap((stream, file) => {
      let contents = file.contents.toString('utf8');

      // parse js
      const jsFiles = contents.match(/src=".*\.js"/g);
      if (jsFiles) {
        jsFiles.forEach(jsFile => {
          // create a js bundle
          const relativeFilePath = jsFile.match(/src="(.*)"/)[1];
          const filePath = path.join(`${SRC}/${VIEWS}/`, relativeFilePath);

          webpackConfig.entry[`${path.parse(filePath).name}`] = `.\\${filePath}`;

          src(filePath)
            .pipe(webpack(
              webpackConfig,
              _webpack
            ))
            .pipe(rename({
              dirname: '', // remove nested folders from the file path
            }))
            .pipe(dest(`${DEST}`));

          // update file paths
          contents = contents.replace(
            relativeFilePath,
            path.basename(relativeFilePath)
          );
        });
      }

      // parse stylesheets
      const stylesheets = contents.match(/href=".*\.(css|sass|scss)"/g);
      if (stylesheets) {
        stylesheets.forEach(stylesheet => {
          const relativeFilePath = stylesheet.match(/href="(.*)"/)[1];
          const filePath = path.join(`${SRC}/${VIEWS}/`, relativeFilePath);

          src(filePath)
            .pipe(sass({
              includePaths: [
                'node_modules', // parse installed packages as well
              ],
            }).on('error', sass.logError))
            .pipe(postcss()) // minify and auto-prefix styles
            .pipe(IF(IS_PROD, purgecss({ // remove unused styles in production
              content: [
                file.path,
                path.join(__dirname, `../${SRC}/**/*.{js,mjs}`),
              ],
            })))
            .pipe(rename({
              dirname: '', // remove nested folders from the file path
            }))
            .pipe(dest(`${DEST}`));

          // update file paths
          contents = contents.replace(
            relativeFilePath,
            path
              .basename(relativeFilePath)
              .replace(/\.(scss|sass)$/, '.css')
          );
        });
      }

      // compress images
      const images = contents.match(/=".*\.(jpeg|jpg|png|gif|svg|webp)"/gi);
      if (images) {
        images.forEach(image => {
          const relativeFilePath = image.match(/="(.*)"/)[1];
          const filePath = path.join(`${SRC}/${VIEWS}/`, relativeFilePath);

          src(filePath)
            .pipe(IF(IS_PROD, imagemin(imageminOptions))) // compress images in production
            .pipe(rename({
              dirname: '', // remove nested folders from the file path
            }))
            .pipe(dest(`${DEST}`));

          // update file paths
          contents = contents.replace(
            relativeFilePath,
            path.basename(relativeFilePath)
          );
        });
      }

      // update the paths inside the html file
      file.contents = Buffer.from(contents);

      return stream;
    }))
    .pipe(dest(`${DEST}`));

module.exports = bundle;

const { src, dest } = require('gulp');
const { IS_DEV, DIR: { DEST } } = require('./constants');
const flatmap = require('gulp-flatmap');
const critical = require('critical').stream;

const inlineCriticalStyles = done => {
  if (IS_DEV) { return done(); } // skip during development

  src(`${DEST}/*.html`)
    .pipe(flatmap((stream, file) => {
      let contents = file.contents.toString('utf8');

      const stylesheetMatches = contents.match(/href=".*\.css"/g);

      if (!stylesheetMatches) { return stream; }

      const stylesheets = stylesheetMatches.map(href => `${DEST}\\${href.match(/href="(.*)"/)[1]}`);

      src(file.path)
        .pipe(critical({
          inline: true,
          css: stylesheets
        }).on('error', error => console.error(error)))
        .pipe(dest(`${DEST}`));

      return stream;
    }));

  return done();
}

module.exports = inlineCriticalStyles;

const gulp = require('gulp');
const minifyCss = require('gulp-minify-css');
const connect = require('gulp-connect');
const merge = require('merge-stream');
const nunjucksRender = require('gulp-nunjucks-render');
const globby = require('globby');

const APP_TEMPLATES_DIR = 'app/templates';
const APP_PAGES_DIR = 'app/pages';
const APP_CSS = 'app/static/css';
const APP_IMG = 'app/static/img';
const APP_JS = 'app/static/js';
const APP_SEO = 'app/static/seo';

const COMMON_TEMPLATES_DIR = '../common/templates';
const COMMON_CSS = '../common/static/css';
const COMMON_IMG = '../common/static/img';
const COMMON_JS = '../common/static/js';

const DIST = 'dist';
const DIST_CSS = 'dist/static/css';
const DIST_IMG = 'dist/static/img';
const DIST_JS = 'dist/static/js';

gulp.task('clean', done => {
  const paths = globby.sync(['*']);
  if (paths.indexOf('app') == -1) {
    done(new Error('Move inside a project to run gulp tasks!'))
  } else {
    del = require('del');
    const deletedPaths = del.sync(['./' + DIST + '/*']);
    console.log('Deleted files and directories:\n',
      deletedPaths.join('\n '));
    done();
  }
});
gulp.task('create-dirs', gulp.series('clean', done => {
  gulp.src('*.*', { read: false })
    .pipe(gulp.dest(DIST_CSS))
    .pipe(gulp.dest(DIST_IMG))
    .pipe(gulp.dest(DIST_JS))
    .on('end', () => {
      done();
    });
}));
gulp.task('collect', gulp.series('create-dirs', done => {
  // ...process your css, html, js here...
  // ... minify, etc...

  // robots, sitemaps, etc
  const appSeo = gulp.src(APP_SEO + '/*').pipe(gulp.dest(DIST))

  // app static
  const css = gulp.src(APP_CSS + '/*')
    .pipe(minifyCss()).pipe(gulp.dest(DIST_CSS))
  const img = gulp.src(APP_IMG + '/*').pipe(gulp.dest(DIST_IMG))
  const js = gulp.src(APP_JS + '/*').pipe(gulp.dest(DIST_JS))

  // common static
  const commonCss = gulp.src(COMMON_CSS + '/*').pipe(gulp.dest(DIST_CSS))
  const commonImg = gulp.src(COMMON_IMG + '/*').pipe(gulp.dest(DIST_IMG))
  const commonJs = gulp.src(COMMON_JS + '/*').pipe(gulp.dest(DIST_JS))

  merge[appSeo, css, img, js, commonCss, commonImg, commonJs];
  done();
}));
gulp.task('build', gulp.series('collect', done => {
  gulp
    .src(APP_PAGES_DIR + '/**/*.html')
    .pipe(nunjucksRender({
      path: [
        APP_TEMPLATES_DIR,
        COMMON_TEMPLATES_DIR
      ]
    }))
    .pipe(gulp.dest(DIST))
    .on('end', () => {
      done();
    });
}));
gulp.task('serve', gulp.series('build', done => {
  connect.server({
    root: DIST,
    port: 7777,
    livereload: true
  });
  done();
}));
gulp.task('watch', gulp.series('serve', done => {
  gulp.watch([
    APP_TEMPLATES_DIR + '/*.html',
    APP_PAGES_DIR + '/**/*.html',
    COMMON_TEMPLATES_DIR + '/*.html',
  ], gulp.series('build'));
}));
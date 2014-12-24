// path settings //////////////////////////////////////////////////////////////////////////
var PATH_DEV = 'dev/';
var PATH_PREV = 'preview/';
var PATH_PUB = 'deploy/';

var FTP_HOST = 'yokoyama-yoshimasa.preview.i-studio.co.jp';
var FTP_USER = 'yoshimasa-yokoyama';
var FTP_PASS = 'JkLQWq5U';
var FTP_ROOT = '/htdocs';

// file settings
var tmpl = [
  PATH_DEV + '**/*.ejs',
  PATH_DEV + '!assets/inc/**/*.ejs'
];
var scss = [
  PATH_DEV + 'assets/css/scss/**/*.scss'
];
//var scriptPC = ['assets/js/_closure/intro.js','assets/js/_closure/outro.js'];
//var scriptSP = ['sp/assets/js/_closure/intro.js','sp/assets/js/_closure/outro.js'];

// package require //////////////////////////////////////////////////////////////////////////
var gulp = require('gulp');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var del = require('del');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync');
var ejs = require('gulp-ejs');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var ftp = require('gulp-ftp');
var htmlhint = require('gulp-htmlhint');
var csslint = require('gulp-csslint');
var jshint = require('gulp-jshint');
var please = require('gulp-pleeease');
var sourcemaps = require('gulp-sourcemaps');

// dev //////////////////////////////////////////////////////////////////////////////////////
gulp.task('scss', function() {
  return gulp.src(scss)
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest(PATH_PREV + 'assets/css/'));
});

gulp.task('publishCSS', ['scss'], function() {
  return gulp.src('assets/**/*.css')
    .pipe(plumber())
    .pipe(please({
      'minifier': false,
      'autoprefixer': {
        'browsers': ['last 4 version', 'ie 8', 'iOS 4', 'Android 2.3']
      }
    }))
    .pipe(gulp.dest(PATH_PREV));
});

gulp.task('validateCSS', ['publishCSS'], function() {
  return gulp.src(PATH_PREV + '**/*.css')
    .pipe(csslint())
    .pipe(csslint.reporter());
});

gulp.task('browserSync', ['watch', 'scss', 'publishCSS', 'ejs', 'files'], function() {
  return browserSync.init(null, {
    server: {
      baseDir: PATH_PREV
    }
  });
});

gulp.task('ejs', function() {
  return gulp.src(tmpl)
    .pipe(plumber())
    .pipe(ejs())
    .pipe(gulp.dest(PATH_PREV));
});

gulp.task('validateHTML', ['ejs'], function() {
  return gulp.src(PATH_PREV + '**/*.html')
    .pipe(htmlhint())
    .pipe(htmlhint.reporter());
});

gulp.task('validateJS', function() {
  return gulp.src([PATH_PREV + '**/*.js','!' + PATH_PREV + 'assets/js/**/libs/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter());
});

gulp.task('files', function(){
  return gulp.src([
      PATH_DEV + '**/*.png',
      PATH_DEV + '**/*.jpg',
      PATH_DEV + '**/*.gif',
      PATH_DEV + '**/*.css',
      PATH_DEV + '**/*.js'
//    '!' + PATH_DEV + '**/class.js',
//    '!' + PATH_DEV + 'assets/inc/**/*.ejs'
//    '!' + PATH_DEV + '**/sprite/*.png',
    ])
    .pipe(plumber())
    .pipe(gulp.dest(PATH_PREV));
});

gulp.task('liveReloadCSS', ['publishCSS'], function(){
  return browserSync.reload();
});
gulp.task('liveReloadHTML', ['ejs'], function() {
  return browserSync.reload();
});
gulp.task('liveReloadJS', ['validateJS'], function() {
  return browserSync.reload();
});
gulp.task('liveReload', function() {
  return browserSync.reload();
});

gulp.task('ftp', function() {
  return gulp.src(PATH_PREV + '**/*')
    .pipe(plumber())
    .pipe(ftp({
      host: FTP_HOST,
      user: FTP_USER,
      pass: FTP_PASS,
      remotePath: FTP_ROOT
    }));
});

gulp.task('watch', function() {
  gulp.watch([PATH_DEV + '**/*.scss'], ['publishCSS', 'liveReloadCSS']);
  gulp.watch([PATH_DEV + '**/*.ejs'], ['ejs', 'validateHTML', 'liveReloadHTML']);
  gulp.watch([PATH_DEV + '**/*.js'], ['validateJS', 'liveReloadJS']);
  gulp.watch([PATH_DEV + '**/*.png', PATH_DEV + '**/*.jpg', PATH_DEV + '**/*.gif', PATH_DEV + '**/js/*.js'], ['files', 'liveReload']);
});

gulp.task('default', ['watch', 'scss', 'publishCSS', 'ejs', 'validateHTML', 'validateJS', 'files', 'browserSync']);

// pub //////////////////////////////////////////////////////////////////////////////////////
gulp.task('copy', function() {
  return gulp.src(PATH_PREV + '**')
    .pipe(gulp.dest(PATH_PUB));
});

gulp.task('imagemin', ['copy'], function() {
  return gulp.src([PATH_PUB + '**/*.png', PATH_PUB + '**/*.jpg', PATH_PUB + '**/*.gif'])
    .pipe(imagemin())
    .pipe(gulp.dest(PATH_PUB));
});

gulp.task('compressJS', ['copy'], function() {
  return gulp.src(PATH_PUB + '**/*.js')
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(gulp.dest(PATH_PUB));
});

gulp.task('compressHTML', ['copy'], function() {
  return gulp.src(PATH_PUB + '**/*.html')
    .pipe(minifyHTML())
    .pipe(gulp.dest(PATH_PUB));
});

gulp.task('compressCSS', ['copy'], function() {
  return gulp.src(PATH_PUB + '**/*.css')
    .pipe(minifyCSS())
    .pipe(gulp.dest(PATH_PUB));
});

gulp.task('rename', ['compressHTML'], function() {
  return gulp.src(PATH_PUB + '**/*.html')
    .pipe(rename(function(path) {
      path.extname = '.html'
    }))
    .pipe(gulp.dest(PATH_PUB));
});

gulp.task('clean', ['copy', 'imagemin', 'compressHTML', 'compressJS', 'compressCSS', 'rename'], function(cb) {
  return del([PATH_PUB + 'list.htm', PATH_PUB + '**/.svn', PATH_PUB + '**/.DS_Store', PATH_PUB + '**/*.html', PATH_PUB + '**/*.scss', 'html/**/*_.png', 'html/**/*_.jpg', 'html/**/*_.gif', 'html/common', 'html/**/_*', 'html/**/*.map'], cb);
});

gulp.task('build', ['copy', 'imagemin', 'compressHTML', 'compressJS', 'compressCSS', 'rename', 'clean']);

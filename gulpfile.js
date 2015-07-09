var gulp            = require('gulp'),
      plumber       = require('gulp-plumber'),
      rename        = require('gulp-rename'),
      autoprefixer  = require('gulp-autoprefixer'),
      concat        = require('gulp-concat'),
      uglify        = require('gulp-uglify'),
      imagemin      = require('gulp-imagemin'),
      cache         = require('gulp-cache'),
      minifycss     = require('gulp-minify-css'),
      sass          = require('gulp-sass'),
      browserSync   = require('browser-sync'),
      del = require('del'),
      handlebars  = require('gulp-compile-handlebars');

var dist = './build';

gulp.task('serve', function() {
  browserSync.init({
    server: dist,
    open: false,
    notify: false
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('images', function(){
  gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('build/images/'));
});

gulp.task('styles', function(){
  gulp.src(['src/scss/**/*.scss'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(sass())
    .pipe(gulp.dest('build/css/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('build/css/'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('templates', function() {
  var opts = {
    ignorePartials: true,
    batch: ['src/partials']
  };

  gulp.src(['src/*.hbs'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(handlebars(null, opts))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest('build/'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['serve'], function(){
  gulp.watch("src/scss/**/*.scss", ['styles']);
  gulp.watch('src/**/*.hbs', ['templates']);
});

gulp.task('default', ['watch', 'serve', 'images', 'styles', 'templates']);

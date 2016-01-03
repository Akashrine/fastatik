// Load plugins
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    watch = require('gulp-watch'),
    plumber = require('gulp-plumber'),
    autoprefixer  = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    size = require('gulp-size'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    minifyCSS = require('gulp-minify-css'),
    sass = require('gulp-sass'),
    csslint = require('gulp-csslint'),
    browserSync = require('browser-sync').create('minimal'),
    browserReload = browserSync.reload;
    del = require('del'),
    handlebars  = require('gulp-compile-handlebars');

// Load PostCSS plugins
var postcss = require('gulp-postcss'),
    corepostcss = require('postcss'),
    simplevars = require('postcss-simple-vars'),
    autoprefixer = require('autoprefixer-core'),
    mqpacker = require('css-mqpacker'),
    csswring = require('csswring'),
    nestedcss = require('postcss-nested');


// Task that shaves some kB's from images
// Run this in the root directory of the project with `npm minify-img `
gulp.task('minify-img', function(){
  gulp.src('src/img/*')
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
    }))
    .pipe(gulp.dest('build/img/'));
});

// Minify all css files in the css directory
// Run this in the root directory of the project with `npm minify-css `
gulp.task('minify-css', function(){
  var processors = [
      csswring
    ];
  return gulp.src('src/css/main.css')
    .pipe(postcss(processors))
    .pipe(minifyCSS())
    .pipe(rename('main.min.css'))
    .pipe(size({gzip:true, showFiles: true}))
    .pipe(gulp.dest('build/css/'));
});

// Use csslint without box-sizing or compatible vendor prefixes (these
// don't seem to be kept up to date on what to yell about)
gulp.task('csslint', function(){
  gulp.src('src/css/main.css')
    .pipe(csslint({
          'compatible-vendor-prefixes': false,
          'box-sizing': false,
          'important': false,
          'known-properties': false
        }))
    .pipe(csslint.reporter());
});

// Task that compiles scss files down to good old css
gulp.task('pre-process', function(){
    var processors = [
        autoprefixer({browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']}),
        mqpacker
    ];
    return gulp.src("src/scss/style.scss")
        .pipe(sass())
        .on('error', swallowError)
        .pipe(postcss(processors))
        .pipe(size({gzip: false, showFiles: true}))
        .pipe(size({gzip: true, showFiles: true}))
        .pipe(gulp.dest('src/scss'))
        .pipe(gulp.dest('build/css'))
        .pipe(minifyCSS())
        .pipe(rename('style.min.css'))
        .pipe(size({gzip: false, showFiles: true}))
        .pipe(size({gzip: true, showFiles: true}))
        .pipe(gulp.dest('src/scss/'))
        .pipe(gulp.dest('build/css/'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

//Compie handlebars
gulp.task('templates', function() {
  var opts = {
    ignorePartials: true,
    batch: ['src/partials']
  };

  gulp.src(['src/*.hbs'])
    .pipe(handlebars(null, opts))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest('build/'))
    .pipe(browserSync.reload({stream: true}));
});

// Task that concats js files down to one file
// It needs much improvements, we know ;-)
gulp.task('scripts', function() {
  return gulp.src(['src/js/**/*.js'])
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.stream({match: '**/*.js'}));
});

// Task that moves html files from a to b
gulp.task('html', function() {
  gulp.src('src/**/*.html')
    .pipe(gulp.dest('build/'))
});

// Initialize browser-sync which starts a static server also allows for
// browsers to reload on filesave
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
          baseDir: "build/",
          injectChanges: true
        }
    });
});



// Allows gulp to not break after a sass error.
// Spits error out to console
function swallowError(error) {
  console.log(error.toString());
  this.emit('end');
}

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

/*
   DEFAULT TASK

 • Process sass then auto-prefixes and lints outputted css
 • Starts a server on port 3000
 • Reloads browsers when you change html, javascript or sass files

*/
gulp.task('default', ['pre-process', 'scripts', 'templates','html', 'browser-sync'], function(){
  gulp.start('pre-process', 'csslint', 'minify-img');
  gulp.watch('src/css/*', ['pre-process']);
  gulp.watch('src/js/**/*.js', ['scripts', browserReload]);
  gulp.watch('src/*.html', ['html']);
  gulp.watch('build/*.html', browserReload);
});

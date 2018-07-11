var gulp = require('gulp');
var del = require("del");
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var uglify = require('gulp-uglify');

var shouldMinify = false;

gulp.task('build', ['minify-code', 'serve']);

gulp.task('serve', ['resources', 'sass', 'scripts']);

/**
 * Clean up directory.
 */
// gulp.task('clean', function (cb) {
//   return del(["www", "platforms/ios", "platforms/android"], cb);
// });

/**
 * Minify
 */
gulp.task('minify-code', function () {
    return shouldMinify = true;
});

/**
 * SASS
 */
gulp.task('sass', function (done) {
    var styles = gulp.src('./src/styles/app.scss')
        .pipe(sass())
        .on('error', sass.logError);
    if (shouldMinify) {
        styles = styles.pipe(minifyCss({
            keepSpecialComments: 0
        }));
    }
    styles.pipe(rename("app.css"))
        .pipe(gulp.dest('./placeholder-dist/css/'))
        .on('end', done);
});

/**
 * Copy files to directory.
 */
gulp.task('resources', function () {
  gulp.src(["src/images/**/*"]).pipe(gulp.dest("placeholder-dist/images/"));
  return gulp.src(["node_modules/bootstrap-sass/assets/fonts/bootstrap/**/*"]).pipe(gulp.dest("placeholder-dist/fonts/bootstrap"));
});

gulp.task('scripts', function () {
    // var scripts = gulp.src([
    //     'node_modules/jquery/placeholder-dist/jquery.min.js',
    //     'node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js',
    //     'src/scripts/**/*.js'
    // ])
    //     .pipe(concat('concat.js'))
    //     .pipe(rename('app.js'));

    // if (shouldMinify)
    //     scripts.pipe(uglify());
    // //else scripts.pipe(beautify({ indentSize: 2, lookup: false }));

    // //scripts.pipe(wrap('(function() {\n<%= contents %>\n})();')); //\n"use strict";

    // scripts.pipe(gulp.dest('placeholder-dist/js/'));
    // //scripts.pipe(livereload());

    // return scripts;
});

gulp.task('watch', function () {
    gulp.watch('./src/images/**/*', ['resources']);
    gulp.watch('./src/styles/**/*', ['sass']);
    gulp.watch('./src/scripts/**/*', ['scripts']);
});


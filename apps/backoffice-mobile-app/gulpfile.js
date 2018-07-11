var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCss = require('gulp-clean-css');
var rename = require('gulp-rename');
var del = require("del");
var htmlreplace = require('gulp-html-replace');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var paths = {
    sass: ['./scss/**/*.scss']
};

gulp.task('default', ['copy']);

gulp.task('clean', function(cb) {
    return del(['./www/**/*'], cb);
});

gulp.task('copy', ['clean'], function(cb) {
    return gulp.src(['../angular-app/dist/browser/**/*']).pipe(gulp.dest("./www"));
});

gulp.task('styles', function(done) {
    gulp.src('./src/scss/app.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('./www/'))
        .pipe(cleanCss({
            keepSpecialComments: 0
        }))
        .pipe(rename('mobileapp.bundle.css'))
        .pipe(gulp.dest('./www/'))
        .on('end', done);
});

gulp.task('scripts', function() {
    var scriptsPaths = ['./src/js/**/*'];

    var scripts = gulp.src(scriptsPaths)
        .pipe(concat('concat.js'))
        .pipe(rename('mobileapp.bundle.js'));

    // if (shouldMinify) {
    scripts.pipe(uglify()).on('error', function(err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
    });
    // }

    scripts.pipe(gulp.dest('www/'));
    return scripts;
});

gulp.task('watch', ['styles', 'scripts'], function(item) {
    gulp.watch('./src/scss/**/*', ['styles']);
    gulp.watch('./src/js/**/*', ['scripts']);

    return gulp.watch('../angular-app/dist/browser/**/*', function(obj) {
        if (obj.path.endsWith('.js') || obj.type === 'changed') {
            var src = gulp.src(obj.path, {
                'base': '../angular-app/dist/browser/'
            });

            if (obj.path.endsWith('index.html')) {
                src = src.pipe(htmlreplace({
                    css: `<link rel="stylesheet" href="mobileapp.bundle.css">`,
                    js: `<script src="cordova.js"></script>\n<script src="mobileapp.bundle.js"></script>`,
                    basehref: `<script>document.write('<base href="' + String(document.location) + '" />');</script>`
                }));
            }

            src.pipe(gulp.dest('./www'));
        }
    });
});
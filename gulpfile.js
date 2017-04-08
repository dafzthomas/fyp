/*jslint es6 */

'use strict';

const gulp = require('gulp');
const uglifyjs = require('uglify-js-harmony');
const minifier = require('gulp-uglify/minifier');
const $ = require('gulp-load-plugins')({
    rename: {
        'gulp-util': 'util',
        'gulp-connect': 'connect',
        'gulp-clip-empty-files': 'clip',
        'gulp-babel': 'babel',
        'gulp-sass': 'sass',
        'gulp-combine-mq': 'cmq',
        'gulp-cssnano': 'nano',
        'gulp-sourcemaps': 'sourcemaps',
        'gulp-autoprefixer': 'autoprefixer',
        'gulp-clean': 'clean'
    }
});

const is_production = $.util.env.production ? true : false;

const opts = {
    scss: {
        source: './src/scss/**/*.scss',
        dest: is_production ? './public/css' : './dev/css'
    },
    libjs: {
        source: './src/js/libs/**/*.js',
        dest: is_production ? './public/js/libs' : './dev/js/libs'
    },
    js: {
        source: './src/js/app/**/*.js',
        dest: is_production ? './public/js/app' : './dev/js/app'
    },
    html: {
        source: './src/*',
        dest: is_production ? './public' : './dev'
    },
    img: {
        source: './src/images/**/*',
        dest: is_production ? './public/images' : './dev/images'
    },
};

gulp.task('connect', function () {
    $.connect.server({
        root: is_production ? 'public' : 'dev',
        port: 5000
    });
});

gulp.task('sass', function () {
    return gulp.src(opts.scss.source)
        .pipe($.clip())
        .pipe($.autoprefixer({
            browsers: ['last 1 version'],
            cascade: false
        }))
        .pipe(!is_production ? $.sourcemaps.init() : $.util.noop())
        .pipe($.sass.sync().on('error', $.sass.logError))
        .pipe($.cmq({
            beautify: true
        }))
        .pipe(is_production ? $.nano() : $.util.noop())
        .pipe(!is_production ? $.sourcemaps.write('./maps') : $.util.noop())
        .pipe(gulp.dest(opts.scss.dest));
});

gulp.task('js', function () {
    let options = {
        mangleProperties: false
    };

    gulp.src(opts.libjs.source)
        .pipe($.clip())
        .pipe(gulp.dest(opts.libjs.dest));

    gulp.src(opts.js.source)
        .pipe($.clip())
        .pipe(is_production ? $.babel({
            presets: ['es2015']
        }) : $.util.noop())
        .pipe(is_production ? minifier(options, uglifyjs) : $.util.noop()).on('error', function (err) {
            console.error('Error in compress task', err.toString());
        })
        .pipe(gulp.dest(opts.js.dest));
});

gulp.task('html', function () {
    gulp.src(opts.html.source)
        .pipe($.clip())
        .pipe(gulp.dest(opts.html.dest));
});

gulp.task('images', function () {
    gulp.src(opts.img.source)
        .pipe($.clip())
        .pipe(gulp.dest(opts.img.dest));
});

gulp.task('clean', function () {
    gulp.src('public', {
            read: false
        })
        .pipe($.clean());
    gulp.src('dev', {
            read: false
        })
        .pipe($.clean());

});

gulp.task('watch', function () {
    gulp.watch(opts.scss.source, ['sass']);
    gulp.watch(opts.html.source, ['html']);
    gulp.watch(opts.js.source, ['js']);
    gulp.watch(opts.img.source, ['images']);
    $.util.log('Watching files...');
});

gulp.task('serve', ['sass', 'js', 'html', 'images', 'watch', 'connect']);
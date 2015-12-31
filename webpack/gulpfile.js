/**
 * @Author Devicalin
 */

var fs = require('fs');
var gulp = require('gulp');
var rev = require('gulp-rev');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');
var webpackConfigDev = require('./webpack.config-dev');
var path    = require("path");
var minifyCss = require('gulp-minify-css');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var del = require('del');

var DEBUG = process.env.NODE_ENV.trim() === 'development';


var TASKS = {
    copy2Production: {
        html: {
            src: './release/index.html',
            dest: '../wsp/'
        },
        css: {
            src: './release/css/*',
            dest: '../doc/css/'
        },
        js: {
            src: './release/js/h5GamePortal*.js',
            dest: '../doc/js/'
        }
    }
};

// 压缩css文件
gulp.task('min-css', function() {
    return gulp.src('./css/main.css')
        .pipe(minifyCss())
        .pipe(rev())
        //.pipe(rename('main.css'))
        .pipe(gulp.dest('./release/css/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./'));
});

gulp.task('replace-html', ['build-dev', 'build', 'min-css'], function(cb){
    var webpackAssets = fs.readFileSync(__dirname + '/webpack-assets.json', {
        encoding: 'utf8'
    });
    var cssAssets = fs.readFileSync(__dirname + '/rev-manifest.json');

    try {
        webpackAssets = JSON.parse(webpackAssets);
    } catch(ex){
        webpackAssets = null;
    }
    try {
        cssAssets = JSON.parse(cssAssets);
    } catch(ex){
        cssAssets = null;
    }

    var jsName = webpackAssets && webpackAssets['h5GamePortal'] || 'h5GamePortal-min.js';
    var cssName = cssAssets && cssAssets['main.css'] || 'main.css';

    return gulp.src("./index.html")
        .pipe(replace(/main-.*?.css/gi, cssName))
        .pipe(replace(/h5GamePortal-.*?.js/gi, jsName))
        .pipe(gulp.dest("./"))
        .pipe(gulp.dest("./release/"))
        .on("end", function () {
            console.log("replace html done");
            //cb();
        });
});

gulp.task('replace-html-dev', ['build-dev', 'min-css']);

gulp.task('clean', function(cb){
    return del([
        './release/css/main-*.css',
        '../doc/css/main-*.css',
        '../doc/js/h5GamePortal-*.js',
        './release/js/h5GamePortal-*.js'
    ], {
        force: true
    });
});

gulp.task('copy2Release', ['replace-html'], function(){
    gulp.src('./js/libs/stable-dev.js')
        .pipe(gulp.dest('./release/js/'));

    return gulp.src('./index.html')
        .pipe(gulp.dest('./release/'));
});

gulp.task('copy2Release-dev', ['build-dev', 'min-css'], function(){
    gulp.src('./js/libs/stable-dev.js')
        .pipe(gulp.dest('./release/js/'));

    return gulp.src('./index.html')
        .pipe(gulp.dest('./release/'));
});

gulp.task('dev', ['copy2Release-dev']);

gulp.task('copy2Production', ['copy2Release'], function(){
    // 拷贝到目录里
    gulp.src(TASKS.copy2Production.css.src)
        .pipe(gulp.dest(TASKS.copy2Production.css.dest));

    gulp.src(TASKS.copy2Production.js.src)
        .pipe(gulp.dest(TASKS.copy2Production.js.dest));

    return gulp.src(TASKS.copy2Production.html.src)
        .pipe(gulp.dest(TASKS.copy2Production.html.dest));
});

gulp.task('default', ['copy2Production']);


gulp.task('build', !DEBUG && ['clean'], function(cb){
    webpack(webpackConfig, function(err, stats){
        if (err) throw new Error(err);

        if(stats.compilation.errors.length) {
            console.log(stats.compilation.errors[0].error);
        }

        console.log('webpack end');
        cb();
    });
});

gulp.task('build-dev', function(cb){
    webpack(webpackConfigDev, function(err, stats){
        if (err) throw new Error(err);

        if(stats.compilation.errors.length) {
            console.log(stats.compilation.errors[0].error);
        }

        console.log('webpack dev end');
        cb();
    });
});

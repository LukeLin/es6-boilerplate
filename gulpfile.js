var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
//var babel = require('gulp-babel');
//var babelify = require('babelify');
var browserify = require('browserify');
var del = require('del');
var livereload = require('gulp-livereload');
var source = require('vinyl-source-stream');

var gutil = require('gulp-util');
var through = require('through2');
var applySourceMap = require('vinyl-sourcemaps-apply');
var objectAssign = require('object-assign');
var replaceExt = require('replace-ext');
var babelCore = require('babel-core');
var path    = require("path");

// gulp-babel
var babel = function (opts) {
    opts = opts || {};

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-babel', 'Streaming not supported'));
            return;
        }

        try {
            var fileOpts = objectAssign({}, opts, {
                filename: file.path,
                filenameRelative: file.relative,
                sourceMap: !!file.sourceMap
            });

            var res = babelCore.transform(file.contents.toString(), fileOpts);

            if (file.sourceMap && res.map) {
                applySourceMap(file, res.map);
            }

            file.contents = new Buffer(res.code);
            file.path = replaceExt(file.path, '.js');
            this.push(file);
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-babel', err, {fileName: file.path, showProperties: false}));
        }

        cb();
    });
};

// babelify
var babelify = function (opts) {
    opts = objectAssign({}, opts);
    var extensions = opts.extensions ? babelCore.util.arrayify(opts.extensions) : null;
    var sourceMapRelative = opts.sourceMapRelative;
    if (opts.sourceMap !== false) opts.sourceMap = "inline";

    // babelify specific options
    delete opts.sourceMapRelative;
    delete opts.extensions;
    delete opts.filename;

    // browserify specific options
    delete opts._flags;
    delete opts.basedir;
    delete opts.global;

    return function (filename) {
        if (!babelCore.canCompile(filename, extensions)) {
            return through();
        }

        if (sourceMapRelative) {
            filename = path.relative(sourceMapRelative, filename);
        }

        var data = "";

        var write = function (buf, enc, callback) {
            data += buf;
            callback();
        };

        var end = function (callback) {
            opts.filename = filename;
            try {
                this.push(babelCore.transform(data, opts).code);
            } catch(err) {
                this.emit("error", err);
            }
            callback();
        };

        return through(write, end);
    };
};

var libs = [
    'react',
    'lodash'
];


gulp.task('libs', function () {
    var stream = browserify({
        debug: false,
        require: libs
    });

    stream.bundle()
        .pipe(source('libs.js'))
        .pipe(gulp.dest('./dist/public'));

    return stream;
});

gulp.task('client-scripts', function () {
    var stream = browserify({
        entries: ['./public/jsx/test.jsx'],
        transform: [babelify({
            optional: ["runtime"]
        })],
        debug: false,
        extensions: ['.jsx'],
        fullPaths: false
    });

    libs.forEach(function(lib) {
        stream.external(lib);
    });

    return stream.bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('./dist/public'));
});

gulp.task('server-scripts', function () {
    return gulp.src('./server/*.es6')
        .pipe(sourcemaps.init())
        .pipe(babel({
            optional: ["runtime"]  // if running test, disable this option
        }))
        .pipe(gulp.dest('./dist/server/'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/server/'));
});

gulp.task('clean', function(cb){
    del(['./dist/**/*/*.js'], cb);
});

gulp.task('watch', function(){
    gulp.watch(['./public/*.es6', './public/jsx/*.jsx'], ['client-scripts']);
    gulp.watch(['./server/*.es6'], ['server-scripts']);
    livereload.listen();
    gulp.watch(['./public/*.es6',  './public/jsx/*.jsx', './server/*.es6']).on('change', livereload.changed);
});

gulp.task('default', ['clean', 'libs', 'client-scripts', 'server-scripts', 'watch']);
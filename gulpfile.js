// Gulp Tasks
'use strict';

var gulp = require('gulp'),
    merge = require('merge-stream'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    connect = require('gulp-connect'),
    htmlmin = require('gulp-html-minifier'),
    fs = require('fs'),
    connectModRewrite = require('connect-modrewrite'),
    ngConfig = require('gulp-ng-config'),
    prettyError = require('gulp-prettyerror'),
    path = require('path'),
    // path = require('gulp-path'),
    // conf = require('./conf')(gulp),
    _ = require('lodash');


var scripts = require('./frontend/app.scripts.json');
var styles = require('./frontend/app.styles.json');


//include all bower scripts files
gulp.task('vendorjs', function() {

    _.forIn(scripts.chunks, function(chunkScripts, chunkName) {
        var paths = [];
        chunkScripts.forEach(function(script) {
            var scriptFileName = scripts.paths[script];

            if (!fs.existsSync(__dirname + '/' + scriptFileName)) {

                throw console.error('Required path doesn\'t exist: ' + __dirname + '/' + scriptFileName, script)
            }
            paths.push(scriptFileName);
        });
        gulp.src(paths)
            .pipe(concat(chunkName + '.js'))
            //.on('error', swallowError)
            .pipe(gulp.dest("frontend/dist/vendors"))
            .pipe(gulp.watch(paths).on('change', function(event) {
                if (event.type == 'deleted') {
                    var filePathFromSrc = path.relative(path.resolve(paths), event.path);
                    var destFilePath = path.resolve('frontend/dist/vendors', filePathFromSrc);
                    del.sync(destFilePath);
                }
            }))
    })

});


//include all bower  styles files
gulp.task('vendorcss', function() {

    _.forIn(styles.chunks, function(chunkStyles, chunkName) {
        var paths = [];
        chunkStyles.forEach(function(style) {
            var styleFileName = styles.paths[style];

            if (!fs.existsSync(__dirname + '/' + styleFileName)) {

                throw console.error('Required path doesn\'t exist: ' + __dirname + '/' + styleFileName, style)
            }
            paths.push(styleFileName);
        });
        gulp.src(paths)
            .pipe(concat(chunkName + '.css'))
            //.on('error', swallowError)
            .pipe(gulp.dest("frontend/dist/vendors"))
            .pipe(gulp.watch(paths).on('change', function(event) {
                if (event.type == 'deleted') {
                    var filePathFromSrc = path.relative(path.resolve(paths), event.path);
                    var destFilePath = path.resolve('frontend/dist/vendors', filePathFromSrc);
                    del.sync(destFilePath);
                }
            }))
    })

});

// config for dev server
gulp.task('configDev', function() {
    gulp.src('frontend/src/js/config.json', { base: 'frontend/src/js/' })
        .pipe(ngConfig('evalai-config', {
            environment: 'local'
        }))
        .pipe(gulp.dest('frontend/dist/js'))
});

// config for prod server
gulp.task('configProd', function() {
    gulp.src('frontend/src/js/config.json')
        .pipe(ngConfig('evalai-config', {
            environment: 'production'
        }))
        .pipe(gulp.dest('frontend/dist/js'))
});

// minify and compress CSS files
gulp.task('css', function() {
    return sass('frontend/src/css/main.scss', { style: 'expanded' })
        .pipe(prettyError())
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest('frontend/dist/css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cssnano())
        .pipe(gulp.dest('frontend/dist/css'));
})

// minify angular scripts
gulp.task('js', function() {

    var app = gulp.src('frontend/src/js/app.js')
        .pipe(prettyError())
        .pipe(jshint.reporter('default'))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('frontend/dist/js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('frontend/dist/js'));

    var configs = gulp.src('frontend/src/js/route-config/*.js')
        .pipe(prettyError())
        .pipe(jshint.reporter('default'))
        .pipe(concat('route-config.js'))
        .pipe(gulp.dest('frontend/dist/js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('frontend/dist/js'));

    var controllers = gulp.src('frontend/src/js/controllers/*.js')
        .pipe(prettyError())
        .pipe(jshint.reporter('default'))
        .pipe(concat('controllers.js'))
        .pipe(gulp.dest('frontend/dist/js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('frontend/dist/js'));

    var directives = gulp.src('frontend/src/js/directives/*.js')
        .pipe(prettyError())
        .pipe(jshint.reporter('default'))
        .pipe(concat('directives.js'))
        .pipe(gulp.dest('frontend/dist/js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('frontend/dist/js'));

    var filters = gulp.src('frontend/src/js/filters/*.js')
        .pipe(prettyError())
        .pipe(jshint.reporter('default'))
        .pipe(concat('filters.js'))
        .pipe(gulp.dest('frontend/dist/js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('frontend/dist/js'));

    var services = gulp.src('frontend/src/js/services/*.js')
        .pipe(prettyError())
        .pipe(jshint.reporter('default'))
        .pipe(concat('services.js'))
        .pipe(gulp.dest('frontend/dist/js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('frontend/dist/js'));

    return merge(app, configs, controllers, directives, filters, services)
});


// minify and compress html files
gulp.task('html', function() {

    var webViews = gulp.src('frontend/src/views/web/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('frontend/dist/views/web'));

    var webPartials = gulp.src('frontend/src/views/web/partials/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('frontend/dist/views/web/partials'));

    var challengePartials = gulp.src('frontend/src/views/web/challenge/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('frontend/dist/views/web/challenge'));

    var webErrors = gulp.src('frontend/src/views/web/error-pages/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('frontend/dist/views/web/error-pages'));

    return merge(webViews, webPartials, challengePartials, webErrors);
});


// for image compression
gulp.task('images', function() {
    return gulp.src('frontend/src/images/**/*')
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest('frontend/dist/images'));
});


// Fonts
gulp.task('fonts', function() {
    var font = gulp.src([
            'bower_components/font-awesome/fonts/fontawesome-webfont.*', 'bower_components/materialize/fonts/**/*'
        ])
        .pipe(gulp.dest('frontend/dist/fonts/'));

    var fontCss = gulp.src([
            'bower_components/font-awesome/css/font-awesome.css'
        ])
        .pipe(gulp.dest('frontend/dist/css/'));

    return merge(font, fontCss);
});


// cleaning build process- run clean before deploy and rebuild files again
gulp.task('clean', function() {
    return del(['frontend/dist/css', 'frontend/dist/js', 'frontend/dist/images', '../frontend/dist/vendors', 'frontend/dist/views'], { force: true });
});


// watch function
gulp.task('watch', function() {

    // Watch .scss files
    gulp.watch('frontend/src/css/**/*.scss', ['css']).on('change', function(event) {
        if (event.type == 'deleted') {
            var filePathFromSrc = path.relative(path.resolve('frontend/src/css/'), event.path);
            var destFilePath = path.resolve('frontend/dist/css', filePathFromSrc);
            del.sync(destFilePath);
        }
    });

    // Watch .js files
    gulp.watch('frontend/src/js/**/*.js', ['js']).on('change', function(event) {
        if (event.type == 'deleted') {
            var filePathFromSrc = path.relative(path.resolve('frontend/src/js/'), event.path);
            var destFilePath = path.resolve('frontend/dist/js', filePathFromSrc);
            del.sync(destFilePath);
        }
    });

    // Watch html files
    gulp.watch('frontend/src/views/**/*.html', ['html']).on('change', function(event) {
        if (event.type == 'deleted') {
            var filePathFromSrc = path.relative(path.resolve('frontend/src/views/'), event.path);
            var destFilePath = path.resolve('frontend/dist/views/web', filePathFromSrc);
            del.sync(destFilePath);
        }
    });

    // Watch image files
    gulp.watch('frontend/src/images/**/*', ['images']).on('change', function(event) {
        if (event.type == 'deleted') {
            var filePathFromSrc = path.relative(path.resolve('frontend/src/images/'), event.path);
            var destFilePath = path.resolve('frontend/dist/images', filePathFromSrc);
            del.sync(destFilePath);
        }
    });

    // Watch config dev
    gulp.watch('frontend/src/js/config.json', ['configDev']).on('change', function(event) {
        if (event.type == 'deleted') {
            var filePathFromSrc = path.relative(path.resolve('frontend/src/js/'), event.path);
            var destFilePath = path.resolve('frontend/dist/js', filePathFromSrc);
            del.sync(destFilePath);
        }
    });

    gulp.watch('bower_components/font-awesome/fonts/fontawesome-webfont.*', ['fonts']).on('change', function(event) {
        if (event.type == 'deleted') {
            var filePathFromSrc = path.relative(path.resolve('bower_components/font-awesome/fonts/'), event.path);
            var destFilePath = path.resolve('frontend/dist/fonts/', filePathFromSrc);
            del.sync(destFilePath);
        }
    });

    gulp.watch('bower_components/materialize/fonts/**/*', ['fonts']).on('change', function(event) {
        if (event.type == 'deleted') {
            var filePathFromSrc = path.relative(path.resolve('bower_components/materialize/fonts/'), event.path);
            var destFilePath = path.resolve('frontend/dist/fonts/', filePathFromSrc);
            del.sync(destFilePath);
        }
    });


    gulp.watch('bower_components/font-awesome/css/font-awesome.css', ['fonts']).on('change', function(event) {
        if (event.type == 'deleted') {
            var filePathFromSrc = path.relative(path.resolve('bower_components/font-awesome/css/'), event.path);
            var destFilePath = path.resolve('frontend/dist/css/', filePathFromSrc);
            del.sync(destFilePath);
        }
    });

    // Create LiveReload server
    livereload.listen();

    // Watch any files in dist/, reload on change
    gulp.watch(['frontend/dist/**']).on('change', livereload.changed);

});


// Start a server for serving frontend
gulp.task('connect', function() {
    connect.server({
        root: 'frontend/',
        port: 8888,
        middleware: function(connect) {
            return [
                connectModRewrite([
                    '!\\.html|\\.js|\\.css|\\.ico|\\.png|\\.gif|\\.jpg|\\.woff|.\\.ttf|.\\otf|\\.jpeg|\\.swf.*$ /index.html [NC,L]'
                ])
            ];
        }
    });
})

// development task
gulp.task('dev', ['clean'], function() {
    gulp.start('css', 'js', 'html', 'images', 'vendorjs', 'vendorcss', 'fonts', 'configDev');
});

// production task
gulp.task('prod', ['clean'], function() {
    gulp.start('css', 'js', 'html', 'images', 'vendorjs', 'vendorcss', 'fonts', 'configProd');
});

// Runserver for development
gulp.task('dev:runserver', ['dev'], function() {
    gulp.start('connect', 'watch');
});

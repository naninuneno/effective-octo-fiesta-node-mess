var gulp = require('gulp'),
    del = require('del'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify-es').default,
    notify = require('gulp-notify'),
    nodemon = require('gulp-nodemon'),
    argv = require('yargs').argv;

var productionMode = (argv.production !== undefined);

gulp.task('default', function () {
    // place code for your default task here
});

gulp.task('clean', function () {
    return del(['public/javascripts/build/**'], {force: true});
});

gulp.task('scripts', function () {
    return gulp.src('public/javascripts/dev/**/*.js')
        // Minify the file
        .pipe(gulpif(productionMode, uglify()))
        // Output
        .pipe(gulp.dest('public/javascripts/build'))
        .pipe(notify({message: 'Scripts task complete'}));
});

gulp.task('host', ['scripts'], function (cb) {
    var stream = nodemon({ script: './bin/www',
        ext: 'js hbs html',
        ignore: ["public/javascripts/build/**/*.js"],
        tasks: ['scripts'] });

    stream
        .on('restart', function () {
            console.log('restarted!')
        })
        .on('crash', function() {
            console.error('Application has crashed!')
        })
});
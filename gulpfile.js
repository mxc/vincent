var gulp = require('gulp');
var concat = require('gulp-concat');
var plugins = require('gulp-load-plugins')({scope: ['devDependencies']});
var del = require('del');
var babel = require('gulp-babel');
var rename = require('gulp-rename');

gulp.task('default', ['js'], function () {
   return gulp.src('build/*.js')
           .pipe(concat('makeaplay.js'))
           .pipe(gulp.dest('dist'));    
});

gulp.task('js', function () {
    return gulp.src('src/*.js')
            .pipe(babel({
                "presets": ['es2015', 'stage-1']
            }))
            .pipe(gulp.dest('build'));
});

gulp.task('clean', function () {
    return del(['build']);
});

gulp.task('watch', function () {
    gulp.watch('src/**/*', ['default']);
});

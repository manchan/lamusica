var gulp = require('gulp');
var less = require('gulp-less');
var csso = require('gulp-csso');
var rename = require('gulp-rename');

gulp.task('default', function() {
  return gulp.src('./css/app.less')
  .pipe(less({
    paths: ['./']
  }))
  .pipe(gulp.dest('./'))
  .pipe(csso())
  .pipe(rename('style.min.css'))
  .pipe(gulp.dest('./css/'));
});

gulp.task('watch', function() {
  return gulp.watch('./*.less', ['default']);
});

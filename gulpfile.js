const del = require('del')
const gulp = require('gulp')
const jsonMinify = require('gulp-jsonminify')

gulp.task('json', () => gulp.src('./src/**/*.json').pipe(jsonMinify()).pipe(gulp.dest('./lib')))

gulp.task('clean', async () => await del('./lib/*/'))

gulp.task('default', gulp.series('clean', 'json'))

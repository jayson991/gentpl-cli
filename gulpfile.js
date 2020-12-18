const del = require('del')
const gulp = require('gulp')
const terser = require('gulp-terser')
const jsonMinify = require('gulp-jsonminify')

gulp.task('json', () =>
  gulp.src('./src/**/*.json')
    .pipe(jsonMinify())
    .pipe(gulp.dest('./lib'))
)

gulp.task('script', async () => gulp.src('./src/index.js').pipe(terser()).pipe(gulp.dest('./lib')))

gulp.task('watch', () => {
  gulp.watch('./src/**/*.js', gulp.series('script'))
  gulp.watch('./src/**/*.json', gulp.series('json'))
})

gulp.task('clean', async () => await del('./lib/*/'))

gulp.task('default', gulp.series('clean', 'json', 'script'))

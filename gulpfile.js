const del = require('del')
const gulp = require('gulp')
const terser = require('gulp-terser')

gulp.task('script', async () => gulp.src('./src/index.js').pipe(terser()).pipe(gulp.dest('./lib')))

gulp.task('watch', () => {
  gulp.watch('./src/**/*.js', gulp.series('script'))
})

gulp.task('clean', async () => await del('./lib/*/'))

gulp.task('default', gulp.series('clean', 'script'))

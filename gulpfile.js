var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var merge = require('merge-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');

gulp.task('build', function(){
	var files = ['map-styles', 'atlas', 'view', 'viz', 'create'];
	return merge(files.map(function(file){
		return browserify({entries: './src/js/' + file + '.js', debug: true})
			.transform('babelify', {presets: ['es2015']})
			.bundle()
			.pipe(source(file + '.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init())
			.pipe(uglify())
			.pipe(sourcemaps.write('./maps'))
			.pipe(gulp.dest('./dist/js'))
			.pipe(livereload());
	}));
});

gulp.task('watch', ['build'], function(){
	livereload.listen();
	gulp.watch('./src/js/*.js', ['build']);
});

gulp.task('default', ['build', 'watch']);
var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var merge = require('merge-stream');

gulp.task('build', function(){
	var files = ['map-styles', 'atlas', 'view', 'viz', 'create'];
	return merge(files.map(function(file){
		return browserify({entries: './src/js/' + file + '.js', debug: true})
			.transform('babelify', {presets: ['es2015']})
			.bundle()
			.pipe(source(file + '.js'))
			.pipe(gulp.dest('./dist/js'));
	}));
});

gulp.task('watch', ['build'], function(){
	gulp.watch('./src/js/*.js', ['build']);
});

gulp.task('default', ['build', 'watch']);
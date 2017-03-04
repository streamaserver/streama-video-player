var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	cache = require('gulp-cache'),
	cssnano = require('gulp-cssnano'),
	del = require('del'),
	livereload = require('gulp-livereload'),
	templateCache = require('gulp-angular-templatecache');


gulp.task('default', ['clean'], function() {
	gulp.start('templateCache', 'scripts', 'styles');
});


gulp.task('scripts', function() {
	return gulp.src(['src/scripts/**/*.js', 'src/scripts/streama-video-player.tpls.js' ])
		.pipe(concat('streama-video-player.js'))
		.pipe(gulp.dest('dist'))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('dist'))
		.pipe(notify({ message: 'Scripts task complete' }));
});


gulp.task('styles', function() {
	return gulp.src('src/css/streama-video-player.css')
		.pipe(gulp.dest('dist'))
		.pipe(rename({suffix: '.min'}))
		.pipe(cssnano())
		.pipe(gulp.dest('dist'))
		.pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('templateCache', function() {
	return gulp.src('src/templates/**/*.html')
		.pipe(templateCache('streama-video-player.tpls.js', {module: 'streama.videoPlayer'}))
		.pipe(gulp.dest('src/scripts'))
	.pipe(notify({ message: 'Template Cache is finished' }));
});


gulp.task('clean', function() {
	return del(['dist/styles', 'dist/scripts', 'dist/images']);
});

// Watch
gulp.task('watch', function() {

	// Watch .scss files
	gulp.watch('src/css/**/*.css', ['styles']);

	gulp.watch('src/templates/**/*.html', ['templateCache']);

	// Watch .js files
	gulp.watch('src/scripts/**/*.js', ['scripts']);

	// Create LiveReload server
	livereload.listen();

	// Watch any files in dist/, reload on change
	gulp.watch(['dist/**']).on('change', livereload.changed);

});
//plugin
var gulp = require('gulp'),
	sass = require('gulp-sass');

//path
var path = {
	_sass: './_src/_sass',
	_type: './_src/_type',
	root: './../htdocs'
};

/*
 * defult task
 */
gulp.task('default', function(){

});


/*
 * sass task
 */
gulp.task('sass', function(){
	gulp.src('./_src/_sass/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('./../htdocs/assets/css'));
});
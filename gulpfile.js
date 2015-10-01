'use strict';

var gulp = require('gulp'),
    tsc = require('gulp-typescript'),
    uglify = require('gulp-uglify');

var project = tsc.createProject("tsconfig.json");

gulp.task("build", function () {
	var result = project.src() //"src/**/*.ts"
		.pipe(tsc(project));

	return result.js
		.pipe(uglify())
		.on('error', function(error) {
	  		console.error(error.message);
		})
		.pipe(gulp.dest("bin"));
});

gulp.task("watch", function() {
	gulp.watch("**/*.ts", ["build"]);
});

gulp.task("default", ["build"], function () {

});

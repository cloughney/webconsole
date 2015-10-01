'use strict';

var gulp = require('gulp'),
    tsc = require('gulp-typescript'),
    uglify = require('gulp-uglify');

var project = tsc.createProject("tsconfig.json");

gulp.task("build", function () {
	var result = project.src()
		.pipe(tsc(project));

	return result.js
		.pipe(uglify())
		.on('error', function(error) {
	  		console.error(error.message);
		})
		.pipe(gulp.dest(""));
});

gulp.task("watch", function() {
	gulp.watch(project.config.files, ["build"]);
});

gulp.task("default", ["build"], function () {

});

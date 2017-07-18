var gulp = require('gulp');
var minify = require('gulp-minify');
var replace = require('gulp-replace');
var htmlmin = require('gulp-htmlmin');
var express = require('express');

var server = express();
server.use(express.static('./www'));
server.get("/profile/:user_id", function(req, res) {
  res.sendFile(__dirname + '/www/index.html')
})

gulp.task('default', ['envSetup', 'copyResources', 'compressJS', 'htmlminify']);
gulp.task('serve', ['envSetup', 'copyResources', 'copyJS', 'startServer']);

if(!process.env.API_ADDRESS) process.env.API_ADDRESS = "http://localhost:3000/profiles/v1";
if(!process.env.STRIPE_KEY) process.env.STRIPE_KEY = "pk_test_6pRNASCoBOKtIshFeQd4XMUh";

gulp.task('copyResources', function(){
  gulp.src(['src/default.png'])
    .pipe(gulp.dest('www/'));
});

gulp.task('copyJS', function(){
  gulp.src(['src/index.js'])
    .pipe(gulp.dest('www/'));
});

gulp.task('envSetup', function(){
  gulp.src(['src/index.html', 'src/complete.html'])
    .pipe(replace("{{{API_ADDRESS}}}", process.env.API_ADDRESS))
    .pipe(replace("{{{STRIPE_KEY}}}", process.env.STRIPE_KEY))
    .pipe(gulp.dest('www/'));
});

gulp.task('compressJS', function() {
  gulp.src('src/*.js')
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'.js'
        }
    }))
    .pipe(gulp.dest('www'))
});

gulp.task('startServer', function() {
  //Set up your static fileserver, which serves files in the build dir
  server.listen(8000);
});

gulp.task('htmlminify', function() {
  return gulp.src('src/*.html')
    .pipe(htmlmin({collapseWhitespace: true, minifyCSS: true}))
    .pipe(gulp.dest('www'));
});

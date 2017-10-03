var gulp = require('gulp');
var minify = require('gulp-minify');
var replace = require('gulp-replace');
var htmlmin = require('gulp-htmlmin');
var express = require('express');

var server = express();
server.use(express.static('./www'));
server.get("/company/:company_id", function(req, res) {
  res.sendFile(__dirname + '/www/index.html')
})
server.get("/:user_id", function(req, res) {
  res.sendFile(__dirname + '/www/index.html')
})
server.get("/profile/:user_id", function(req, res) {
  res.sendFile(__dirname + '/www/index.html')
})

gulp.task('default', ['envSetup', 'copyLib', 'copyResources', 'compressJS'/*, 'htmlminify'*/]);
gulp.task('serve', ['envSetup', 'copyLib', 'copyResources', 'copyJS', 'startServer', 'watch']);

if(!process.env.PITCHES_API_ADDRESS) process.env.PITCHES_API_ADDRESS = "http://localhost:3000/api/v2/guest";
if(!process.env.WEBSOCKET_ADDRESS) process.env.WEBSOCKET_ADDRESS = "ws://localhost:28080";
if(!process.env.API_ADDRESS) process.env.API_ADDRESS = "http://localhost:3000/profiles/v1";
if(!process.env.STRIPE_KEY) process.env.STRIPE_KEY = "pk_test_zqRxEBrhmk4o4O0r2qVXmJCI";
if(!process.env.EMAIL_DOMAIN) process.env.EMAIL_DOMAIN = "staging-message.vipcrowd.com";
if(!process.env.HOME_DOMAIN) process.env.HOME_DOMAIN = "https://hello.vipcrowd.com";

gulp.task('copyLib', function(){
  gulp.src(['src/lib/*', './node_modules/vanilla-text-mask/src/vanillaTextMask.js'])
    .pipe(gulp.dest('www/'));
});
gulp.task('copyResources', function(){
  gulp.src(['src/*.png'])
    .pipe(gulp.dest('www/'));
});

gulp.task('copyJS', function(){
  gulp.src(['src/index.js'])
    .pipe(gulp.dest('www/'));
});

gulp.task('envSetup', function(){
  gulp.src('src/*.html')
    .pipe(replace("{{{WEBSOCKET_ADDRESS}}}", process.env.WEBSOCKET_ADDRESS))
    .pipe(replace("{{{PITCHES_API_ADDRESS}}}", process.env.PITCHES_API_ADDRESS))
    .pipe(replace("{{{API_ADDRESS}}}", process.env.API_ADDRESS))
    .pipe(replace("{{{EMAIL_DOMAIN}}}", process.env.EMAIL_DOMAIN))
    .pipe(replace("{{{STRIPE_KEY}}}", process.env.STRIPE_KEY))
    .pipe(replace("{{{HOME_DOMAIN}}}", process.env.HOME_DOMAIN))
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

gulp.task('watch', function() {

  //Add watching on js-files
  gulp.watch('src/*.js', function() {
    gulp.run('copyJS');
  });

  //Add watching on html-files
  gulp.watch('src/*.html', function () {
    gulp.run('envSetup');
  });
});

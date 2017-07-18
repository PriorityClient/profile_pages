var express = require('express')
var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var webpackHotMiddleware = require('webpack-hot-middleware')
var config = require('./webpack.config')
var app = new (express)()
var port = 3001

var compiler = webpack(config)
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }))
app.use(webpackHotMiddleware(compiler))

app.get("/", function(req, res) {
  res.sendFile(__dirname + '/www/index.html')
})

app.get("/profile/:user_id", function(req, res) {
  res.sendFile(__dirname + '/www/index.html')
})

app.get("/complete.html", function(req, res) {
  res.sendFile(__dirname + '/www/complete.html')
})

app.get("/index.js", function(req, res) {
  res.sendFile(__dirname + '/www/index.js')
})

app.get("/default.png", function(req, res) {
  res.sendFile(__dirname + '/www/default.png')
})

app.listen(port, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
  }
})

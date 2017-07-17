var express = require('express')
var app = new (express)()
var port = 3001

app.get("/", function(req, res) {
  res.sendFile(__dirname + '/src/index.html')
})
app.get("/profile/:user_id", function(req, res) {
  res.sendFile(__dirname + '/src/index.html')
})
app.get("/complete.html", function(req, res) {
  res.sendFile(__dirname + '/src/complete.html')
})
app.get("/assets/js/index.js", function(req, res) {
  res.sendFile(__dirname + '/src/assets/js/index.js')
})
app.get("/assets/img/default.png", function(req, res) {
  res.sendFile(__dirname + '/src/assets/img/default.png')
})

app.listen(port, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
  }
})

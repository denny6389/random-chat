/* Server source*/
var http = require('http');
var fs = require('fs');
var socket_io = require('socket.io').listen(http);

var server = http.createServer(function handler(req, res) {

  var url = req.url;
  if (req.url == '/') {
    url = '/chat.html';
  }
  if (req.url == '/favicon.ico') {
    return res.writeHead(404);
  }
  res.writeHead(200);
  res.end(fs.readFileSync(__dirname + url));
});

var io = socket_io.listen(server);

io.sockets.on('connection', function(socket) {

  //User got connected to the random chat
  console.log('User entered the random chat lobby');
  socket.emit('connected');

  //User wants to send a message
  socket.on('send message', function(data) {
    console.log(socket.id + ': ' + data);
    io.emit('receive message', data);
  });
 });

 server.listen(5000);

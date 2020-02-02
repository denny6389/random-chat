/* Server source*/
var app = require('http');
var fs = require('fs');
var socket_io = require('socket.io');

var server = app.createServer(function handler(req, res) {
  fs.readfile(__dirname + '/chat.html');
});3

var io = socket_io.listen(server);

/*
app.get('/main.css', (req,res) => {
  res.sendFile(__dirname + '/main.css');
});

var socket_room = {};
*/

io.sockets.on('connection', function(socket) {

  //User got connected to the random chat
  console.log('User entered the random chat lobby');
  socket.emit('connected');

  //User wants to send a message
  socket.on('send_message', function(data) {
    console.log('Senging message...');
    io.emit('receive_message', data);
  });
 });

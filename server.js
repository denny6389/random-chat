/* Server source*/
/*
var io = require('socket.io').listen(50000);

io.sockets.on('connection', function (socket){
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
*/

var app = require('express')();
var http = require('http').createServer(app);

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

var io = require('socket.io').listen(50000);
io.sockets.on('connection', function(socket) {
  socket.emit('connection', {
    type : 'connected'
  });
  socket.on('connection', function(data) {
    if(data.type == 'join') {
      socket.join(data.room);
      socket.set('room', data.room);
      socket.emit('system', {
        message : '채팅방에 오신 것을 환영합니다.'
      });

      socket.broadcast.to(data.room).emit('system', {
        message : data.name + '님이 접속하셨습니다.' }
      );
    }
  });
  socket.on('user', function(data) {
    socket.get('room', function(error, room) {
       socket.broadcast.to(room).emit('message', data);
     });
   });
 });

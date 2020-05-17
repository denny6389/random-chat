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

const totalRoomList = {};
const totalUserList = {};
const waitingQueue = [];

var nick_name = ["Vanila", "Chocolate", "Strawberry", "Matcha", "Cappuccino"];

io.on('connection', function(socket) {
  socket.emit('connected');
  
  socket.on('requestRandomChat', (name) => {
    totalUserList[socket.id] = name;
    if (waitingQueue.length > 0) {
      if (waitingQueue[0].id !== socket.id) {
        const partner = waitingQueue.shift();
        const room_key = socket.id + partner.id;
        socket.join(room_key);
        partner.join(room_key);

        totalRoomList[socket.id] = room_key;
        totalRoomList[partner.id] = room_key;

        io.to(socket.id).emit('completeMatch', {
          matched: true,
          room_key,
          partner: {
            id: partner.id,
            name: totalUserList[partner.id]
          }
        });
        io.to(partner.id).emit('completeMatch', {
          matched: true,
          room_key,
          partner: {
            id: socket.id,
            name: totalUserList[socket.id]
          }
        });
      }
    }
    else {
      waitingQueue.push(socket);
      io.to(socket.id).emit('completeMatch', {
        matched: false
      });
    }
  });

  //User wants to send a message
  socket.on('send message', (name,text) => {
    const room_key = totalRoomList[socket.id];
    console.log(name);

    //massage = name + ': ' + text;
    io.sockets.in(room_key).emit('receive message', name,text);
  });
 });

 server.listen(5000);

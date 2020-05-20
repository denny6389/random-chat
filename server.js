/* Server source*/
const http = require('http');
const fs = require('fs');
const socket_io = require('socket.io').listen(http);

//Creating a server
const server = http.createServer(function handler(req, res) {
  var url = req.url;
  if (req.url == '/') {
    url = '/chat.html';
  }
  if (req.url == '/favicon.ico') {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200);
  res.end(fs.readFileSync(__dirname + url));
});

const io = socket_io.listen(server);

const totalRoomList = {};
const totalUserList = {};
const waitingQueue = [];

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
    } else {
      waitingQueue.push(socket);
      io.to(socket.id).emit('completeMatch', {
        matched: false
      });
    }
  });

  //User wants to send a message
  socket.on('send message', (name, text) => {
    const room_key = totalRoomList[socket.id];
    //console.log(name);

    //massage = name + ': ' + text;
    io.sockets.in(room_key).emit('receive message', name, text);
  });

  socket.on('disconnect', function () {
    const room_key = totalRoomList[socket.id];
    const name = totalUserList[socket.id]
    console.log(name + " is disconnected");
    io.sockets.in(room_key).emit('leftRoom', name);
    socket.leave(room_key);
  })
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

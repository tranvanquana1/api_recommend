const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = 8088;

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const server = http.createServer(app);

const io = socketIo(server);

io.on("connection", (socket) => {
  // console.log("New client connected");
  // socket.emit('chao')

  //Gửi thông báo cho đầu bếp
  socket.on("send-bill", (data) => {
    console.log(data);
    io.emit("toChef", data);
  });

  socket.on('complete-food', (data) => {
    io.emit('toEmployee', data)
  })
});

io.on("error", (error) => {
  console.log("Đã có lỗi xảy ra: ", error);
});

io.on("disconnect", function () {
  console.log("Disconnect");
});

server.listen(port, () => console.log(`Listening on port ${port}`));

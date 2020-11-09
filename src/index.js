const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);

//Cnnecting our server with socket.io
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

const msg = "Welcome to River 😉";

//This event will be fired when a new socket connection is made
io.on("connection", (socket) => {
  console.log("New socket connection established");

  socket.emit("welcome", msg);

  socket.on("sendMessage", (message) => {
    io.emit("welcome", message); // this emitts event for all socket connections
  });
});

server.listen(port, () => {
  console.log(`listening on port ${port}!`);
});

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

//This event will be fired when a new socket connection is made
io.on("connection", (socket) => {
  console.log("New socket connection established");

  socket.emit("message", "Welcome to River 😉");

  socket.broadcast.emit("message", "A new user has joined!");

  socket.on("sendMessage", (message) => {
    io.emit("message", message); // this emitts event for all socket connections
  });

  //This event will work when a user leaves
  socket.on("disconnect", () => {
    io.emit("message", "A user has left!");
  });
});

server.listen(port, () => {
  console.log(`listening on port ${port}!`);
});

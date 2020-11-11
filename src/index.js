const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/message");

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

  socket.emit("message", generateMessage("Welcome to River 😉"));

  socket.broadcast.emit("message", generateMessage("A new user has joined!"));

  socket.on("sendMessage", (message, callback) => {
    //Checking for bad words
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Bad words not allowed!");
    }
    io.emit("message", generateMessage(message)); // this emitts event for all socket connections
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    io.emit(
      "locationMessage",
      `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    );
    callback();
  });

  //This event will work when a user leaves
  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left!"));
  });
});

server.listen(port, () => {
  console.log(`listening on port ${port}!`);
});

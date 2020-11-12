const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

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

  //Creating a room
  socket.on("join", ({ username, room }, callback) => {
    //Adding user to users array and
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Zucknet", "Welcome to River 😉"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(`${user.username} has joined!`));

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    //Checking for bad words
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Bad words not allowed!");
    }
    io.to(user.room).emit("message", generateMessage(user.username, message)); // this emitts event for all socket connections
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  //This event will work when a user leaves
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left!`)
      );
    }
  });
});

server.listen(port, () => {
  console.log(`listening on port ${port}!`);
});

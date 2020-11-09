const socket = io();

socket.on("welcome", (msg) => {
  console.log(msg);
});

document.getElementById("message-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message);
});

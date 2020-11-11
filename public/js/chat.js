const socket = io();

socket.on("message", (msg) => {
  console.log(msg);
});

document.getElementById("message-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const message = e.target.elements.message.value;

  //Also sneding a acknowledgement when message received
  socket.emit("sendMessage", message, (error) => {
    if (error) {
      return console.log(error);
    }

    console.log("Message delivered");
  });
});

document.querySelector("#send-location").addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Your browser does not support geolocation.");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    //console.log(position);
    socket.emit("sendLocation", {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  });
});

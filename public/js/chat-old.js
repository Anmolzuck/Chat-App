const socket = io();

//elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Template
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//Autoschroll functionality

const autoschroll = () => {
  // Get new message element
  const $newMessage = $messages.lastElementChild;

  //Get height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //Visible height
  const visibleHeight = $messages.offsetHeight;

  //Height of messages container
  const containerHeight = $messages.scrollHeight;

  //How far have i Scrolled ?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (msg) => {
  // console.log(msg);
  const html = Mustache.render(messageTemplate, {
    name: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:m a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);

  autoschroll();
});

socket.on("locationMessage", (url) => {
  // console.log(url);
  const html = Mustache.render(locationTemplate, {
    name: url.username,
    url: url.link,
    createdAt: moment(url.createdAt).format("h:m a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);

  autoschroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //Disable submit button
  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;

  //Also sneding a acknowledgement when message received
  socket.emit("sendMessage", message, (error) => {
    //Enable submit button
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    //console.log("Message delivered");
  });
});

$sendLocationButton.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Your browser does not support geolocation.");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    //console.log(position);
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        //console.log("Location shared!");
      }
    );
  });
});

//Sending username and room to server
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

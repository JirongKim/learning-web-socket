const socket = io();

const $welcome = document.querySelector("#welcome");
const $welcome_form = document.querySelector("#welcome-form");
const $room = document.querySelector("#room");
$room.hidden = true;
const $room_form = document.querySelector("#room-form");
const $room_name = document.querySelector("#room-name");

let $roomName;
function showRoom(roomName) {
  $welcome.hidden = true;
  $room.hidden = false;
  const $h3 = $room.querySelector("h3");
  $roomName = roomName;
  $h3.innerHTML = roomName;
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = $welcome_form.querySelector("input");
  socket.emit("enter_room", { payload: input.value }, showRoom);
  input.value = "";
}

function addMessage(msg) {
  const $ul = $room.querySelector("ul");
  const $li = document.createElement("li");
  $li.innerHTML = msg;
  $ul.appendChild($li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = $room_form.querySelector("input");
  socket.emit("add_message", { payload: input.value }, $roomName, addMessage);
  input.value = "";
}

function handleNameSubmit(event) {
  event.preventDefault();
  const input = $room_name.querySelector("input");
  socket.emit("nickname", { payload: input.value });
  input.value = "";
}

$welcome_form.addEventListener("submit", handleRoomSubmit);
$room_form.addEventListener("submit", handleMessageSubmit);
$room_name.addEventListener("submit", handleNameSubmit);

socket.on("welcome", (user, count) => {
  const $h3 = $room.querySelector("h3");
  $h3.innerText = `Room ${$roomName}(${count})`
  addMessage(`${user} joined!`);
});

socket.on("bye", (user, count) => {
  const $h3 = $room.querySelector("h3");
  $h3.innerText = `Room ${$roomName}(${count})`
  addMessage(`${user} left!`);
});

socket.on("new_message", addMessage);
socket.on("room_change", (rooms) => {
  const $roomList = $welcome.querySelector("ul");
  $roomList.innerHTML = "";
  console.log(rooms);
  if(rooms.length === 0 ){
    return;
  }
  rooms.forEach((room) => {
    const $li = document.createElement("li");
    $li.innerHTML = room;
    $roomList.appendChild($li);
  });
});

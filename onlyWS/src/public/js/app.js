const $btn = document.querySelector(".send");
const $messageList = document.querySelector(".messageList");
const $messageForm = document.querySelector("#message");
const $nickForm = document.querySelector("#nick");
const socket = new WebSocket(`ws://${window.location.host}`);
console.log(socket);

function encodeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = $nickForm.querySelector("input");
  socket.send(encodeMessage("nickname", input.value));
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = $messageForm.querySelector("input");
  socket.send(encodeMessage("message", input.value));
}

$messageForm.addEventListener("submit", handleMessageSubmit);
$nickForm.addEventListener("submit", handleNickSubmit);

socket.addEventListener("open", () => {
  console.log("Connected to Browser");
});

socket.addEventListener("message", (message) => {
  let $li = document.createElement("li");
  $li.innerHTML = `${message.data}`;
  $messageList.appendChild($li);
});

socket.addEventListener("close", () => {
  console.log("Disconnected to Browser");
});

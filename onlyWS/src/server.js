import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/public/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("*", (req, res) => res.redirect("/"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function encodeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

function decodeMessage(msg) {
  return JSON.parse(msg);
}

const sockets = [];
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Annonymous";

  socket.on("close", () => {
    console.log("disconnedted from the browser");
  });
  
  socket.on("message", (message) => {
    const parsed = decodeMessage(message);
    console.log(
      `from client type : ${parsed.type},  payload : ${parsed.payload}`
    );
    if (parsed.type === "nickname") {
      socket["nickname"] = parsed.payload;
    } else if (parsed.type === "message") {
      sockets.forEach((s) => {
        s.send(`${socket.nickname}: ${parsed.payload}`);
      });
    }
  });
});

server.listen(3000);

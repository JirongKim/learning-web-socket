import http from "http";
import SocketIo from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/public/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIo(httpServer);

function getPublicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function getCountRoom(roomName){
  console.log("count");
  console.log(wsServer.sockets.adapter.rooms.get(roomName)?.size);
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "annoy";
  wsServer.sockets.emit("room_change", getPublicRooms()); // 본인포함 모두에게
  socket.onAny((event) => {
    console.log(`Socket Event : ${event}`);
  });

  socket.on("enter_room", (msg, done) => {
    const roomName = msg.payload;
    socket.join(roomName);
    done(roomName);
    socket.to(roomName).emit("welcome", socket.nickname, getCountRoom(roomName)); // 본인을 제외한 나머지에게
    wsServer.sockets.emit("room_change", getPublicRooms()); // 본인포함 모두에게
  });

  socket.on("disconnecting", (reason) => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname, getCountRoom(room) - 1);
    });
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", getPublicRooms()); // 본인포함 모두에게
  });
  socket.on("add_message", (msg, room, done) => {
    const message = msg.payload;
    socket.to(room).emit("new_message", `${socket.nickname}: ${message}`);
    done(message);
  });

  socket.on("nickname", (msg) => {
    let nickname = msg.payload;
    socket["nickname"] = nickname;
  });
});

httpServer.listen(3000);

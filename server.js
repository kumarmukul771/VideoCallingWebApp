const express = require("express");
const app = express();

// server is require fro socket.io
// this creates a server to be used with socket.io
const server = require("http").Server(app);

// This creates a server based on our express server
const io = require("socket.io")(server);

const { v4: uuidV4 } = require("uuid");
const { Socket } = require("dgram");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// this is gonna run anytime user connects to our webpage
io.on("connection", (socket) => {
  // actual socket that user is connecting through(socket in function argument)
  // set up events to listen to
  // event when somene connects to our room
  socket.on("join-room", (roomId, userId) => {
    //   Now we re joining room so anytime something happens on this room we will send this to socket
    socket.join(roomId);

    // that means we're going to send message to the room we're currently in
    // broadcast sends it to everyone in the same room bt not to us.
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

server.listen(3000);

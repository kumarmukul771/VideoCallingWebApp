// Due to line 31 in room.ejs this has access to io

// socket is gonna listen to root fath localhost:3000/
const socket = io("/");

const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
// Mute our video so we dont get our own voice
myVideo.muted = true;

const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    videoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);

      //   Othet user gets our call
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        videoStream(video, userVideoStream);
      });
    });

    // Connect to other users
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

// 1st arg is id bt here we want peer to take care of the server generating own id
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

// All that peer server does is that it take all of webRTC information for a user
// and turns into really easy to use id which we can pass between different places
// and use with this peer library to actually connect with other peer network
// D:\ZoomClone>peerjs --port 3001
// Started PeerServer on ::, port: 3001, path: / (v. 0.5.3)
// Client connected: 013c8673-2425-4d08-8d52-e99d69cad7b4

// As soonas we connect to peers server and get an id , we want to run below code
myPeer.on("open", (id) => {
  // this is gonna send an event to our server
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

// We need to keep track of which people we have connected to and what call they have set up.
// So here when we conncet to new user we need to save some form of variablethat tells us what
// call we made to user so that we cxan remove it
function connectToNewUser(userId, stream) {
  // Call a user we give certain id to.
  const call = myPeer.call(userId, stream);

  const video = document.createElement("video");

  //   When they send back their video stream we gonna call this stream that takes their video stream
  call.on("stream", (userVideoStream) => {
    videoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });

  //   So now essentially every user id is directly linked to a call we make
  peers[userId] = call;
}

function videoStream(video, stream) {
  // this will allow us to play our video
  console.log(video);
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
}

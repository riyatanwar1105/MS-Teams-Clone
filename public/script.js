// This is script.js file which contains client side code

const socket = io("/");
const videoGrid = document.getElementById("video-grid");  
const chatInputBox = document.getElementById("chat_message");
const main__chat__window = document.getElementById("main__chat__window");
const all_messages = document.getElementById("all_messages");
const myVideo = document.createElement("video");
myVideo.muted = true;   

//Connecting to server from client PeerJS
var peer = new Peer(undefined, {   
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVideoStream;

var getUserMedia = navigator.getUserMedia ||
                   navigator.webkitGetUserMedia ||
                   navigator.mozGetUserMedia;

navigator.mediaDevices.getUserMedia({                   // prompts user for permission to use audio and video
    video: true,                                        // promise - event either resolved or rejected
    audio: true,
  })
  .then((stream) => {                                   // .then means we have access to cam and mic
    myVideoStream = stream;                             // my video stream will receive the stream
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {                         // when user calls us then we 
      call.answer(stream);                              // answer user call
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);         // add user's stream
      });
    });

    socket.on("user-connected", (userId) => {     
      connectToNewUser(userId, stream);
    });

    // Working of Chat functionality 
    document.addEventListener("keydown", (e) => {       // Adding event listener
      if (e.which === 13 && chatInputBox.value != "") { 
        socket.emit("message", chatInputBox.value);     // Sending the user's message
        chatInputBox.value = "";                        // Clearing the user's input
      }
    });

    socket.on("createMessage", (msg) => {              // Server is displaying user's msg 
      console.log(msg);
      let li = document.createElement("li");
      li.innerHTML = msg;
      all_messages.append(li);
      main__chat__window.scrollTop = main__chat__window.scrollHeight;
    });
  });

peer.on("call", function (call) {
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      call.answer(stream); 
      const video = document.createElement("video");
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);
      });
    },
    function (err) {
      console.log("Failed to get local stream", err);
    }
  );
});

peer.on("open", (id) => {                                           // Connection emitted when peer connects to server
  socket.emit("join-room", ROOM_ID, id);  
});

const connectToNewUser = (userId, streams) => {                    // Connecting to new user
  var call = peer.call(userId, streams);                           // Calling user with id and sending my stream
  console.log(call);
  var video = document.createElement("video");                     // creating new video ele
  call.on("stream", (userVideoStream) => {
    console.log(userVideoStream);
    addVideoStream(video, userVideoStream);                        // Add user's stream
  });
};

const addVideoStream = (videoEle, stream) => {                     // Creating addVideoStream function                  
  videoEle.srcObject = stream;
  videoEle.addEventListener("loadedmetadata", () => {             // When data gets loaded play the video 
    videoEle.play();
  });
  videoGrid.append(videoEle);                                     // Appending the video received to the grid
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
    }
  }
};

// Enabiling Pause Video - Resume Video functionality
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;        
  if (enabled) {                                                  // If my video is enabled
    myVideoStream.getVideoTracks()[0].enabled = false;            // then disable it
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;             // Otherwise enable it
  }
};

// Enabiling Mute - Unmute functionality
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {                                                  // If my audio is enabled 
    myVideoStream.getAudioTracks()[0].enabled = false;            // then disable it
    setUnmuteButton();
  } else {
    setMuteButton();                                  
    myVideoStream.getAudioTracks()[0].enabled = true;             // Otherwise enable it
  }
};

const setPlayVideo = () => {                                      // Setting up play video button
  const html = `<i class="unmute fa fa-pause-circle"></i>
  <span class="unmute">Resume Video</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setStopVideo = () => {                                      // Setting up stop video button
  const html = `<i class=" fa fa-video-camera"></i>
  <span class="">Pause Video</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setUnmuteButton = () => {                                   // Setting up unmute button
  const html = `<i class="unmute fa fa-microphone-slash"></i>
  <span class="unmute">Unmute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};

const setMuteButton = () => {                                    // Setting up mute button
  const html = `<i class="fa fa-microphone"></i>
  <span>Mute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};


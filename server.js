// This is server.js file which contains server side code

const express = require("express");                     // Require express module
const app = express();                                  // Creating an express app object
const server = require("http").Server(app);             // Creating http server that listens on server port
const { v4: uuidv4 } = require("uuid");                 // Importing uuuid
const io = require("socket.io")(server);                // Importing socket.io - a javascript library

const { ExpressPeerServer } = require("peer");          // Importing peer
const peerServer = ExpressPeerServer(server, {          // Combining peerJS with express app 
  debug: true,
});

app.set("view engine", "ejs");                          // Creating our first view 
app.use(express.static ("public"));                     
app.use("/peerjs", peerServer);                         

app.get("/", (req, res) => {                            // Go to the url 
  res.redirect(`/${uuidv4()}`);                         // and redirect the user to this random unique uuid 
});

app.get("/:room", (req, res) => {                       // Passing the current url to the unique room
  res.render("room", { roomId: req.params.room });      // Passing roomid to room.ejs
});

io.on("connection", (socket) => {                       // Creating connection
  socket.on("join-room", (roomId, userId) => {          
    socket.join(roomId);                                // Users joins the room
    socket.to(roomId).emit("user-connected", userId);   // Broadcast that user got connected

    socket.on("message", (message) => {                 // Receiving user's msg
      io.to(roomId).emit("createMessage", message);     // Sending user's msg to same room 
    });
  });
});

server.listen(process.env.PORT || 3000);                // Server is going to listen request on port 3000

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors'); // Import the cors middleware
const moment = require('moment');
const player = require('play-sound')();

const soundFilePath = './sound.mp3';

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  

const PORT = process.env.PORT || 3001;


const currentData = [];


// Use the cors middleware
app.use(cors());

app.get('/', (req, res) => {
//executeProcess();
  res.send("Hello World");
});

io.on('connection', (socket) => {
  console.log('A client connected');

  socket.on('face-matched', (name) => {
    const currentTime = moment().format('h:mm:ss A');
    
    // Check if name exists in currentData array
    const existingEntry = currentData.find(entry => entry.name === name);
   // console.log(existingEntry)

    // If name doesn't exist, push a new entry
    if (!existingEntry) {
      currentData.push({
        name: name,
        time: currentTime
      });
      console.log('face matched', currentData)
      
      // Emit the updated currentData array
      io.emit('current-data', currentData);
    }
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://192.168.5.4:${PORT}`);
});

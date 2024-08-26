const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

const ioredis = require('ioredis');
const redis = new ioredis();
const MESSAGE_LIST_KEY = 'messages';
const MAIN_CHANNEL_KEY = 'main';

// Function to send a message to a specific channel and store it
const sendMessage = async (channel, name, message) => {
  try {
    let now = new Date();
    await redis.rpush(MESSAGE_LIST_KEY, JSON.stringify({ channel, name: name, message: message, timestamp: now }));
    io.emit('chat message', name, message, now);
    console.log(`User ${name} sent message sent to channel ${channel}: ${message}`);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const updateWithMessages = async (socket) => {
  try {
    const messages = await redis.lrange(MESSAGE_LIST_KEY, 0, -1);
    messages.map(msg => {
      let name = JSON.parse(msg).name;
      let message = JSON.parse(msg).message;
      let date = new Date(JSON.parse(msg).timestamp);
      socket.emit('chat message', name, message, date);
    });
  } catch (error) {
    console.error('Error retrieving messages:', error);
  }
};

// app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/index.js', (req, res) => {
  res.sendFile(__dirname + '/public/index.js');
});

app.get('/index.css', (req, res) => {
  res.sendFile(__dirname + '/public/index.css');
});

app.post('/saveName', (req, res) => {
  console.log(req.body);
  res.send(req.body.name);
  // req.session.name = req.body;
});

app.get('/getName', (req, res) => {
  // res.sendFile(__dirname + '/public/index.css');
});

io.on('connection', async (socket) => {
  console.log('New WebSocket client connected.');
  socket.on('chat message', (name, msg) => {
    sendMessage(MAIN_CHANNEL_KEY, name, msg);
  });
  await updateWithMessages(socket);
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
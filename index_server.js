const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const ioredis = require('ioredis');
const path = require('path');

const redis = new ioredis();
const MESSAGE_LIST_KEY = 'messages';
const MAIN_CHANNEL_KEY = 'main';

// Function to send a message to a specific channel and store it
const sendMessage = async (channel, name, message) => {
  try {
    await redis.rpush(MESSAGE_LIST_KEY, JSON.stringify({ channel, name, message, timestamp: new Date() }));
    io.emit('chat message', name, message);
    console.log(`Message sent to channel ${channel}: ${message}`);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const updateWithMessages = async (socket) => {
  try {
    const messages = await redis.lrange(MESSAGE_LIST_KEY, 0, -1);
    messages.map(msg => socket.emit('chat message',  "", JSON.parse(msg).message));
  } catch (error) {
    console.error('Error retrieving messages:', error);
  }
};

app.use(express.static(path.join(__dirname, 'public')));

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
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const Redis = require('ioredis');


// const redis = ioredis.createClient({
//   host: 'localhost',
//   port: 6379
// });
//
// redis.on('error', (err) => {
//   console.log('redis error: ', err);
// });
//
// // redis.connect();
// redis.connect().then(async () => {
//   console.log('Connected to Redis');
//
//   // Function to store a message and add its ID to a set
//   const storeMessage = async (messageId, name, message, date) => {
//     try {
//       await redis.hmset(messageId, { name, message, date });
//       await redis.sadd('messages', messageId); // Add the message ID to the set
//       console.log(`Message stored with ID ${messageId}`);
//     } catch (err) {
//       console.error('Error storing message:', err);
//     }
//   };
//
//   // Function to retrieve all messages
//   const retrieveAllMessages = async () => {
//     try {
//       const messageIds = await redis.smembers('messages'); // Get all message IDs
//       const messages = await Promise.all(
//         messageIds.map(async (id) => await redis.hgetall(id))
//       );
//       console.log('Retrieved messages:', messages);
//     } catch (err) {
//       console.error('Error retrieving messages:', err);
//     }
//   };
//
//   // Store some messages
//   await storeMessage('msg1', 'Alice', 'Hello, World!', new Date().toISOString());
//   await storeMessage('msg2', 'Bob', 'Redis is great!', new Date().toISOString());
//
//   // Retrieve all messages
//   await retrieveAllMessages();
//
//   // Close the Redis connection
//   redis.quit();
// });

const redis = new Redis();
const MESSAGE_LIST_KEY = 'messages';
const MAIN_CHANNEL_KEY = 'main';

// Function to send a message to a specific channel and store it
const sendMessage = async (channel, message) => {
  try {
    // Publish the message to the channel

    // Store the message in the list
    await redis.publish(channel, message);
    await redis.rpush(MESSAGE_LIST_KEY, JSON.stringify({ channel, message, timestamp: new Date() }));

    console.log(`Message sent to channel ${channel}: ${message}`);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// Function to retrieve all stored messages
const getAllMessages = async () => {
  try {
    // Get all messages from the list
    const messages = await redis.lrange(MESSAGE_LIST_KEY, 0, -1);
    if (messages === undefined || messages.length == 0) {
      return '';
    }
    return messages.map(msg => JSON.parse(msg));
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return [];
  }
};

const updateWithMessages = async (socket) => {
  try {
    // Get all messages from the list
    const messages = await redis.lrange(MESSAGE_LIST_KEY, 0, -1);
    console.log(messages.length);
    messages.map(msg => socket.emit('chat message', JSON.parse(msg).message));
  } catch (error) {
    console.error('Error retrieving messages:', error);
  }
};

// Function to subscribe to a specific channel and listen for messages
const subscribeToChannel = (channel) => {
  redis.subscribe(channel);
  redis.on('message', (channel, message) => {
    console.log(`Message received on channel ${channel}: ${message}`);
  });
};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');

});

io.on('connection', (socket) => {
  console.log('New WebSocket client connected.');
  socket.on('chat message', msg => {
    sendMessage(MAIN_CHANNEL_KEY, msg);
  });
  updateWithMessages(socket);
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
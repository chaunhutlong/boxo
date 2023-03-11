/* eslint-disable no-console */

const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/mongo-adapter');
const { MongoClient } = require('mongodb');
const auth = require('../middlewares/auth');

const COLLECTION = 'socket.io-adapter-events';

const adapter = async (io, mongoUrl) => {
  const mongoClient = new MongoClient(mongoUrl, {
    useUnifiedTopology: true,
  });

  await mongoClient.connect();

  const db = mongoClient.db();

  try {
    await db.createCollection(COLLECTION, {
      capped: true,
      size: 1e5,
    });
  } catch (e) {
    if (e.code !== 48) {
      throw e;
    }
  }

  io.adapter(createAdapter(db.collection(COLLECTION)));

  return io;
};

const socketio = async (server, mongoUrl) => {
  return new Promise((resolve) => {
    adapter(new Server(server), mongoUrl).then((io) => {
      io.use(auth).on('connection', (socket) => {
        socket.on('disconnect', () => {
          console.log('user disconnected');
        });
      });

      resolve({
        message: 'Socket.io is running',
        io,
      });
    });
  });
};

module.exports = socketio;

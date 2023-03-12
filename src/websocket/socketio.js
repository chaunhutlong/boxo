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
    const serverSocket = new Server(server, {
      cors: {
        origin: '*',
      },
    });

    adapter(serverSocket, mongoUrl).then((io) => {
      const wrap = (middleware) => async (socket, next) => {
        await middleware(socket.request, {}, next);
      };

      io.use(wrap(auth()));

      io.on('connection', async (socket) => {
        const { id: userId } = socket.request.user;

        console.log(`Socket ${socket.id} connected for user ${userId}`);

        socket.on('disconnect', async () => {
          console.log(`User ${userId} with socket ${socket.id} is disconnected`);
        });

        socket.on('connect_error', (err) => {
          console.error(err);
        });

        resolve(io);
      });
    });
  });
};

module.exports = socketio;

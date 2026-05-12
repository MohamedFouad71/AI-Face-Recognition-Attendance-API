import app from './app.js';
import startServer from '#utils/startServer.js';

process.on('uncaughtException', (err) => {
  console.log('Uncaught exceptions !!\nShutting down the application...');
  console.log(err.name, err.message);
  process.exit(1);
});

const port = process.env.PORT ?? '3000';
const domain = process.env.DOMAIN ?? '127.0.0.1';
const server = await startServer(app, domain, port);

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection !!\nShutting Down The Server');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

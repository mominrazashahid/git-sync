// server.js
const cluster = require('cluster');
const os = require('os');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);
  console.log(`Spawning ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork(); // Spawn a worker
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Spawning a new one.`);
    cluster.fork();
  });

} else {
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started. Listening on http://localhost:${PORT}`);
  });
}

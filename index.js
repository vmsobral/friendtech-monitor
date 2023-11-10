const monitorService = require('./monitorService')
const pino = require('pino')

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty'
  }
});

const run = async () => {
  monitorService.start(logger)
}

try {
  run();
} catch (error) {
  console.error('ERR:', error);
}

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});
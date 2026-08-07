const write = (stream, level, message) => {
  const timestamp = new Date().toISOString();
  stream.write(`[${timestamp}] [${level.toUpperCase()}] ${message}\n`);
};

const logger = {
  info: (message) => write(process.stdout, 'info', message),
  http: (message) => write(process.stdout, 'http', message),
  debug: (message) => write(process.stdout, 'debug', message),
  warn: (message) => write(process.stderr, 'warn', message),
  error: (message) => write(process.stderr, 'error', message),
};

export default logger;

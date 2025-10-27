import process from 'process';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const envLevel = process.env.LOG_LEVEL?.toLowerCase() ?? 'info';
const currentLevel = levels[envLevel] ?? levels.info;

function formatMessage(level, args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => {
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

function log(level, ...args) {
  if (levels[level] <= currentLevel) {
    // eslint-disable-next-line no-console
    console[level](formatMessage(level, args));
  }
}

export const logger = {
  error: (...args) => log('error', ...args),
  warn: (...args) => log('warn', ...args),
  info: (...args) => log('info', ...args),
  debug: (...args) => log('debug', ...args),
};

export default logger;

interface LevelsInterface {
  [key: string]: number;
}
const LEVELS: LevelsInterface = {
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

interface CustomLogFormat {
  ID?: string;
  mediaType: string;
  action: string;
  description: string;
  error?: Error;
}

interface LoggerInterface {
  info: (logInfo: CustomLogFormat) => void;
  warn: (logInfo: CustomLogFormat) => void;
  error: (logInfo: CustomLogFormat) => void;
  debug: (logInfo: CustomLogFormat) => void;
}

const logFormat = (level: string, logDetails: CustomLogFormat) => {
  const {ID, mediaType, action, description, error} = logDetails;
  const timestamp = new Date().toISOString();

  return `${timestamp} ${level} ${ID ?? ''} ${mediaType} ${action} ${description} ${
    error ? `${error.stack || error}` : ''
  }`
    .replace(/\s+/g, ' ')
    .trim();
};

let currentLevel = 'error';

const log = (level: string, args: CustomLogFormat) => {
  if (LEVELS[level] <= LEVELS[currentLevel]) {
    // eslint-disable-next-line no-console
    console.log(logFormat(level, args));
  }
};

// create a custom logger and export it
const logger: LoggerInterface = {
  info: (args: CustomLogFormat) => log('info', args),
  warn: (args: CustomLogFormat) => log('warn', args),
  error: (args: CustomLogFormat) => log('error', args),
  debug: (args: CustomLogFormat) => log('debug', args),
};

for (const level of ['info', 'warn', 'error', 'debug']) {
  // eslint-disable-next-line no-loop-func
  logger[level as keyof LoggerInterface] = (logInfo: CustomLogFormat): void => {
    const {ID, mediaType, action, description, error} = logInfo;

    currentLevel = level; // dynamically changing log level

    return log(level, {
      ID,
      mediaType,
      action,
      description,
      error,
    });
  };
}

export default logger;

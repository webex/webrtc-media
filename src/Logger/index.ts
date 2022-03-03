import 'setimmediate';
import {
  createLogger, format, Logger, transports,
} from 'winston';

interface CustomLogFormat {
  ID?: string;
  mediaType: string;
  action: string;
  description: string;
  error?: Error;
}

interface LoggerInterface {
  info: (logInfo: CustomLogFormat) => Logger;
  warn: (logInfo: CustomLogFormat) => Logger;
  error: (logInfo: CustomLogFormat) => Logger;
  debug: (logInfo: CustomLogFormat) => Logger;
}

interface TransformableInfo {
  [key: string]: CustomLogFormat;
}

const logFormat = format.printf((logDetails: TransformableInfo) => {
  const {
    timestamp,
    level,
    message: {
      ID, mediaType, action, description, error,
    },
  } = logDetails;

  return `${timestamp} ${level} ${
    ID ?? ''
  } ${mediaType} ${action} ${description} ${
    error ? `${error.stack || error}` : ''
  }`
    .replace(/\s+/g, ' ')
    .trim();
});

const activeTransports = [];

if (process.env.NODE_ENV !== 'production') {
  activeTransports.push(
    new transports.Console({
      format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        format.simple(),
        logFormat,
      ),
    }),
  );
}

const winstonLogger: Logger = createLogger({
  level: 'error',
  transports: activeTransports,
});

// create a custom logger and export it
const logger: LoggerInterface = {
  info: () => winstonLogger.info({}),
  warn: () => winstonLogger.warn({}),
  error: () => winstonLogger.error({}),
  debug: () => winstonLogger.debug({}),
};

for (const level of ['info', 'warn', 'error', 'debug']) {
  logger[level as keyof LoggerInterface] = (
    logInfo: CustomLogFormat,
  ): Logger => {
    const {
      ID, mediaType, action, description, error,
    } = logInfo;

    winstonLogger.level = level; // dynamically changing log level

    return winstonLogger[level as keyof Logger]({
      ID,
      mediaType,
      action,
      description,
      error,
    });
  };
}

export default logger;

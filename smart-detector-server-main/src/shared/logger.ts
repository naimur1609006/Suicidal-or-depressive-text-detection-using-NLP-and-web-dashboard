import path from 'path';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../config';
const { combine, timestamp, label, printf, prettyPrint } = format;

const productionFormat = printf(({ level, message, label, timestamp }) => {
  const date = new Date(timestamp) as Date;
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${date.toDateString()} ${hour}:${minutes}:${seconds} [${label}] ${level}: ${message}`;
});

const devFormat = printf(({ level, message, timestamp }) => {
  const date = new Date(timestamp) as Date;
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${date.toDateString()} ${hour}:${minutes}:${seconds} - ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'Smart Detector' }),
    timestamp(),
    productionFormat,
    prettyPrint()
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        'logs',
        'winston',
        'successLogs',
        '%DATE%-success.log'
      ),
      datePattern: 'DD-MM-YYYY-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

const errorLogger = createLogger({
  level: 'error',
  format: combine(
    label({ label: 'Smart Detector' }),
    timestamp(),
    productionFormat,
    prettyPrint()
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        'logs',
        'winston',
        'errorLogs',
        '%DATE%-error.log'
      ),
      datePattern: 'DD-MM-YYYY-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

if (config.node_type !== 'production') {
  logger.add(
    new transports.Console({
      format: devFormat,
    })
  );
}
if (config.node_type !== 'production') {
  errorLogger.add(
    new transports.Console({
      format: devFormat,
    })
  );
}

export { errorLogger, logger };


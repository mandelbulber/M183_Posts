import { createLogger, transports, format } from 'winston';

const customFormatConsole = format.combine(
    format(info => {
        info.level = info.level.toUpperCase()
        return info;
    })(),
    format.colorize(),
    format.align(),
    format.printf((info) => {
        return `[${info.level}]  ${info.message}`;
    })
);

const customFormatFile = format.combine(
    format(info => {
        info.level = info.level.toUpperCase()
        return info;
    })(),
    format.align(),
    format.timestamp(),
    format.printf((info) => {
        return `${info.timestamp} [${info.level}]  ${info.message}`;
    })
);

export const logger = createLogger({
    transports: [
        new transports.Console({
            level: 'debug',
            handleExceptions: true,
            format: customFormatConsole,
        }),
        new transports.File({
            level: 'silly',
            filename: 'logs/combined.log',
            handleExceptions: true,
            format: customFormatFile,
        }),
        new transports.File({
            level: 'error',
            filename: 'logs/error.log',
            handleExceptions: true,
            format: customFormatFile,
        })
    ],
    exitOnError: false
});

import pino, { Logger, LoggerOptions } from 'pino';

import { getEnv } from '@gq/config';

let loggerInstance: Logger | null = null;

export function getLogger(options?: LoggerOptions): Logger {
  if (loggerInstance && !options) return loggerInstance;
  const env = getEnv();
  const isDev = env.NODE_ENV === 'development';
  const defaultOptions: LoggerOptions = {
    level: env.LOG_LEVEL,
    formatters: { level: (label) => ({ level: label }) },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    base: { service: env.APP_NAME, version: env.APP_VERSION, env: env.NODE_ENV },
    redact: { paths: ['password', 'token', 'secret', 'key', 'identifier', 'req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'req.body.refreshToken', 'req.body.identifier', '*.password', '*.secret', '*.token', '*.key'], censor: '[REDACTED]' },
  };
  if (isDev && env.LOG_PRETTY) {
    defaultOptions.transport = { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' } };
  }
  const mergedOptions = options ? { ...defaultOptions, ...options } : defaultOptions;
  const logger = pino(mergedOptions);
  if (!options) loggerInstance = logger;
  return logger;
}
export function createChildLogger(bindings: Record<string, unknown>): Logger { return getLogger().child(bindings); }
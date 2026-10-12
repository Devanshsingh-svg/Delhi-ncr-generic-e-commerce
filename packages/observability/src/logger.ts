import pino, { Logger } from 'pino';
import { getEnv } from '@gq/config';

let loggerInstance: Logger | null = null;
export function getLogger(): Logger {
  if (loggerInstance) return loggerInstance;
  const env = getEnv(); const isDev = env.NODE_ENV === 'development';
  loggerInstance = pino({ level: env.LOG_LEVEL, transport: isDev && env.LOG_PRETTY ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' } } : undefined, formatters: { level: (label) => ({ level: label }) }, timestamp: () => `,"time":"${new Date().toISOString()}"`, base: { service: env.APP_NAME, version: env.APP_VERSION, env: env.NODE_ENV }, redact: { paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'req.body.refreshToken', 'req.body.identifier', '*.password', '*.secret', '*.token', '*.key'], censor: '[REDACTED]' } });
  return loggerInstance;
}
export function createChildLogger(bindings: Record<string, unknown>): Logger { return getLogger().child(bindings); }
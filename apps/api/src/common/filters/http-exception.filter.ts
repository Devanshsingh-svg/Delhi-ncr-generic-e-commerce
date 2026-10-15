import { randomUUID } from 'node:crypto';

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
// eslint-disable-next-line import/no-unresolved -- express types from @nestjs/platform-express
import { Request, Response } from 'express';

import { AuthPersistenceNotConfiguredError } from '@gq/domain';
import { getLogger } from '@gq/observability';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = getLogger().child({ filter: 'HttpExceptionFilter' });
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: Record<string, string[]> | undefined;
    if (exception instanceof AuthPersistenceNotConfiguredError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Auth persistence not configured';
      errors = { persistence: ['NotConfigured'] };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        if ('message' in res) message = Array.isArray(res.message) ? res.message[0] : String(res.message);
        if ('errors' in res) errors = res.errors as Record<string, string[]>;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }
    const correlationId = (request.headers['x-correlation-id'] as string) || randomUUID();
    this.logger.error(
      { err: exception, path: request.url, method: request.method, correlationId },
      `HTTP ${status}: ${message}`,
    );
    response.status(status).json({
      statusCode: status,
      error: HttpStatus[status] || 'Error',
      message,
      errors,
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
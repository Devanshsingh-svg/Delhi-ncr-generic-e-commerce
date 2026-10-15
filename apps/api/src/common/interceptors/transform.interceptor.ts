 import { randomUUID } from 'node:crypto';
 
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'; import { Observable, map } from 'rxjs';

 import { getLogger } from '@gq/observability';@Injectable() export class TransformInterceptor implements NestInterceptor { private readonly logger = getLogger().child({ interceptor: 'TransformInterceptor' }); intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> { const request = context.switchToHttp().getRequest(); const correlationId = request.headers['x-correlation-id'] as string || randomUUID(); request.correlationId = correlationId; return next.handle().pipe(map((data) => ({ success: true, data, correlationId, timestamp: new Date().toISOString() }))); } }
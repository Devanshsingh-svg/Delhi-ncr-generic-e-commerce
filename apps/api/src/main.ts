import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { getLogger, initTracing } from '@gq/observability';
import { getEnv } from '@gq/config';

async function bootstrap() { initTracing(); const logger = getLogger(); const env = getEnv(); const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log', 'debug', 'verbose'] }); app.setGlobalPrefix('api/v1'); app.useGlobalFilters(new HttpExceptionFilter()); app.useGlobalInterceptors(new TransformInterceptor()); app.enableCors({ origin: env.NODE_ENV === 'development' ? 'http://localhost:3000' : false, credentials: true }); const port = process.env.PORT ?? 4000; await app.listen(port); logger.info({ port }, 'API server started'); }
bootstrap();
import { Controller, Get } from '@nestjs/common';

import { getLogger } from '@gq/observability';

import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  private readonly logger = getLogger().child({ module: 'HealthController' });

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const checks: { name: string; status: 'ok' | 'degraded' | 'down'; latencyMs?: number; details?: Record<string, unknown> }[] = [];
    const dbStart = Date.now();
    try {
      await this.prisma['$queryRaw']`SELECT 1`;
      checks.push({ name: 'postgres', status: 'ok', latencyMs: Date.now() - dbStart });
    } catch (e) {
      checks.push({ name: 'postgres', status: 'degraded', details: { reason: 'no models migrated yet', error: String(e) } });
    }
    checks.push({ name: 'redis', status: 'degraded', details: { reason: 'not wired yet' } });
    const overall = checks.every(c => c.status === 'ok') ? 'ok' : checks.some(c => c.status === 'down') ? 'down' : 'degraded';
    return { status: overall, timestamp: new Date().toISOString(), version: process.env['APP_VERSION'] ?? '0.1.0', checks };
  }
}
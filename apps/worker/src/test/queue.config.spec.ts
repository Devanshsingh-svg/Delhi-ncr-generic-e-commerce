import { QueueConfig } from '../queues/queue.config';

describe('QueueConfig', () => {
  it('exports expected queue names', () => {
    const names = QueueConfig.queues.map((q) => q.name);
    expect(names).toContain('ocr-processing');
    expect(names).toContain('notifications');
    expect(names).toContain('inventory-sync');
    expect(names).toContain('analytics-aggregation');
  });

  it('has defaultJobOptions with retry and backoff config', () => {
    expect(QueueConfig.defaultJobOptions.attempts).toBe(3);
    expect(QueueConfig.defaultJobOptions.backoff.type).toBe('exponential');
    expect(QueueConfig.defaultJobOptions.backoff.delay).toBe(5000);
    expect(QueueConfig.defaultJobOptions.removeOnComplete).toBe(100);
    expect(QueueConfig.defaultJobOptions.removeOnFail).toBe(50);
  });
});

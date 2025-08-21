import { log } from '../lib/logger';

export function trackStreamingPerformance() {
  const startTime = Date.now();

  return {
    recordMetric: (metricName: string, value: number) => {
      log.info(`[performance] ${metricName}`, { value });
    },

    complete: () => {
      const duration = Date.now() - startTime;
      log.info('[performance] Streaming completed', { duration });
      return duration;
    },
  };
}

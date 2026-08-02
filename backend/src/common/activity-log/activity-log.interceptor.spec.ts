import { ActivityLogInterceptor } from './activity-log.interceptor';

describe('ActivityLogInterceptor', () => {
  it('should be defined', () => {
    expect(new ActivityLogInterceptor(null as any)).toBeDefined();
  });
});

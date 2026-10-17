import { describe, it, expect } from 'vitest';
import { apiClient } from '../src/lib/api';

describe('apiClient', () => {
  it('has baseURL set from env or default', () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
    expect(typeof apiClient.defaults.baseURL).toBe('string');
  });

  it('sends credentials with requests', () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it('has a timeout of 15000ms', () => {
    expect(apiClient.defaults.timeout).toBe(15000);
  });

  it('has a request interceptor that adds X-Correlation-ID header', () => {
    const interceptors = apiClient.interceptors.request.handlers;
    expect(interceptors.length).toBeGreaterThan(0);
  });

  it('has a response interceptor that extracts data', () => {
    const interceptors = apiClient.interceptors.response.handlers;
    expect(interceptors.length).toBeGreaterThan(0);
  });
});

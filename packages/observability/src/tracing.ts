import { Resource } from '@opentelemetry/resources';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { getEnv } from '@gq/config';

let tracerProvider: NodeTracerProvider | null = null;

export function initTracing(): NodeTracerProvider {
  if (tracerProvider) return tracerProvider;
  const env = getEnv();
  tracerProvider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: env.APP_NAME,
      [SemanticResourceAttributes.SERVICE_VERSION]: env.APP_VERSION,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env.NODE_ENV,
    }),
  });
  tracerProvider.register();
  return tracerProvider;
}

export function getTracer(name: string): ReturnType<NodeTracerProvider['getTracer']> {
  const provider = tracerProvider ?? initTracing();
  return provider.getTracer(name);
}
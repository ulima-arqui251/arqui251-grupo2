import fetch from 'node-fetch';

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'unhealthy';
  url: string;
  responseTime?: number;
  error?: string;
  timestamp: string;
}

export interface ServiceConfig {
  name: string;
  url: string;
  timeout?: number;
  healthPath?: string;
}

export class HealthChecker {
  private services: ServiceConfig[];

  constructor(services: ServiceConfig[]) {
    this.services = services;
  }

  async checkService(service: ServiceConfig): Promise<ServiceHealth> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const healthUrl = `${service.url}${service.healthPath || '/health'}`;

    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: service.timeout || 5000
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          service: service.name,
          status: 'healthy',
          url: service.url,
          responseTime,
          timestamp
        };
      } else {
        return {
          service: service.name,
          status: 'unhealthy',
          url: service.url,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: service.name,
        status: 'unhealthy',
        url: service.url,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      };
    }
  }

  async checkAllServices(): Promise<ServiceHealth[]> {
    const checks = this.services.map(service => this.checkService(service));
    return Promise.all(checks);
  }

  async checkServicesConcurrently(): Promise<ServiceHealth[]> {
    const results = await Promise.allSettled(
      this.services.map(service => this.checkService(service))
    );

    return results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : {
            service: 'unknown',
            status: 'unhealthy' as const,
            url: 'unknown',
            error: 'Health check failed',
            timestamp: new Date().toISOString()
          }
    );
  }

  isAllHealthy(healthResults: ServiceHealth[]): boolean {
    return healthResults.every(result => result.status === 'healthy');
  }

  getUnhealthyServices(healthResults: ServiceHealth[]): ServiceHealth[] {
    return healthResults.filter(result => result.status === 'unhealthy');
  }

  generateHealthReport(healthResults: ServiceHealth[]) {
    const healthyCount = healthResults.filter(r => r.status === 'healthy').length;
    const unhealthyCount = healthResults.length - healthyCount;
    const avgResponseTime = healthResults
      .filter(r => r.responseTime)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / healthResults.length;

    return {
      overall: this.isAllHealthy(healthResults) ? 'healthy' : 'unhealthy',
      summary: {
        total: healthResults.length,
        healthy: healthyCount,
        unhealthy: unhealthyCount,
        averageResponseTime: Math.round(avgResponseTime) || 0
      },
      services: healthResults,
      timestamp: new Date().toISOString()
    };
  }
}

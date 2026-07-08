export interface HealthCheckResult {
  status: 'ok';
  uptime: number;
  timestamp: string;
  environment: string;
  nodeVersion: string;
  applicationVersion: string;
}

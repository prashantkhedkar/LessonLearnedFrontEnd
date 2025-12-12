# Multi-Server Health Dashboard Setup Guide

## Overview

The ST Application Health Dashboard now supports monitoring multiple production servers simultaneously using configuration-based setup. This allows you to identify which specific server has health issues when using a load balancer setup.

## Configuration Setup

### 1. Using appsettings.json (Recommended)

Update your `appsettings.json` file with your production server details:

```json
{
  "MultiServerConfiguration": {
    "Server1": {
      "Name": "Production Server 1 - Data Center A",
      "BaseUrl": "http://10.198.129.31",
      "Services": {
        "ApiGateway": ":5551/health",
        "AuthenticationApiService": ":5209/health",
        "ProjectApiService": ":5059/health",
        "WatiraApiService": ":5010/health",
        "MeetingCalendarApiService": ":5015/health",
        "HRAdminApiService": ":5002/health",
        "AnnouncementApiService": ":5136/health",
        "IntegrationApiService": ":5005/health",
        "NotificationApiService": ":5100/health",
        "DepartmentWebsiteApiService": ":5075/health"
      }
    },
    "Server2": {
      "Name": "Production Server 2 - Data Center B",
      "BaseUrl": "http://10.198.129.32",
      "Services": {
        "ApiGateway": ":5551/health",
        "AuthenticationApiService": ":5209/health",
        "ProjectApiService": ":5059/health",
        "WatiraApiService": ":5010/health",
        "MeetingCalendarApiService": ":5015/health",
        "HRAdminApiService": ":5002/health",
        "AnnouncementApiService": ":5136/health",
        "IntegrationApiService": ":5005/health",
        "NotificationApiService": ":5100/health",
        "DepartmentWebsiteApiService": ":5075/health"
      }
    }
  },
  "HealthCheckSettings": {
    "TimeoutSeconds": 60,
    "RefreshIntervalSeconds": 30,
    "EnableMultiServerMode": true
  }
}
```

### 2. Environment-Specific Configuration

#### Development (`appsettings.Development.json`)
```json
{
  "MultiServerConfiguration": {
    "Server1": {
      "Name": "Development Server (Localhost)",
      "BaseUrl": "http://localhost",
      "Services": {
        "ApiGateway": ":5551/health",
        "AuthenticationApiService": ":5209/health"
        // ... other services
      }
    }
  },
  "HealthCheckSettings": {
    "EnableMultiServerMode": false,
    "TimeoutSeconds": 30
  }
}
```

#### Production (`appsettings.Production.json`)
```json
{
  "MultiServerConfiguration": {
    "Server1": {
      "Name": "Production Server 1",
      "BaseUrl": "https://api-server1.yourdomain.com"
    },
    "Server2": {
      "Name": "Production Server 2", 
      "BaseUrl": "https://api-server2.yourdomain.com"
    }
  },
  "HealthCheckSettings": {
    "EnableMultiServerMode": true,
    "TimeoutSeconds": 60
  }
}
```

## Available Endpoints

| Endpoint | Description | Response Format |
|----------|-------------|----------------|
| `/api/status/config` | Get current configuration | Configuration info |
| `/api/status/multi-server` | Multi-server health check | Complete health data |
| `/api/status/all` | Single server health check | Single server data |
| `/api/status/services` | List configured services | Service list |

## Dashboard Features

### ?? Server Overview Tab
- **Dynamic Server Names**: Displays configured server names from appsettings.json
- **Real-time Health Status**: Color-coded server health indicators
- **Service Summary**: Quick overview of healthy vs unhealthy services
- **Response Time Monitoring**: Average response times per server

### ?? Detailed View Tab
- **Complete Service Information**: URLs, status codes, response times
- **Error Details**: Specific error messages for failing services
- **Server Context**: Which server each service is running on
- **Network Diagnostics**: Connection and timeout information

### ?? Server Comparison Tab
- **Side-by-side Metrics**: Health and performance comparison
- **Performance Differences**: Response time analysis
- **Issue Identification**: Quick identification of problematic servers
- **Load Balancer Support**: Easy decision making for traffic routing

## Configuration Properties

### Server Configuration
- **Name**: Display name for the server (shown in dashboard)
- **BaseUrl**: Base URL or IP address of the server
- **Services**: Dictionary of service names and their health endpoints

### Health Check Settings
- **TimeoutSeconds**: HTTP timeout for health checks (default: 60)
- **RefreshIntervalSeconds**: Auto-refresh interval (default: 30)
- **EnableMultiServerMode**: Enable/disable multi-server monitoring

## Production Deployment Steps

### 1. Update Configuration Files

#### Option A: Direct appsettings.json Update
```bash
# Update appsettings.json with your production server IPs
"BaseUrl": "http://your-production-server-1-ip"
"BaseUrl": "http://your-production-server-2-ip"
```

#### Option B: Environment Variables
```bash
export MultiServerConfiguration__Server1__BaseUrl="http://10.198.129.31"
export MultiServerConfiguration__Server2__BaseUrl="http://10.198.129.32"
export HealthCheckSettings__EnableMultiServerMode="true"
```

#### Option C: Azure App Configuration / Key Vault
```json
{
  "AzureAppConfiguration": {
    "ConnectionString": "your-connection-string"
  }
}
```

### 2. Network Configuration
```bash
# Ensure monitoring server can reach production servers
ping 10.198.129.31
ping 10.198.129.32

# Test specific service endpoints
curl http://10.198.129.31:5551/health
curl http://10.198.129.32:5551/health
```

### 3. Firewall Rules
- Open ports 5002, 5005, 5010, 5015, 5059, 5075, 5100, 5136, 5209, 5551
- Allow traffic from health check monitoring server
- Configure any proxy or load balancer settings

## Usage Examples

### Scenario 1: Load Balancer Health Check Integration
```bash
# Use multi-server endpoint for load balancer health checks
curl -f http://health-monitor.yourdomain.com/api/status/multi-server
# Returns HTTP 200 if all healthy, 503 if any issues
```

### Scenario 2: Automated Monitoring
```powershell
# PowerShell script for automated monitoring
$response = Invoke-RestMethod "http://health-monitor/api/status/multi-server"
if (-not $response.overallHealthy) {
    Send-SlackAlert "Server health issues detected: $($response.healthSummary)"
}
```

### Scenario 3: Manual Troubleshooting
1. Open multi-server dashboard: `http://health-monitor/health-dashboard-multiserver.html`
2. Check Server Comparison tab for performance differences
3. Use Detailed View tab to investigate specific service errors
4. Take appropriate action based on server-specific issues

## Configuration Validation

### Test Configuration Endpoint
```bash
curl http://your-app/api/status/config
```

### Validate Multi-Server Setup
```bash
curl http://your-app/api/status/multi-server
```

### Check Individual Server Health
```bash
curl http://server1:5551/health
curl http://server2:5551/health
```

## Troubleshooting

### Common Configuration Issues

1. **Invalid Base URLs**
   ```json
   // ? Wrong
   "BaseUrl": "server1:5551"
   
   // ? Correct  
   "BaseUrl": "http://server1"
   ```

2. **Missing Configuration Section**
   ```bash
   # Check if configuration is loaded
   curl http://your-app/api/status/config
   ```

3. **Network Connectivity Issues**
   ```bash
   # Test from monitoring server
   telnet server1 5551
   telnet server2 5551
   ```

### Error Messages and Solutions

| Error | Solution |
|-------|----------|
| "Configuration not found" | Check appsettings.json MultiServerConfiguration section |
| "Connection refused" | Verify server URLs and network connectivity |
| "Timeout" | Check HealthCheckSettings.TimeoutSeconds value |
| "Service unavailable" | Check if target services are running |

## Best Practices

### 1. Configuration Management
- Use environment-specific configuration files
- Store sensitive URLs in Azure Key Vault or similar
- Use environment variables for dynamic configuration

### 2. Monitoring
- Set up alerts based on API responses
- Monitor the monitoring server itself
- Implement backup monitoring solutions

### 3. Load Balancer Integration
- Configure load balancer health checks to use this dashboard
- Set appropriate health check intervals
- Implement graceful degradation for single server failures

### 4. Security
- Restrict dashboard access to internal networks
- Use HTTPS for production deployments
- Implement authentication if exposing externally

## Integration Examples

### Load Balancer Health Check
```nginx
# Nginx upstream configuration
upstream backend {
    server 10.198.129.31:5551 max_fails=3 fail_timeout=30s;
    server 10.198.129.32:5551 max_fails=3 fail_timeout=30s;
}

# Health check configuration
location /health {
    proxy_pass http://health-monitor/api/status/multi-server;
}
```

### Azure Application Gateway
```json
{
  "healthProbe": {
    "protocol": "Http",
    "path": "/api/status/multi-server",
    "interval": 30,
    "timeout": 30,
    "unhealthyThreshold": 3
  }
}
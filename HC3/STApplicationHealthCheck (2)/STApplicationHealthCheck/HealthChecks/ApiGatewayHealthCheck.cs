using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace STApplicationHealthCheck.HealthChecks
{
    public class ApiGatewayHealthCheck : IHealthCheck
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ApiGatewayHealthCheck> _logger;
        
        // Multiple endpoints to try for API Gateway
        private readonly string[] _gatewayEndpoints = new[]
        {
            "http://localhost:5551/health",
            "http://localhost:5551/api/health", 
            "http://localhost:5551",
            "http://localhost:56927/health", // IIS Express port
            "http://localhost:56927/api/health"
        };

        public ApiGatewayHealthCheck(HttpClient httpClient, ILogger<ApiGatewayHealthCheck> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            var healthCheckData = new Dictionary<string, object>();
            var attempts = new List<object>();
            
            foreach (var endpoint in _gatewayEndpoints)
            {
                try
                {
                    _logger.LogInformation("Checking API Gateway endpoint: {Endpoint}", endpoint);
                    
                    var stopwatch = System.Diagnostics.Stopwatch.StartNew();
                    var response = await _httpClient.GetAsync(endpoint, cancellationToken);
                    stopwatch.Stop();
                    
                    var attemptResult = new
                    {
                        Endpoint = endpoint,
                        StatusCode = (int)response.StatusCode,
                        IsSuccess = response.IsSuccessStatusCode,
                        ResponseTime = stopwatch.ElapsedMilliseconds,
                        ContentLength = response.Content.Headers.ContentLength ?? 0,
                        Timestamp = DateTime.UtcNow
                    };
                    
                    attempts.Add(attemptResult);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        healthCheckData.Add("successful_endpoint", endpoint);
                        healthCheckData.Add("status_code", (int)response.StatusCode);
                        healthCheckData.Add("response_time_ms", stopwatch.ElapsedMilliseconds);
                        healthCheckData.Add("attempts", attempts);
                        healthCheckData.Add("gateway_available", true);
                        
                        _logger.LogInformation("API Gateway is healthy via endpoint: {Endpoint}", endpoint);
                        return HealthCheckResult.Healthy($"API Gateway is reachable via {endpoint}", healthCheckData);
                    }
                }
                catch (HttpRequestException ex)
                {
                    _logger.LogWarning("HTTP error accessing API Gateway endpoint {Endpoint}: {Error}", endpoint, ex.Message);
                    attempts.Add(new
                    {
                        Endpoint = endpoint,
                        Error = ex.Message,
                        ErrorType = "HttpRequestException",
                        Timestamp = DateTime.UtcNow
                    });
                }
                catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
                {
                    _logger.LogWarning("Timeout accessing API Gateway endpoint {Endpoint}", endpoint);
                    attempts.Add(new
                    {
                        Endpoint = endpoint,
                        Error = "Request timeout",
                        ErrorType = "TimeoutException", 
                        Timestamp = DateTime.UtcNow
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Error accessing API Gateway endpoint {Endpoint}: {Error}", endpoint, ex.Message);
                    attempts.Add(new
                    {
                        Endpoint = endpoint,
                        Error = ex.Message,
                        ErrorType = ex.GetType().Name,
                        Timestamp = DateTime.UtcNow
                    });
                }
                
                // Small delay between attempts
                await Task.Delay(100, cancellationToken);
            }
            
            // If we get here, all endpoints failed
            healthCheckData.Add("attempts", attempts);
            healthCheckData.Add("gateway_available", false);
            healthCheckData.Add("total_endpoints_tried", _gatewayEndpoints.Length);
            
            _logger.LogError("API Gateway is unreachable on all tested endpoints");
            
            return HealthCheckResult.Unhealthy(
                "API Gateway is unreachable on all tested endpoints. Check if the API Gateway service is running.", 
                data: healthCheckData);
        }
    }
}
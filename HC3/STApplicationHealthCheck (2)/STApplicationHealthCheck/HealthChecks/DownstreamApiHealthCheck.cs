using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Net.Http;

namespace STApplicationHealthCheck.HealthChecks
{
    public class DownstreamApiHealthCheck : IHealthCheck
    {
        private readonly HttpClient _httpClient;
        private readonly string _url;
        private readonly string _serviceName;

        public DownstreamApiHealthCheck(HttpClient httpClient, string url, string serviceName)
        {
            _httpClient = httpClient;
            _url = url;
            _serviceName = serviceName;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.GetAsync(_url, cancellationToken);
                
                if (response.IsSuccessStatusCode)
                {
                    return HealthCheckResult.Healthy($"{_serviceName} is healthy", new Dictionary<string, object>
                    {
                        { "service", _serviceName },
                        { "url", _url },
                        { "status_code", (int)response.StatusCode },
                        { "response_time", DateTimeOffset.UtcNow }
                    });
                }
                else
                {
                    return HealthCheckResult.Unhealthy($"{_serviceName} returned status code {response.StatusCode}", 
                        data: new Dictionary<string, object>
                        {
                            { "service", _serviceName },
                            { "url", _url },
                            { "status_code", (int)response.StatusCode },
                            { "response_time", DateTimeOffset.UtcNow }
                        });
                }
            }
            catch (HttpRequestException ex)
            {
                return HealthCheckResult.Unhealthy($"{_serviceName} is unreachable: {ex.Message}", ex, 
                    new Dictionary<string, object>
                    {
                        { "service", _serviceName },
                        { "url", _url },
                        { "error", ex.Message },
                        { "response_time", DateTimeOffset.UtcNow }
                    });
            }
            catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
            {
                return HealthCheckResult.Unhealthy($"{_serviceName} health check timed out", ex,
                    new Dictionary<string, object>
                    {
                        { "service", _serviceName },
                        { "url", _url },
                        { "error", "Timeout" },
                        { "response_time", DateTimeOffset.UtcNow }
                    });
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy($"{_serviceName} health check failed: {ex.Message}", ex,
                    new Dictionary<string, object>
                    {
                        { "service", _serviceName },
                        { "url", _url },
                        { "error", ex.Message },
                        { "response_time", DateTimeOffset.UtcNow }
                    });
            }
        }
    }
}
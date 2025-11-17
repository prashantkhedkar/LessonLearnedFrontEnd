using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using STApplicationHealthCheck.Configuration;
using System.Text.Json;

namespace STApplicationHealthCheck.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatusController : ControllerBase
    {
        private readonly HealthCheckConfiguration _healthCheckConfig;

        public StatusController(IOptions<HealthCheckConfiguration> healthCheckConfig)
        {
            _healthCheckConfig = healthCheckConfig.Value;
        }

        [HttpGet("services")]
        public IActionResult GetServices()
        {
            var services = _healthCheckConfig.Services.Select(kvp => new
            {
                Name = kvp.Key,
                Url = kvp.Value,
                Port = ExtractPort(kvp.Value),
                Type = kvp.Key == "ApiGateway" ? "Gateway" : "Microservice"
            });

            return Ok(services);
        }

        [HttpGet("external-apis")]
        public IActionResult GetExternalApis()
        {
            var externalApis = _healthCheckConfig.ExternalApis.Select(kvp => new
            {
                Name = kvp.Key,
                Url = kvp.Value,
                Type = "ExternalAPI"
            });

            return Ok(externalApis);
        }

        // Debug test endpoint
        [HttpGet("debug-test")]
        public IActionResult DebugTest()
        {
            Console.WriteLine("[DEBUG] Debug test endpoint called");
            System.Diagnostics.Debug.WriteLine("[DEBUG] Debug test endpoint called via Debug.WriteLine");
            
            return Ok(new
            {
                Message = "Debug test successful",
                Timestamp = DateTime.UtcNow,
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
                IsDebuggerAttached = System.Diagnostics.Debugger.IsAttached,
                ProcessId = Environment.ProcessId
            });
        }

        // Test endpoint to inspect raw health check response
        [HttpGet("debug-auth-health")]
        public async Task<IActionResult> DebugAuthHealth()
        {
            try
            {
                using HttpClient client = new HttpClient();
                client.Timeout = TimeSpan.FromSeconds(60);

                var authUrl = _healthCheckConfig.Services.GetValueOrDefault("AuthenticationApiService", "http://localhost:5209/health");
                HttpResponseMessage response = await client.GetAsync(authUrl);
                string content = await response.Content.ReadAsStringAsync();

                return Ok(new
                {
                    StatusCode = (int)response.StatusCode,
                    IsSuccessStatusCode = response.IsSuccessStatusCode,
                    RawContent = content,
                    ContentLength = content.Length,
                    Headers = response.Headers.ToDictionary(h => h.Key, h => string.Join(", ", h.Value))
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    Error = ex.Message,
                    ErrorType = ex.GetType().Name
                });
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> CheckAllServices()
        {
            // Debug: Method entry
            Console.WriteLine($"[DEBUG] CheckAllServices() started at {DateTime.UtcNow}");
            System.Diagnostics.Debug.WriteLine($"[DEBUG] CheckAllServices() started at {DateTime.UtcNow}");
            
            List<Task<object>> tasks = new List<Task<object>>();

            // Debug: Show services being checked
            Console.WriteLine($"[DEBUG] Services to check: {_healthCheckConfig.Services.Count}");
            foreach (var service in _healthCheckConfig.Services)
            {
                Console.WriteLine($"[DEBUG] - {service.Key}: {service.Value}");
            }

            foreach (KeyValuePair<string, string> kvp in _healthCheckConfig.Services)
            {
                string serviceType = kvp.Key == "ApiGateway" ? "Gateway" : "Microservice";
                Console.WriteLine($"[DEBUG] Adding task for {kvp.Key} ({serviceType})");
                tasks.Add(CheckServiceAsync(kvp.Key, kvp.Value, serviceType));
            }

            Console.WriteLine($"[DEBUG] Starting parallel execution of {tasks.Count} tasks");
            
            try
            {
                object[] results = await Task.WhenAll(tasks);
                Console.WriteLine($"[DEBUG] All tasks completed. Results count: {results.Length}");

                // Debug: Show results summary
                foreach (var result in results)
                {
                    var dynamicResult = (dynamic)result;
                    Console.WriteLine($"[DEBUG] {dynamicResult.ServiceName}: {dynamicResult.Status} (HTTP {dynamicResult.StatusCode}) - {dynamicResult.ResponseTime}ms");
                }

                var summary = new
                {
                    TotalServices = results.Length,
                    HealthyServices = results.Count(r => ((dynamic)r).IsHealthy == true),
                    UnhealthyServices = results.Count(r => ((dynamic)r).IsHealthy == false),
                    CheckedAt = DateTime.UtcNow,
                    Services = results
                };

                bool allHealthy = results.All(r => ((dynamic)r).IsHealthy == true);
                
                Console.WriteLine($"[DEBUG] Summary - Total: {summary.TotalServices}, Healthy: {summary.HealthyServices}, Unhealthy: {summary.UnhealthyServices}");
                Console.WriteLine($"[DEBUG] All services healthy: {allHealthy}");
                Console.WriteLine($"[DEBUG] CheckAllServices() completed at {DateTime.UtcNow}");
                
                return allHealthy ? Ok(summary) : StatusCode(503, summary);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DEBUG ERROR] Exception in CheckAllServices: {ex.Message}");
                Console.WriteLine($"[DEBUG ERROR] Stack trace: {ex.StackTrace}");
                System.Diagnostics.Debug.WriteLine($"[DEBUG ERROR] Exception: {ex}");
                
                return StatusCode(500, new
                {
                    Error = ex.Message,
                    StackTrace = ex.StackTrace,
                    CheckedAt = DateTime.UtcNow,
                    TotalServices = _healthCheckConfig.Services.Count,
                    HealthyServices = 0,
                    UnhealthyServices = 0,
                    Services = new object[0]
                });
            }
        }

        [HttpGet("all-with-external")]
        public async Task<IActionResult> CheckAllServicesAndExternalApis()
        {
            List<Task<object>> tasks = new List<Task<object>>();

            foreach (KeyValuePair<string, string> kvp in _healthCheckConfig.Services)
            {
                string serviceType = kvp.Key == "ApiGateway" ? "Gateway" : "Microservice";
                tasks.Add(CheckServiceAsync(kvp.Key, kvp.Value, serviceType));
            }

            foreach (KeyValuePair<string, string> kvp in _healthCheckConfig.ExternalApis)
            {
                tasks.Add(CheckExternalApiAsync(kvp.Key, kvp.Value));
            }

            object[] results = await Task.WhenAll(tasks);

            object[] infrastructureServices = results.Where(r => ((dynamic)r).Type == "Gateway").ToArray();
            object[] microservices = results.Where(r => ((dynamic)r).Type == "Microservice").ToArray();
            object[] externalApis = results.Where(r => ((dynamic)r).Type == "ExternalAPI").ToArray();

            var summary = new
            {
                TotalServices = infrastructureServices.Length + microservices.Length,
                HealthyServices = infrastructureServices.Count(r => ((dynamic)r).IsHealthy == true) +
                                microservices.Count(r => ((dynamic)r).IsHealthy == true),
                UnhealthyServices = infrastructureServices.Count(r => ((dynamic)r).IsHealthy == false) +
                                   microservices.Count(r => ((dynamic)r).IsHealthy == false),
                TotalExternalApis = externalApis.Length,
                HealthyExternalApis = externalApis.Count(r => ((dynamic)r).IsHealthy == true),
                UnhealthyExternalApis = externalApis.Count(r => ((dynamic)r).IsHealthy == false),
                CheckedAt = DateTime.UtcNow,
                Gateway = infrastructureServices,
                Microservices = microservices,
                ExternalAPIs = externalApis
            };

            bool allHealthy = results.All(r => ((dynamic)r).IsHealthy == true);
            return allHealthy ? Ok(summary) : StatusCode(503, summary);
        }

        [HttpGet("external-only")]
        public async Task<IActionResult> CheckExternalApisOnly()
        {
            try
            {
                using HttpClient client = new HttpClient();
                client.Timeout = TimeSpan.FromSeconds(30);

                try
                {
                    var integrationServiceUrl = _healthCheckConfig.Services.GetValueOrDefault("IntegrationApiService", "http://localhost:5005");
                    var externalHealthUrl = $"{integrationServiceUrl.TrimEnd('/', ' ')}/api/ExternalHealth/all-external".Replace("/health", "");
                    
                    HttpResponseMessage response = await client.GetAsync(externalHealthUrl);
                    string content = await response.Content.ReadAsStringAsync();

                    if (response.IsSuccessStatusCode)
                    {
                        object? externalApiStatus = JsonSerializer.Deserialize<object>(content);
                        return Ok(externalApiStatus);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"IntegrationApiService not available: {ex.Message}");
                }

                List<Task<object>> tasks = new List<Task<object>>();
                foreach (KeyValuePair<string, string> kvp in _healthCheckConfig.ExternalApis)
                {
                    tasks.Add(CheckExternalApiAsync(kvp.Key, kvp.Value));
                }

                object[] results = await Task.WhenAll(tasks);

                int healthyCount = results.Count(r => ((dynamic)r).IsHealthy == true);
                int totalCount = results.Length;

                var fallbackResponse = new
                {
                    TotalAPIs = totalCount,
                    HealthyAPIs = healthyCount,
                    UnhealthyAPIs = totalCount - healthyCount,
                    HealthPercentage = totalCount > 0 ? (healthyCount * 100.0 / totalCount) : 0,
                    CheckedAt = DateTime.UtcNow,
                    APIs = results.Select(r => new
                    {
                        ApiName = ((dynamic)r).ServiceName,
                        IsHealthy = ((dynamic)r).IsHealthy,
                        StatusCode = ((dynamic)r).StatusCode,
                        ResponseTime = ((dynamic)r).ResponseTime,
                        Url = ((dynamic)r).Url,
                        Error = ((dynamic)r).Error,
                        HasAuthentication = false
                    }),
                    Note = "Fallback response - IntegrationApiService may not be running"
                };

                return Ok(fallbackResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(503, new
                {
                    Error = ex.Message,
                    CheckedAt = DateTime.UtcNow,
                    TotalAPIs = 0,
                    HealthyAPIs = 0,
                    UnhealthyAPIs = 0,
                    HealthPercentage = 0,
                    APIs = new object[0]
                });
            }
        }

        private async Task<object> CheckServiceAsync(string serviceName, string serviceUrl, string type)
        {
            Console.WriteLine($"[DEBUG] CheckServiceAsync started for {serviceName} at {serviceUrl}");
            
            if (serviceName == "ApiGateway")
            {
                Console.WriteLine($"[DEBUG] Delegating to CheckApiGatewayAsync for {serviceName}");
                return await CheckApiGatewayAsync();
            }

            try
            {
                using HttpClient client = new HttpClient();
                client.Timeout = TimeSpan.FromSeconds(60);

                Console.WriteLine($"[DEBUG] Making HTTP request to {serviceUrl}");
                System.Diagnostics.Stopwatch stopwatch = System.Diagnostics.Stopwatch.StartNew();
                HttpResponseMessage response = await client.GetAsync(serviceUrl);
                stopwatch.Stop();
                
                Console.WriteLine($"[DEBUG] {serviceName} responded with {response.StatusCode} in {stopwatch.ElapsedMilliseconds}ms");

                string content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[DEBUG] {serviceName} response content length: {content.Length}");
                string? detailedError = null;

                // Always try to parse the response content, regardless of status code
                try
                {
                    // First, let's see if it's JSON
                    using JsonDocument document = JsonDocument.Parse(content);
                    JsonElement root = document.RootElement;

                    // Check for ASP.NET Core health check format
                    if (root.TryGetProperty("info", out JsonElement infoArray) && infoArray.ValueKind == JsonValueKind.Array)
                    {
                        Console.WriteLine($"[DEBUG] {serviceName} has health check info array with {infoArray.GetArrayLength()} items");
                        foreach (JsonElement entry in infoArray.EnumerateArray())
                        {
                            if (entry.TryGetProperty("key", out JsonElement keyElement))
                            {
                                string? key = keyElement.GetString();
                                if (entry.TryGetProperty("status", out JsonElement status) &&
                                    status.GetString() != "Healthy")
                                {
                                    Console.WriteLine($"[DEBUG] {serviceName} unhealthy component found: {key} = {status.GetString()}");
                                    if (entry.TryGetProperty("description", out JsonElement description))
                                    {
                                        detailedError = $"{key}: {description.GetString()}";
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    // If no error found in info array, check the main status and description
                    if (string.IsNullOrEmpty(detailedError))
                    {
                        if (root.TryGetProperty("status", out JsonElement mainStatus))
                        {
                            string? statusText = mainStatus.GetString();
                            Console.WriteLine($"[DEBUG] {serviceName} main status: {statusText}");
                            if (statusText != "Healthy")
                            {
                                // Look for any description at root level
                                if (root.TryGetProperty("description", out JsonElement desc))
                                {
                                    detailedError = desc.GetString();
                                }
                                else
                                {
                                    detailedError = $"Service status: {statusText}";
                                }
                            }
                        }
                    }
                }
                catch (JsonException jsonEx)
                {
                    Console.WriteLine($"[DEBUG] {serviceName} response is not valid JSON: {jsonEx.Message}");
                    // If it's not JSON, use the raw content as error
                    if (!response.IsSuccessStatusCode)
                    {
                        detailedError = content.Length > 200 ? content.Substring(0, 200) + "..." : content;
                    }
                }

                // If still no specific error and the service is unhealthy, use the raw content
                if (string.IsNullOrEmpty(detailedError) && !response.IsSuccessStatusCode)
                {
                    detailedError = string.IsNullOrWhiteSpace(content) ?
                        $"HTTP {response.StatusCode} - No additional error details" :
                        (content.Length > 200 ? content.Substring(0, 200) + "..." : content);
                }

                var result = new
                {
                    ServiceName = serviceName,
                    Url = serviceUrl,
                    StatusCode = (int)response.StatusCode,
                    IsHealthy = response.IsSuccessStatusCode,
                    ResponseTime = stopwatch.ElapsedMilliseconds,
                    Status = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy",
                    Type = type,
                    Error = detailedError,
                    RawResponse = content.Length > 1000 ? content.Substring(0, 1000) + "... [truncated]" : content // For debugging
                };
                
                Console.WriteLine($"[DEBUG] {serviceName} check completed: {result.Status}");
                return result;
            }
            catch (TaskCanceledException tcEx)
            {
                Console.WriteLine($"[DEBUG] {serviceName} timed out: {tcEx.Message}");
                return new
                {
                    ServiceName = serviceName,
                    Url = serviceUrl,
                    StatusCode = 0,
                    IsHealthy = false,
                    ResponseTime = 0L,
                    Status = "Timeout",
                    Error = $"Health check timeout after 60 seconds. For {serviceName}, this likely indicates database connection issues. Check SQL Server connection: {GetConnectionStringInfo(serviceName)}",
                    Type = type
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DEBUG] {serviceName} exception: {ex.GetType().Name} - {ex.Message}");
                return new
                {
                    ServiceName = serviceName,
                    Url = serviceUrl,
                    StatusCode = 0,
                    IsHealthy = false,
                    ResponseTime = 0L,
                    Status = "Unreachable",
                    Error = ex.Message,
                    Type = type
                };
            }
        }

        private string GetConnectionStringInfo(string serviceName)
        {
            if (serviceName == "AuthenticationApiService")
            {
                return "Server=LAD0061851\\SQLEXPRESS;Database=JointPortal_QA";
            }
            return "Database connection may be required";
        }

        private async Task<object> CheckApiGatewayAsync()
        {
            foreach (string endpoint in _healthCheckConfig.ApiGatewayEndpoints)
            {
                try
                {
                    using HttpClient client = new HttpClient();
                    client.Timeout = TimeSpan.FromSeconds(15);

                    System.Diagnostics.Stopwatch stopwatch = System.Diagnostics.Stopwatch.StartNew();
                    HttpResponseMessage response = await client.GetAsync(endpoint);
                    stopwatch.Stop();

                    if (response.IsSuccessStatusCode)
                    {
                        return new
                        {
                            ServiceName = "ApiGateway",
                            Url = endpoint,
                            StatusCode = (int)response.StatusCode,
                            IsHealthy = true,
                            ResponseTime = stopwatch.ElapsedMilliseconds,
                            Status = "Healthy",
                            Type = "Gateway",
                            Note = endpoint != _healthCheckConfig.ApiGatewayEndpoints[0] ? "Connected via fallback endpoint" : null
                        };
                    }
                }
                catch (Exception)
                {
                    continue;
                }
            }

            return new
            {
                ServiceName = "ApiGateway",
                Url = "Multiple endpoints tested",
                StatusCode = 0,
                IsHealthy = false,
                ResponseTime = 0L,
                Status = "Unreachable",
                Error = "All API Gateway endpoints unreachable",
                Type = "Gateway",
                TestedEndpoints = _healthCheckConfig.ApiGatewayEndpoints
            };
        }

        private async Task<object> CheckExternalApiAsync(string apiName, string apiUrl)
        {
            try
            {
                using HttpClient client = new HttpClient();
                client.Timeout = TimeSpan.FromSeconds(30);

                System.Diagnostics.Stopwatch stopwatch = System.Diagnostics.Stopwatch.StartNew();
                HttpResponseMessage response = await client.GetAsync(apiUrl);
                stopwatch.Stop();

                string content = await response.Content.ReadAsStringAsync();
                object? apiResult = null;

                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        apiResult = JsonSerializer.Deserialize<object>(content);
                    }
                    catch
                    {
                        apiResult = content;
                    }
                }

                return new
                {
                    ServiceName = apiName,
                    Url = apiUrl,
                    StatusCode = (int)response.StatusCode,
                    IsHealthy = response.IsSuccessStatusCode,
                    ResponseTime = stopwatch.ElapsedMilliseconds,
                    Status = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy",
                    Type = "ExternalAPI",
                    Details = apiResult,
                    Error = response.IsSuccessStatusCode ? null : content
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    ServiceName = apiName,
                    Url = apiUrl,
                    StatusCode = 0,
                    IsHealthy = false,
                    ResponseTime = 0L,
                    Status = "Unreachable",
                    Error = ex.Message,
                    Type = "ExternalAPI"
                };
            }
        }

        private static int ExtractPort(string url)
        {
            try
            {
                Uri uri = new Uri(url);
                return uri.Port;
            }
            catch
            {
                return 0;
            }
        }
    }
}
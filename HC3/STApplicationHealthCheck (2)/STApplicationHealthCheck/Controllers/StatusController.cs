using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace STApplicationHealthCheck.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatusController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public StatusController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // Get Server URLs from configuration or fallback to hardcoded values
        private Dictionary<string, string> GetServer1ServiceUrls()
        {
            var baseUrl = _configuration["MultiServerConfiguration:Server1:BaseUrl"] ?? "http://server1";
            var services = _configuration.GetSection("MultiServerConfiguration:Server1:Services");
            
            if (services.GetChildren().Any())
            {
                return services.GetChildren().ToDictionary(
                    x => x.Key,
                    x => $"{baseUrl}{x.Value}"
                );
            }

            // Fallback to hardcoded values
            return new Dictionary<string, string>
            {
                { "ApiGateway", "http://server1:5551/health" },
                { "AuthenticationApiService", "http://server1:5209/health" },
                { "ProjectApiService", "http://server1:5059/health" },
                { "WatiraApiService", "http://server1:5010/health" },
                { "MeetingCalendarApiService", "http://server1:5015/health" },
                { "HRAdminApiService", "http://server1:5002/health" },
                { "AnnouncementApiService", "http://server1:5136/health" },
                { "IntegrationApiService", "http://server1:5005/health" },
                { "NotificationApiService", "http://server1:5100/health" },
                { "DepartmentWebsiteApiService", "http://server1:5075/health" },
            };
        }

        private Dictionary<string, string> GetServer2ServiceUrls()
        {
            var baseUrl = _configuration["MultiServerConfiguration:Server2:BaseUrl"] ?? "http://server2";
            var services = _configuration.GetSection("MultiServerConfiguration:Server2:Services");
            
            if (services.GetChildren().Any())
            {
                return services.GetChildren().ToDictionary(
                    x => x.Key,
                    x => $"{baseUrl}{x.Value}"
                );
            }

            // Fallback to hardcoded values
            return new Dictionary<string, string>
            {
                { "ApiGateway", "http://server2:5551/health" },
                { "AuthenticationApiService", "http://server2:5209/health" },
                { "ProjectApiService", "http://server2:5059/health" },
                { "WatiraApiService", "http://server2:5010/health" },
                { "MeetingCalendarApiService", "http://server2:5015/health" },
                { "HRAdminApiService", "http://server2:5002/health" },
                { "AnnouncementApiService", "http://server2:5136/health" },
                { "IntegrationApiService", "http://server2:5005/health" },
                { "NotificationApiService", "http://server2:5100/health" },
                { "DepartmentWebsiteApiService", "http://server2:5075/health" },
            };
        }

        // Development/Local Configuration (for backward compatibility)
        private static readonly Dictionary<string, string> ServiceUrls = new()
        {
            { "ApiGateway", "http://localhost:5551/health" },
            { "AuthenticationApiService", "http://localhost:5209/health" },
            { "ProjectApiService", "http://localhost:5059/health" },
            { "WatiraApiService", "http://localhost:5010/health" },
            { "MeetingCalendarApiService", "http://localhost:5015/health" },
            { "HRAdminApiService", "http://localhost:5002/health" },
            { "AnnouncementApiService", "http://localhost:5136/health" },
            { "IntegrationApiService", "http://localhost:5005/health" },
            { "NotificationApiService", "http://localhost:5100/health" },
            { "DepartmentWebsiteApiService", "http://localhost:5075/health" },
            //{ "SurveyApiService", "http://localhost:5006/health" }
        };

        private static readonly string[] ApiGatewayEndpoints = new[]
        {
            "http://localhost:5551/health",
            "http://localhost:5551/api/health",
            "http://localhost:5551",
            "http://localhost:56927/health",
            "http://localhost:56927"
        };

        private static readonly Dictionary<string, string> ExternalApiUrls = new()
        {
            { "MawjoodAPI", "http://localhost:5005/api/ExternalHealth/mawjood" },
            { "TarasulAPI", "http://localhost:5005/api/ExternalHealth/tarasul" },
            { "MawardAPI", "http://localhost:5005/api/ExternalHealth/maward" }
        };

        // Configuration endpoint to get current multi-server setup
        [HttpGet("config")]
        public IActionResult GetConfiguration()
        {
            var isMultiServerEnabled = _configuration.GetValue<bool>("HealthCheckSettings:EnableMultiServerMode", false);
            var server1Name = _configuration["MultiServerConfiguration:Server1:Name"] ?? "Production Server 1";
            var server2Name = _configuration["MultiServerConfiguration:Server2:Name"] ?? "Production Server 2";

            return Ok(new
            {
                MultiServerEnabled = isMultiServerEnabled,
                Server1 = new
                {
                    Name = server1Name,
                    BaseUrl = _configuration["MultiServerConfiguration:Server1:BaseUrl"],
                    ServiceCount = GetServer1ServiceUrls().Count
                },
                Server2 = new
                {
                    Name = server2Name,
                    BaseUrl = _configuration["MultiServerConfiguration:Server2:BaseUrl"],
                    ServiceCount = GetServer2ServiceUrls().Count
                },
                Settings = new
                {
                    TimeoutSeconds = _configuration.GetValue<int>("HealthCheckSettings:TimeoutSeconds", 60),
                    RefreshInterval = _configuration.GetValue<int>("HealthCheckSettings:RefreshIntervalSeconds", 30)
                }
            });
        }

        // New Multi-Server Health Check Endpoint
        [HttpGet("multi-server")]
        public async Task<IActionResult> CheckMultiServerHealth()
        {
            Console.WriteLine($"[DEBUG] CheckMultiServerHealth() started at {DateTime.UtcNow}");

            var server1Urls = GetServer1ServiceUrls();
            var server2Urls = GetServer2ServiceUrls();

            var server1Task = CheckServerServicesAsync("Server1", server1Urls);
            var server2Task = CheckServerServicesAsync("Server2", server2Urls);

            var serverResults = await Task.WhenAll(server1Task, server2Task);

            var server1Result = serverResults[0];
            var server2Result = serverResults[1];

            // Calculate overall statistics
            var totalServices = server1Result.TotalServices + server2Result.TotalServices;
            var healthyServices = server1Result.HealthyServices + server2Result.HealthyServices;
            var unhealthyServices = server1Result.UnhealthyServices + server2Result.UnhealthyServices;

            var summary = new
            {
                Mode = "MultiServer",
                TotalServers = 2,
                TotalServices = totalServices,
                HealthyServices = healthyServices,
                UnhealthyServices = unhealthyServices,
                OverallHealthy = unhealthyServices == 0,
                CheckedAt = DateTime.UtcNow,
                Server1 = server1Result,
                Server2 = server2Result,
                HealthSummary = new
                {
                    Server1Health = $"{server1Result.HealthyServices}/{server1Result.TotalServices}",
                    Server2Health = $"{server2Result.HealthyServices}/{server2Result.TotalServices}",
                    OverallHealth = $"{healthyServices}/{totalServices}"
                },
                Configuration = new
                {
                    Server1Name = _configuration["MultiServerConfiguration:Server1:Name"] ?? "Production Server 1",
                    Server2Name = _configuration["MultiServerConfiguration:Server2:Name"] ?? "Production Server 2",
                    TimeoutSeconds = _configuration.GetValue<int>("HealthCheckSettings:TimeoutSeconds", 60)
                }
            };

            bool allHealthy = server1Result.AllHealthy && server2Result.AllHealthy;
            Console.WriteLine($"[DEBUG] Multi-server check completed. Overall health: {allHealthy}");

            return allHealthy ? Ok(summary) : StatusCode(503, summary);
        }

        // Helper method to check services on a specific server
        private async Task<ServerHealthResult> CheckServerServicesAsync(string serverName, Dictionary<string, string> serviceUrls)
        {
            Console.WriteLine($"[DEBUG] Checking services for {serverName}");
            
            List<Task<object>> tasks = new List<Task<object>>();

            foreach (KeyValuePair<string, string> kvp in serviceUrls)
            {
                string serviceType = kvp.Key == "ApiGateway" ? "Gateway" : "Microservice";
                tasks.Add(CheckServiceAsync(kvp.Key, kvp.Value, serviceType, serverName));
            }

            try
            {
                object[] results = await Task.WhenAll(tasks);
                var services = results.ToArray();
                var healthyCount = services.Count(r => ((dynamic)r).IsHealthy == true);
                var unhealthyCount = services.Count(r => ((dynamic)r).IsHealthy == false);

                return new ServerHealthResult
                {
                    ServerName = serverName,
                    TotalServices = services.Length,
                    HealthyServices = healthyCount,
                    UnhealthyServices = unhealthyCount,
                    AllHealthy = unhealthyCount == 0,
                    Services = services,
                    CheckedAt = DateTime.UtcNow,
                    AverageResponseTime = CalculateAverageResponseTime(services)
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DEBUG ERROR] Exception checking {serverName}: {ex.Message}");
                return new ServerHealthResult
                {
                    ServerName = serverName,
                    TotalServices = serviceUrls.Count,
                    HealthyServices = 0,
                    UnhealthyServices = serviceUrls.Count,
                    AllHealthy = false,
                    Services = new object[0],
                    CheckedAt = DateTime.UtcNow,
                    Error = ex.Message
                };
            }
        }

        private double CalculateAverageResponseTime(object[] services)
        {
            var validTimes = services
                .Where(s => ((dynamic)s).ResponseTime != null && ((dynamic)s).ResponseTime > 0)
                .Select(s => (long)((dynamic)s).ResponseTime)
                .ToList();

            return validTimes.Count > 0 ? validTimes.Average() : 0;
        }

        // Updated original endpoints to include mode information
        [HttpGet("services")]
        public IActionResult GetServices()
        {
            var services = ServiceUrls.Select(kvp => new
            {
                Name = kvp.Key,
                Url = kvp.Value,
                Port = ExtractPort(kvp.Value),
                Type = kvp.Key == "ApiGateway" ? "Gateway" : "Microservice"
            });

            return Ok(new { Mode = "SingleServer", Services = services });
        }

        [HttpGet("external-apis")]
        public IActionResult GetExternalApis()
        {
            var externalApis = ExternalApiUrls.Select(kvp => new
            {
                Name = kvp.Key,
                Url = kvp.Value,
                Type = "ExternalAPI"
            });

            return Ok(new { Mode = "SingleServer", ExternalApis = externalApis });
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
                ProcessId = Environment.ProcessId,
                Mode = "SingleServer"
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

                HttpResponseMessage response = await client.GetAsync("http://localhost:5209/health");
                string content = await response.Content.ReadAsStringAsync();

                return Ok(new
                {
                    StatusCode = (int)response.StatusCode,
                    IsSuccessStatusCode = response.IsSuccessStatusCode,
                    RawContent = content,
                    ContentLength = content.Length,
                    Headers = response.Headers.ToDictionary(h => h.Key, h => string.Join(", ", h.Value)),
                    Mode = "SingleServer"
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    Error = ex.Message,
                    ErrorType = ex.GetType().Name,
                    Mode = "SingleServer"
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
            Console.WriteLine($"[DEBUG] Services to check: {ServiceUrls.Count}");
            foreach (var service in ServiceUrls)
            {
                Console.WriteLine($"[DEBUG] - {service.Key}: {service.Value}");
            }

            foreach (KeyValuePair<string, string> kvp in ServiceUrls)
            {
                string serviceType = kvp.Key == "ApiGateway" ? "Gateway" : "Microservice";
                Console.WriteLine($"[DEBUG] Adding task for {kvp.Key} ({serviceType})");
                tasks.Add(CheckServiceAsync(kvp.Key, kvp.Value, serviceType, "localhost"));
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
                    Mode = "SingleServer",
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
                    Mode = "SingleServer",
                    Error = ex.Message,
                    StackTrace = ex.StackTrace,
                    CheckedAt = DateTime.UtcNow,
                    TotalServices = ServiceUrls.Count,
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

            foreach (KeyValuePair<string, string> kvp in ServiceUrls)
            {
                string serviceType = kvp.Key == "ApiGateway" ? "Gateway" : "Microservice";
                tasks.Add(CheckServiceAsync(kvp.Key, kvp.Value, serviceType, "localhost"));
            }

            foreach (KeyValuePair<string, string> kvp in ExternalApiUrls)
            {
                tasks.Add(CheckExternalApiAsync(kvp.Key, kvp.Value));
            }

            object[] results = await Task.WhenAll(tasks);

            object[] infrastructureServices = results.Where(r => ((dynamic)r).Type == "Gateway").ToArray();
            object[] microservices = results.Where(r => ((dynamic)r).Type == "Microservice").ToArray();
            object[] externalApis = results.Where(r => ((dynamic)r).Type == "ExternalAPI").ToArray();

            var summary = new
            {
                Mode = "SingleServer",
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
                    HttpResponseMessage response = await client.GetAsync("http://localhost:5005/api/ExternalHealth/all-external");
                    string content = await response.Content.ReadAsStringAsync();

                    if (response.IsSuccessStatusCode)
                    {
                        object? externalApiStatus = JsonSerializer.Deserialize<object>(content);
                        return Ok(new { Mode = "SingleServer", Data = externalApiStatus });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"IntegrationApiService not available: {ex.Message}");
                }

                List<Task<object>> tasks = new List<Task<object>>();
                foreach (KeyValuePair<string, string> kvp in ExternalApiUrls)
                {
                    tasks.Add(CheckExternalApiAsync(kvp.Key, kvp.Value));
                }

                object[] results = await Task.WhenAll(tasks);

                int healthyCount = results.Count(r => ((dynamic)r).IsHealthy == true);
                int totalCount = results.Length;

                var fallbackResponse = new
                {
                    Mode = "SingleServer",
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
                    Mode = "SingleServer",
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

        private async Task<object> CheckServiceAsync(string serviceName, string serviceUrl, string type, string serverName = "localhost")
        {
            Console.WriteLine($"[DEBUG] CheckServiceAsync started for {serviceName} at {serviceUrl} on {serverName}");
            
            if (serviceName == "ApiGateway")
            {
                Console.WriteLine($"[DEBUG] Delegating to CheckApiGatewayAsync for {serviceName}");
                return await CheckApiGatewayAsync(serverName);
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
                    Server = serverName,
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
                    Type = type,
                    Server = serverName
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
                    Type = type,
                    Server = serverName
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

        private async Task<object> CheckApiGatewayAsync(string serverName = "localhost")
        {
            foreach (string endpoint in ApiGatewayEndpoints)
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
                            Server = serverName,
                            Note = endpoint != ApiGatewayEndpoints[0] ? "Connected via fallback endpoint" : null
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
                Server = serverName,
                TestedEndpoints = ApiGatewayEndpoints
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

    // Helper class for server health results
    public class ServerHealthResult
    {
        public string ServerName { get; set; } = string.Empty;
        public int TotalServices { get; set; }
        public int HealthyServices { get; set; }
        public int UnhealthyServices { get; set; }
        public bool AllHealthy { get; set; }
        public object[] Services { get; set; } = Array.Empty<object>();
        public DateTime CheckedAt { get; set; }
        public double AverageResponseTime { get; set; }
        public string? Error { get; set; }
    }
}
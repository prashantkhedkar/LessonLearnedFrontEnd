using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace STApplicationHealthCheck.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly HealthCheckService _healthCheckService;

        public HealthController(HealthCheckService healthCheckService)
        {
            _healthCheckService = healthCheckService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _healthCheckService.CheckHealthAsync();
            
            var response = new
            {
                Status = result.Status.ToString(),
                TotalDuration = result.TotalDuration.TotalMilliseconds,
                CheckedAt = DateTime.UtcNow,
                Entries = result.Entries.Select(e => new
                {
                    Name = e.Key,
                    Status = e.Value.Status.ToString(),
                    Description = e.Value.Description,
                    Duration = e.Value.Duration.TotalMilliseconds,
                    Tags = e.Value.Tags
                })
            };

            return result.Status == HealthStatus.Healthy 
                ? Ok(response) 
                : StatusCode(503, response);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var result = await _healthCheckService.CheckHealthAsync();
            
            var summary = new
            {
                Status = result.Status.ToString(),
                TotalServices = result.Entries.Count,
                HealthyServices = result.Entries.Count(e => e.Value.Status == HealthStatus.Healthy),
                UnhealthyServices = result.Entries.Count(e => e.Value.Status == HealthStatus.Unhealthy),
                DegradedServices = result.Entries.Count(e => e.Value.Status == HealthStatus.Degraded),
                TotalDuration = result.TotalDuration.TotalMilliseconds,
                CheckedAt = DateTime.UtcNow,
                Services = result.Entries.Select(e => new
                {
                    Name = e.Key,
                    Status = e.Value.Status.ToString(),
                    Tags = e.Value.Tags
                })
            };

            return Ok(summary);
        }

        [HttpGet("services")]
        public async Task<IActionResult> GetServices()
        {
            var result = await _healthCheckService.CheckHealthAsync();
            
            var services = result.Entries.Select(e => new
            {
                Name = e.Key,
                Status = e.Value.Status.ToString(),
                Description = e.Value.Description,
                Duration = e.Value.Duration.TotalMilliseconds,
                Tags = e.Value.Tags,
                Data = e.Value.Data
            });

            return Ok(services);
        }
    }
}
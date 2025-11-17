using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using STApplicationHealthCheck.HealthChecks;
using STApplicationHealthCheck.Configuration;
using System.Text.Json;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure HealthCheck settings
builder.Services.Configure<HealthCheckConfiguration>(
    builder.Configuration.GetSection(HealthCheckConfiguration.SectionName));

// Configure HttpClient for health checks
builder.Services.AddHttpClient<ApiGatewayHealthCheck>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
});

builder.Services.AddHttpClient();

// Get configuration for health checks
var healthCheckConfig = builder.Configuration
    .GetSection(HealthCheckConfiguration.SectionName)
    .Get<HealthCheckConfiguration>() ?? new HealthCheckConfiguration();

// Add Health Checks for all downstream APIs
var healthChecksBuilder = builder.Services.AddHealthChecks()
    .AddCheck<ApiGatewayHealthCheck>("ApiGateway",
        tags: new[] { "infrastructure", "gateway", "critical", "ready" });

foreach (var service in healthCheckConfig.Services)
{
    if (service.Key != "ApiGateway") // Skip ApiGateway as it uses custom health check
    {
        string[] tags = service.Key switch
        {
            "AuthenticationApiService" => new[] { "api", "authentication", "database", "ready" },
            "ProjectApiService" => new[] { "api", "project", "ready" },
            "WatiraApiService" => new[] { "api", "watira", "ready" },
            "MeetingCalendarApiService" => new[] { "api", "meeting", "ready" },
            "HRAdminApiService" => new[] { "api", "hr", "ready" },
            "AnnouncementApiService" => new[] { "api", "announcement", "ready" },
            "IntegrationApiService" => new[] { "api", "integration", "ready" },
            "NotificationApiService" => new[] { "api", "notification", "ready" },
            "DepartmentWebsiteApiService" => new[] { "api", "department", "ready" },
            "SurveyApiService" => new[] { "api", "survey", "ready" },
            _ => new[] { "api", "ready" }
        };

        healthChecksBuilder.AddCheck(service.Key, () => CheckServiceHealth(service.Value), tags: tags);
    }
}

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable static files
app.UseStaticFiles();

// Enable CORS
app.UseCors();

app.UseHttpsRedirection();

app.UseRouting();
app.UseAuthorization();

// Map Controllers
app.MapControllers();

// Map Health Check endpoints
app.MapHealthChecks("/health", new HealthCheckOptions()
{
    Predicate = _ => true,
    ResponseWriter = WriteResponse
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions()
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = WriteResponse
});

app.MapHealthChecks("/health/live", new HealthCheckOptions()
{
    Predicate = _ => true,
    ResponseWriter = WriteResponse
});

// Redirect routes
app.MapGet("/health-ui", async context =>
{
    context.Response.Redirect("/health-dashboard.html");
});

app.MapGet("/", async context =>
{
    context.Response.Redirect("/health-dashboard.html");
});

app.Run();

// Simplified health check method
static HealthCheckResult CheckServiceHealth(string url)
{
    try
    {
        using HttpClient client = new HttpClient();
        client.Timeout = TimeSpan.FromSeconds(60); // Extended timeout for database checks
        HttpResponseMessage response = client.GetAsync(url).Result;

        if (response.IsSuccessStatusCode)
        {
            return HealthCheckResult.Healthy($"Service at {url} is healthy");
        }
        else
        {
            return HealthCheckResult.Unhealthy($"Service at {url} returned HTTP {response.StatusCode}");
        }
    }
    catch (TaskCanceledException)
    {
        return HealthCheckResult.Unhealthy($"Service at {url} timed out after 60 seconds - likely database connection issue");
    }
    catch (Exception ex)
    {
        return HealthCheckResult.Unhealthy($"Service at {url} is unreachable: {ex.Message}");
    }
}

// Custom response writer for health check endpoints
static Task WriteResponse(HttpContext httpContext, HealthReport result)
{
    httpContext.Response.ContentType = "application/json";

    var response = new
    {
        Status = result.Status.ToString(),
        Duration = result.TotalDuration,
        Info = result.Entries.Select(e => new
        {
            Key = e.Key,
            Description = e.Value.Description,
            Status = e.Value.Status.ToString(),
            Duration = e.Value.Duration,
            Data = e.Value.Data
        })
    };

    return httpContext.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions { WriteIndented = true }));
}

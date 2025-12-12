using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using STApplicationHealthCheck.HealthChecks;
using System.Text.Json;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure HttpClient for health checks
builder.Services.AddHttpClient<ApiGatewayHealthCheck>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
});

builder.Services.AddHttpClient();

// Add Health Checks for all downstream APIs
builder.Services.AddHealthChecks()
    .AddCheck<ApiGatewayHealthCheck>("ApiGateway",
        tags: new[] { "infrastructure", "gateway", "critical", "ready" })
    .AddCheck("AuthenticationApiService", () => CheckServiceHealth("http://localhost:5209/health"),
        tags: new[] { "api", "authentication", "database", "ready" })
    .AddCheck("ProjectApiService", () => CheckServiceHealth("http://localhost:5059/health"),
        tags: new[] { "api", "project", "ready" })
    .AddCheck("WatiraApiService", () => CheckServiceHealth("http://localhost:5010/health"),
        tags: new[] { "api", "watira", "ready" })
    .AddCheck("MeetingCalendarApiService", () => CheckServiceHealth("http://localhost:5015/health"),
        tags: new[] { "api", "meeting", "ready" })
    .AddCheck("HRAdminApiService", () => CheckServiceHealth("http://localhost:5002/health"),
        tags: new[] { "api", "hr", "ready" })
    .AddCheck("AnnouncementApiService", () => CheckServiceHealth("http://localhost:5136/health"),
        tags: new[] { "api", "announcement", "ready" })
    .AddCheck("IntegrationApiService", () => CheckServiceHealth("http://localhost:5005/health"),
        tags: new[] { "api", "integration", "ready" })
    .AddCheck("NotificationApiService", () => CheckServiceHealth("http://localhost:5100/health"),
        tags: new[] { "api", "notification", "ready" })
    .AddCheck("DepartmentWebsiteApiService", () => CheckServiceHealth("http://localhost:5075/health"),
        tags: new[] { "api", "department", "ready" });
//.AddCheck("SurveyApiService", () => CheckServiceHealth("http://localhost:5006/health"), 
//    tags: new[] { "api", "survey", "ready" });

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

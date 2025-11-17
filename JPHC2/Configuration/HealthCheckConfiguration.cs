namespace STApplicationHealthCheck.Configuration
{
    public class HealthCheckConfiguration
    {
        public const string SectionName = "HealthCheck";
        
        public Dictionary<string, string> Services { get; set; } = new();
        public string[] ApiGatewayEndpoints { get; set; } = Array.Empty<string>();
        public Dictionary<string, string> ExternalApis { get; set; } = new();
    }
}
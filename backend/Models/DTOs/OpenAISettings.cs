namespace ArtifyMe.Models.DTOs;

public class OpenAISettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gpt-4o-mini"; // Cost-effective model
    public int MaxTokens { get; set; } = 500;
    public double Temperature { get; set; } = 0.8; // Higher creativity
    public double TopP { get; set; } = 0.9;
    public int FrequencyPenalty { get; set; } = 0;
    public int PresencePenalty { get; set; } = 0;
    public bool EnableFallback { get; set; } = true; // Fallback to static if OpenAI fails
}

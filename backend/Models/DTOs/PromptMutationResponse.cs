using System.Text.Json.Serialization;

namespace ArtifyMe.Models.DTOs;

public class PromptMutationResponse
{
    [JsonPropertyName("originalPrompt")]
    public string OriginalPrompt { get; set; } = string.Empty;
    
    [JsonPropertyName("mutatedPrompt")]
    public string MutatedPrompt { get; set; } = string.Empty;
    
    [JsonPropertyName("appliedStyle")]
    public MutationStyle AppliedStyle { get; set; }
    
    [JsonPropertyName("creativityLevel")]
    public int CreativityLevel { get; set; }
    
    [JsonPropertyName("mutationExplanation")]
    public string MutationExplanation { get; set; } = string.Empty;
    
    [JsonPropertyName("addedElements")]
    public List<string> AddedElements { get; set; } = new List<string>();
    
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

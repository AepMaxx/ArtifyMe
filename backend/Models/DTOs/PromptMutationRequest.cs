using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ArtifyMe.Models.DTOs;

public class PromptMutationRequest
{
    [Required]
    [StringLength(1000)]
    [JsonPropertyName("originalPrompt")]
    public string OriginalPrompt { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("style")]
    public MutationStyle Style { get; set; }

    [Range(1, 10)]
    [JsonPropertyName("creativityLevel")]
    public int CreativityLevel { get; set; } = 5;

    [StringLength(500)]
    [JsonPropertyName("additionalContext")]
    public string? AdditionalContext { get; set; }
}

public enum MutationStyle
{
    Artistic,      // Focus on artistic styles, colors, lighting
    Technical,     // Focus on technical details, composition
    Emotional,     // Focus on mood, atmosphere, feelings
    Descriptive,   // Focus on detailed visual descriptions
    Abstract,      // Focus on abstract concepts, surreal elements
    Realistic,     // Focus on photorealistic details
    Fantasy,       // Focus on fantasy elements, magical aspects
    Minimalist     // Focus on simplicity, clean lines
}

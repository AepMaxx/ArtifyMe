using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ArtifyMe.Models.DTOs;

public class AnalyzePromptRequest
{
    [Required]
    [StringLength(1000)]
    [JsonPropertyName("prompt")]
    public string Prompt { get; set; } = string.Empty;
}

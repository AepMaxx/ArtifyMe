using ArtifyMe.Models.DTOs;

namespace ArtifyMe.Services.Interfaces;

public interface IOpenAIService
{
    Task<string> EnhancePromptAsync(string originalPrompt, MutationStyle style, int creativityLevel, string? additionalContext = null);
    Task<List<string>> GetCreativeSuggestionsAsync(string originalPrompt, MutationStyle style, int count = 5);
    Task<string> AnalyzePromptQualityAsync(string prompt);
    Task<List<string>> GenerateStyleVariationsAsync(string originalPrompt, MutationStyle style, int count = 3);
    Task<bool> IsServiceAvailableAsync();
}

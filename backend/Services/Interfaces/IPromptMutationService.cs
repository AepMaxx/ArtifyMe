using ArtifyMe.Models.DTOs;

namespace ArtifyMe.Services.Interfaces;

public interface IPromptMutationService
{
    Task<PromptMutationResponse> MutatePromptAsync(PromptMutationRequest request);
    Task<List<string>> GetMutationSuggestionsAsync(string originalPrompt, MutationStyle style);
    Task<string> EnhancePromptWithStyleAsync(string prompt, MutationStyle style, int creativityLevel);
}

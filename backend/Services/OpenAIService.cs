using ArtifyMe.Models.DTOs;
using ArtifyMe.Services.Interfaces;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ArtifyMe.Services;

public class OpenAIService : IOpenAIService
{
    private readonly HttpClient _httpClient;
    private readonly OpenAISettings _settings;
    private readonly ILogger<OpenAIService> _logger;

    public OpenAIService(HttpClient httpClient, IOptions<OpenAISettings> settings, ILogger<OpenAIService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;

        // Configure HTTP client
        _httpClient.BaseAddress = new Uri("https://api.openai.com/v1/");
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_settings.ApiKey}");
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "ArtifyMe/1.0");
    }

    public async Task<string> EnhancePromptAsync(string originalPrompt, MutationStyle style, int creativityLevel, string? additionalContext = null)
    {
        try
        {
            var systemPrompt = BuildSystemPrompt(style, creativityLevel);
            var userPrompt = BuildUserPrompt(originalPrompt, additionalContext);

            var requestBody = new
            {
                model = _settings.Model,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPrompt }
                },
                max_tokens = _settings.MaxTokens,
                temperature = CalculateTemperature(creativityLevel),
                top_p = _settings.TopP,
                frequency_penalty = _settings.FrequencyPenalty,
                presence_penalty = _settings.PresencePenalty
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");


            var response = await _httpClient.PostAsync("chat/completions", content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"OpenAI API error: {response.StatusCode} - {errorContent}");
                throw new HttpRequestException($"OpenAI API error: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            
            var openAIResponse = JsonSerializer.Deserialize<OpenAIResponse>(responseContent);

            if (openAIResponse?.Choices?.FirstOrDefault()?.Message?.Content == null)
            {
                _logger.LogError($"Invalid OpenAI response structure. Response: {responseContent}");
                throw new InvalidOperationException("Invalid response from OpenAI API");
            }

            var enhancedPrompt = openAIResponse.Choices.First().Message.Content.Trim();

            return enhancedPrompt;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enhancing prompt with OpenAI");
            throw;
        }
    }

    public async Task<List<string>> GetCreativeSuggestionsAsync(string originalPrompt, MutationStyle style, int count = 5)
    {
        try
        {
            var systemPrompt = $"You are an expert AI art prompt engineer. Generate {count} creative enhancement suggestions for the given prompt in the {style} style. Each suggestion should be a short phrase (2-4 words) that can be added to improve the prompt. Return only the suggestions, one per line, without numbering or bullet points.";

            var userPrompt = $"Original prompt: \"{originalPrompt}\"\n\nStyle: {style}\n\nGenerate {count} creative enhancement suggestions:";

            var requestBody = new
            {
                model = _settings.Model,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPrompt }
                },
                max_tokens = 200,
                temperature = 0.9,
                top_p = 0.9
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("chat/completions", content);
            
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"OpenAI API error: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            
            var openAIResponse = JsonSerializer.Deserialize<OpenAIResponse>(responseContent);

            if (openAIResponse?.Choices?.FirstOrDefault()?.Message?.Content == null)
            {
                _logger.LogError($"Invalid OpenAI suggestions response structure. Response: {responseContent}");
                throw new InvalidOperationException("Invalid response from OpenAI API");
            }

            var suggestions = openAIResponse.Choices.First().Message.Content
                .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrEmpty(s))
                .Take(count)
                .ToList();

            return suggestions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting creative suggestions from OpenAI");
            throw;
        }
    }

    public async Task<string> AnalyzePromptQualityAsync(string prompt)
    {
        try
        {
            var systemPrompt = "You are an expert AI art prompt analyzer. Analyze the given prompt and provide a brief assessment of its quality, creativity, and potential for generating good AI art. Be constructive and specific.";

            var userPrompt = $"Analyze this prompt: \"{prompt}\"";

            var requestBody = new
            {
                model = _settings.Model,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPrompt }
                },
                max_tokens = 150,
                temperature = 0.3
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("chat/completions", content);
            
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"OpenAI API error: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var openAIResponse = JsonSerializer.Deserialize<OpenAIResponse>(responseContent);

            return openAIResponse?.Choices?.FirstOrDefault()?.Message?.Content?.Trim() ?? "Unable to analyze prompt.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing prompt with OpenAI");
            return "Analysis unavailable due to API error.";
        }
    }

    public async Task<List<string>> GenerateStyleVariationsAsync(string originalPrompt, MutationStyle style, int count = 3)
    {
        try
        {
            var systemPrompt = $"You are an expert AI art prompt engineer. Generate {count} different variations of the given prompt, each emphasizing different aspects of the {style} style. Each variation should be a complete, enhanced prompt that maintains the core concept but explores different creative directions.";

            var userPrompt = $"Original prompt: \"{originalPrompt}\"\n\nStyle: {style}\n\nGenerate {count} style variations:";

            var requestBody = new
            {
                model = _settings.Model,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPrompt }
                },
                max_tokens = 400,
                temperature = 0.8,
                top_p = 0.9
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("chat/completions", content);
            
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"OpenAI API error: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var openAIResponse = JsonSerializer.Deserialize<OpenAIResponse>(responseContent);

            if (openAIResponse?.Choices?.FirstOrDefault()?.Message?.Content == null)
            {
                throw new InvalidOperationException("Invalid response from OpenAI API");
            }

            var variations = openAIResponse.Choices.First().Message.Content
                .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrEmpty(s) && s.Length > 10)
                .Take(count)
                .ToList();

            return variations;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating style variations from OpenAI");
            throw;
        }
    }

    public async Task<bool> IsServiceAvailableAsync()
    {
        try
        {
            var requestBody = new
            {
                model = _settings.Model,
                messages = new[] { new { role = "user", content = "test" } },
                max_tokens = 5
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("chat/completions", content);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    private string BuildSystemPrompt(MutationStyle style, int creativityLevel)
    {
        var creativityDescription = creativityLevel switch
        {
            <= 3 => "conservative and subtle",
            <= 6 => "moderate and balanced",
            <= 8 => "creative and expressive",
            _ => "highly creative and experimental"
        };

        var styleInstructions = style switch
        {
            MutationStyle.Artistic => "Focus on artistic elements like composition, color theory, artistic styles, lighting, and visual aesthetics. Add artistic techniques and mediums.",
            MutationStyle.Technical => "Emphasize technical photography and digital art terms, camera settings, composition rules, and professional quality descriptors.",
            MutationStyle.Emotional => "Concentrate on mood, atmosphere, emotional tone, and psychological impact. Add descriptors that evoke feelings.",
            MutationStyle.Descriptive => "Enhance with detailed visual descriptions, textures, materials, lighting conditions, and environmental details.",
            MutationStyle.Abstract => "Add abstract concepts, surreal elements, conceptual art terms, and non-representational artistic approaches.",
            MutationStyle.Realistic => "Focus on photorealistic details, natural lighting, realistic textures, and lifelike qualities.",
            MutationStyle.Fantasy => "Emphasize fantasy elements, magical qualities, mythical creatures, enchanted environments, and otherworldly features.",
            MutationStyle.Minimalist => "Keep it clean and simple, focusing on essential elements, clean lines, and minimalist aesthetic principles.",
            _ => "Enhance the prompt with creative and artistic elements."
        };

        return $@"You are an expert AI art prompt engineer specializing in {style} style enhancements. Your task is to transform the given prompt into a more detailed, creative, and effective prompt for AI image generation.

Style Focus: {styleInstructions}
Creativity Level: {creativityDescription}

Guidelines:
- Maintain the core concept and subject matter
- Add relevant artistic and technical terms
- Include quality descriptors appropriate for the creativity level
- Ensure the enhanced prompt is coherent and well-structured
- Avoid over-complicating or losing the original intent
- Focus on elements that will improve AI image generation quality

Return only the enhanced prompt, no explanations or additional text.";
    }

    private string BuildUserPrompt(string originalPrompt, string? additionalContext)
    {
        var context = string.IsNullOrEmpty(additionalContext) ? "" : $"\nAdditional context: {additionalContext}";
        return $"Original prompt: \"{originalPrompt}\"{context}\n\nEnhance this prompt:";
    }

    private double CalculateTemperature(int creativityLevel)
    {
        // Map creativity level (1-10) to temperature (0.3-1.0)
        return Math.Max(0.3, Math.Min(1.0, 0.3 + (creativityLevel - 1) * 0.07));
    }
}

// OpenAI API Response Models
public class OpenAIResponse
{
    [JsonPropertyName("choices")]
    public List<Choice> Choices { get; set; } = new();
}

public class Choice
{
    [JsonPropertyName("message")]
    public Message Message { get; set; } = new();
}

public class Message
{
    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;
}

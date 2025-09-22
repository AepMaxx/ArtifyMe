using ArtifyMe.Models.DTOs;
using ArtifyMe.Services.Interfaces;
using System.Text;

namespace ArtifyMe.Services;

public class PromptMutationService : IPromptMutationService
{
    private readonly Random _random = new Random();
    private readonly IOpenAIService _openAIService;
    private readonly ILogger<PromptMutationService> _logger;

    public PromptMutationService(IOpenAIService openAIService, ILogger<PromptMutationService> logger)
    {
        _openAIService = openAIService;
        _logger = logger;
    }

    public async Task<PromptMutationResponse> MutatePromptAsync(PromptMutationRequest request)
    {
        _logger.LogInformation($"Starting prompt mutation for style: {request.Style}");
        
        try
        {
            var mutatedPrompt = await EnhancePromptWithStyleAsync(
                request.OriginalPrompt, 
                request.Style, 
                request.CreativityLevel
            );


            var addedElements = ExtractAddedElements(request.OriginalPrompt, mutatedPrompt);
            var explanation = GenerateMutationExplanation(request.Style, addedElements);

            var response = new PromptMutationResponse
            {
                OriginalPrompt = request.OriginalPrompt,
                MutatedPrompt = mutatedPrompt,
                AppliedStyle = request.Style,
                CreativityLevel = request.CreativityLevel,
                MutationExplanation = explanation,
                AddedElements = addedElements,
                CreatedAt = DateTime.UtcNow
            };

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error in MutatePromptAsync: {ex.Message}");
            throw;
        }
    }

    public async Task<List<string>> GetMutationSuggestionsAsync(string originalPrompt, MutationStyle style)
    {
        try
        {
            // Try OpenAI suggestions first
            
            var openAISuggestions = await _openAIService.GetCreativeSuggestionsAsync(originalPrompt, style, 5);
            
            if (openAISuggestions.Any())
            {
                return openAISuggestions.Take(3).ToList();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "OpenAI suggestions failed, falling back to static suggestions");
        }

        // Fallback to static suggestions
        return GetStaticSuggestions(style);
    }

    private List<string> GetStaticSuggestions(MutationStyle style)
    {
        var suggestions = new List<string>();
        
        switch (style)
        {
            case MutationStyle.Artistic:
                suggestions.AddRange(new[] { "oil painting", "watercolor", "digital art", "impressionist", "renaissance style" });
                break;
            case MutationStyle.Technical:
                suggestions.AddRange(new[] { "high resolution", "detailed", "professional photography", "sharp focus", "perfect composition" });
                break;
            case MutationStyle.Emotional:
                suggestions.AddRange(new[] { "melancholic", "serene", "dramatic", "peaceful", "nostalgic" });
                break;
            case MutationStyle.Descriptive:
                suggestions.AddRange(new[] { "intricate details", "textured surface", "rich colors", "dynamic lighting", "depth of field" });
                break;
            case MutationStyle.Abstract:
                suggestions.AddRange(new[] { "surreal", "abstract", "geometric patterns", "fluid forms", "conceptual art" });
                break;
            case MutationStyle.Realistic:
                suggestions.AddRange(new[] { "photorealistic", "hyperrealistic", "lifelike", "natural lighting", "texture mapping" });
                break;
            case MutationStyle.Fantasy:
                suggestions.AddRange(new[] { "magical", "mystical", "enchanted", "otherworldly", "fantasy art" });
                break;
            case MutationStyle.Minimalist:
                suggestions.AddRange(new[] { "clean lines", "minimalist", "simple", "elegant", "uncluttered" });
                break;
        }

        return suggestions.Take(3).ToList();
    }

    public async Task<string> EnhancePromptWithStyleAsync(string prompt, MutationStyle style, int creativityLevel)
    {
        try
        {
            // Try OpenAI enhancement first
            
            var openAIEnhanced = await _openAIService.EnhancePromptAsync(prompt, style, creativityLevel);
            
            if (!string.IsNullOrEmpty(openAIEnhanced) && openAIEnhanced.Length > prompt.Length)
            {
                return openAIEnhanced;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "OpenAI enhancement failed, falling back to static enhancement");
        }

        // Fallback to static enhancement
        return await GetStaticEnhancedPrompt(prompt, style, creativityLevel);
    }

    private async Task<string> GetStaticEnhancedPrompt(string prompt, MutationStyle style, int creativityLevel)
    {
        var enhancedPrompt = new StringBuilder(prompt);

        // Add style-specific enhancements
        var styleEnhancements = GetStyleEnhancements(style, creativityLevel);
        enhancedPrompt.Append($", {string.Join(", ", styleEnhancements)}");

        // Add quality enhancements based on creativity level
        var qualityEnhancements = GetQualityEnhancements(creativityLevel);
        enhancedPrompt.Append($", {string.Join(", ", qualityEnhancements)}");

        // Add random creative elements for higher creativity levels
        if (creativityLevel > 6)
        {
            var creativeElements = GetCreativeElements();
            enhancedPrompt.Append($", {string.Join(", ", creativeElements.Take(2))}");
        }

        return enhancedPrompt.ToString();
    }

    private List<string> GetStyleEnhancements(MutationStyle style, int creativityLevel)
    {
        var enhancements = new List<string>();

        switch (style)
        {
            case MutationStyle.Artistic:
                enhancements.AddRange(new[] { "artistic", "beautiful composition" });
                if (creativityLevel > 5) enhancements.Add("masterpiece quality");
                break;
            case MutationStyle.Technical:
                enhancements.AddRange(new[] { "highly detailed", "professional quality" });
                if (creativityLevel > 5) enhancements.Add("technical precision");
                break;
            case MutationStyle.Emotional:
                enhancements.AddRange(new[] { "emotional depth", "atmospheric" });
                if (creativityLevel > 5) enhancements.Add("evocative mood");
                break;
            case MutationStyle.Descriptive:
                enhancements.AddRange(new[] { "richly detailed", "vivid description" });
                if (creativityLevel > 5) enhancements.Add("intricate textures");
                break;
            case MutationStyle.Abstract:
                enhancements.AddRange(new[] { "abstract", "surreal" });
                if (creativityLevel > 5) enhancements.Add("conceptual depth");
                break;
            case MutationStyle.Realistic:
                enhancements.AddRange(new[] { "photorealistic", "lifelike" });
                if (creativityLevel > 5) enhancements.Add("hyperrealistic");
                break;
            case MutationStyle.Fantasy:
                enhancements.AddRange(new[] { "fantasy", "magical" });
                if (creativityLevel > 5) enhancements.Add("otherworldly");
                break;
            case MutationStyle.Minimalist:
                enhancements.AddRange(new[] { "minimalist", "clean" });
                if (creativityLevel > 5) enhancements.Add("elegant simplicity");
                break;
        }

        return enhancements;
    }

    private List<string> GetQualityEnhancements(int creativityLevel)
    {
        var enhancements = new List<string> { "high quality" };

        if (creativityLevel > 3) enhancements.Add("detailed");
        if (creativityLevel > 5) enhancements.Add("masterpiece");
        if (creativityLevel > 7) enhancements.Add("award-winning");
        if (creativityLevel > 8) enhancements.Add("stunning");

        return enhancements;
    }

    private List<string> GetCreativeElements()
    {
        var elements = new List<string>
        {
            "dynamic lighting", "rich colors", "textured surface", "depth of field",
            "atmospheric perspective", "dramatic shadows", "vibrant palette",
            "smooth gradients", "intricate patterns", "flowing lines"
        };

        return elements.OrderBy(x => _random.Next()).Take(3).ToList();
    }

    private List<string> ExtractAddedElements(string original, string mutated)
    {
        var originalWords = original.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var mutatedWords = mutated.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        
        return mutatedWords.Except(originalWords).ToList();
    }

    private string GenerateMutationExplanation(MutationStyle style, List<string> addedElements)
    {
        var styleDescription = style switch
        {
            MutationStyle.Artistic => "Enhanced with artistic elements",
            MutationStyle.Technical => "Improved with technical details",
            MutationStyle.Emotional => "Enriched with emotional depth",
            MutationStyle.Descriptive => "Expanded with detailed descriptions",
            MutationStyle.Abstract => "Transformed with abstract concepts",
            MutationStyle.Realistic => "Refined for photorealistic quality",
            MutationStyle.Fantasy => "Enchanted with fantasy elements",
            MutationStyle.Minimalist => "Simplified with minimalist approach",
            _ => "Enhanced with creative elements"
        };

        if (addedElements.Any())
        {
            styleDescription += $" including: {string.Join(", ", addedElements.Take(3))}";
        }

        return styleDescription;
    }
}

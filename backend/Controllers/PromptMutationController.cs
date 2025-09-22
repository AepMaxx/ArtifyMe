using Microsoft.AspNetCore.Mvc;
using ArtifyMe.Models.DTOs;
using ArtifyMe.Services.Interfaces;
using System.Threading.Tasks;

namespace ArtifyMe.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
public class PromptMutationController : ControllerBase
{
    private readonly IPromptMutationService _promptMutationService;
    private readonly IOpenAIService _openAIService;
    private readonly ILogger<PromptMutationController> _logger;

    public PromptMutationController(IPromptMutationService promptMutationService, IOpenAIService openAIService, ILogger<PromptMutationController> logger)
    {
        _promptMutationService = promptMutationService;
        _openAIService = openAIService;
        _logger = logger;
    }

        [HttpPost("mutate")]
        public async Task<IActionResult> MutatePrompt([FromBody] PromptMutationRequest request)
        {
            
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList();
                return BadRequest(new { 
                    Message = "Invalid request data", 
                    Errors = errors 
                });
            }

            if (request == null)
            {
                return BadRequest(new { Message = "Request body is required" });
            }

            if (string.IsNullOrWhiteSpace(request.OriginalPrompt))
            {
                return BadRequest(new { Message = "Original prompt is required" });
            }

            try
            {
                var response = await _promptMutationService.MutatePromptAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Prompt mutation failed: {ex.Message}");
                return BadRequest(new { 
                    Message = $"Prompt mutation failed: {ex.Message}",
                    Details = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("suggestions")]
        public async Task<IActionResult> GetMutationSuggestions(
            [FromQuery] string prompt,
            [FromQuery] MutationStyle style = MutationStyle.Artistic)
        {
            if (string.IsNullOrWhiteSpace(prompt))
            {
                return BadRequest(new { Message = "Prompt is required" });
            }

            try
            {
                var suggestions = await _promptMutationService.GetMutationSuggestionsAsync(prompt, style);
                return Ok(new { Suggestions = suggestions, Style = style });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = $"Failed to get suggestions: {ex.Message}" });
            }
        }

        [HttpPost("enhance")]
        public async Task<IActionResult> EnhancePrompt([FromBody] PromptMutationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var enhancedPrompt = await _promptMutationService.EnhancePromptWithStyleAsync(
                    request.OriginalPrompt, 
                    request.Style, 
                    request.CreativityLevel
                );
                
                return Ok(new { EnhancedPrompt = enhancedPrompt });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = $"Prompt enhancement failed: {ex.Message}" });
            }
        }

        [HttpGet("variations")]
        public async Task<IActionResult> GetStyleVariations(
            [FromQuery] string prompt,
            [FromQuery] MutationStyle style = MutationStyle.Artistic,
            [FromQuery] int count = 3)
        {
            if (string.IsNullOrWhiteSpace(prompt))
            {
                return BadRequest(new { Message = "Prompt is required" });
            }

            try
            {
                var variations = await _openAIService.GenerateStyleVariationsAsync(prompt, style, count);
                return Ok(new { Variations = variations, Style = style });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = $"Failed to generate variations: {ex.Message}" });
            }
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzePrompt([FromBody] AnalyzePromptRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var analysis = await _openAIService.AnalyzePromptQualityAsync(request.Prompt);
                return Ok(new { Analysis = analysis, Prompt = request.Prompt });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = $"Prompt analysis failed: {ex.Message}" });
            }
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetServiceStatus()
        {
            try
            {
                var isAvailable = await _openAIService.IsServiceAvailableAsync();
                return Ok(new { 
                    OpenAIAvailable = isAvailable,
                    Status = isAvailable ? "Operational" : "Fallback Mode",
                    Message = isAvailable ? "AI-powered enhancement active" : "Using static enhancement"
                });
            }
            catch (Exception ex)
            {
                return Ok(new { 
                    OpenAIAvailable = false,
                    Status = "Fallback Mode",
                    Message = "Using static enhancement",
                    Error = ex.Message
                });
            }
        }

    }
}

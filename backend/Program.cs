using ArtifyMe.Models;
using ArtifyMe.Models.DTOs;
using ArtifyMe.Repositories;
using ArtifyMe.Repositories.Interfaces;
using ArtifyMe.Services;
using ArtifyMe.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using ArtifyMe.Utilities.Interfaces;
using ArtifyMe.Utilities;
using Amazon.S3;
using Amazon.Extensions.NETCore.Setup;
using Amazon;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Logging;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ============================================================================
// LOGGING CONFIGURATION
// ============================================================================

// Configure logging to reduce verbosity
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

// Reduce Entity Framework logging verbosity
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.Warning);
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore.Infrastructure", LogLevel.Warning);


// ============================================================================
// CONFIGURATION SETUP
// ============================================================================

// Bind JWT settings from configuration
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// Bind AWS settings from appsettings.json
builder.Services.Configure<AwsSettings>(builder.Configuration.GetSection("AWS"));

// Bind OpenAI settings from appsettings.json
builder.Services.Configure<OpenAISettings>(builder.Configuration.GetSection("OpenAI"));

// ============================================================================
// AWS CONFIGURATION (DISABLED FOR NOW)
// ============================================================================
// TODO: Enable when AWS credentials are available
/*
var awsSettings = builder.Configuration.GetSection("AWS").Get<AwsSettings>();
var awsOptions = new AWSOptions
{
    Credentials = new Amazon.Runtime.BasicAWSCredentials(
        awsSettings.AccessKeyId, 
        awsSettings.SecretKey
    ),
    Region = RegionEndpoint.GetBySystemName(awsSettings.Region)
};
builder.Services.AddDefaultAWSOptions(awsOptions);
builder.Services.AddAWSService<IAmazonS3>();
*/

// ============================================================================
// CORE SERVICES
// ============================================================================

// Add controllers with JSON configuration
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add logging
builder.Logging.AddConsole();

// ============================================================================
// AUTHENTICATION & AUTHORIZATION
// ============================================================================

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
if (jwtSettings?.Secret != null)
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });
}

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("CORS", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ============================================================================
// DATABASE & SERVICES
// ============================================================================

// Configure database context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.EnableSensitiveDataLogging(false);
    options.EnableDetailedErrors(false);
});

// Register dependencies
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IHasher, Hasher>();
builder.Services.AddScoped<IArtworkService, ArtworkService>();
builder.Services.AddScoped<IArtworkRepository, ArtworkRepository>();
builder.Services.AddScoped<IPromptMutationService, PromptMutationService>();
builder.Services.AddScoped<IOpenAIService, OpenAIService>();
builder.Services.AddHttpClient<IOpenAIService, OpenAIService>();
// S3Service temporarily disabled - enable when AWS credentials are configured
// builder.Services.AddScoped<IS3Service, S3Service>();

var app = builder.Build();

// ============================================================================
// HTTP REQUEST PIPELINE CONFIGURATION
// ============================================================================

// Development environment configuration
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ArtifyMe API v1");
        c.RoutePrefix = "swagger";
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// CORS middleware
app.UseCors("CORS");

// HTTPS redirection
app.UseHttpsRedirection();

// Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

// Ensure database is created and migrations are applied
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.EnsureCreatedAsync();
        Console.WriteLine("✅ Database initialized successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database initialization failed: {ex.Message}");
    }
}

// ============================================================================
// APPLICATION STARTUP
// ============================================================================

Console.WriteLine("ArtifyMe Backend started");
Console.WriteLine($"Environment: {app.Environment.EnvironmentName}");
Console.WriteLine($"API Documentation: https://localhost:5000/swagger");

app.Run();

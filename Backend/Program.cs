using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Hubs;
using Microsoft.AspNetCore.Cors;
// using Swashbuckle.AspNetCore.Filters;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using global::Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Increase Max Request Body Size for Base64 Images
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = int.MaxValue;
    options.MemoryBufferThreshold = int.MaxValue;
});
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = int.MaxValue; // 2GB
});

builder.Services.AddControllers();
// Configure CORS for SignalR
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<LotteryDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
        sqlOptions.CommandTimeout(30);
    }));

// Add Authentication
builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(
                builder.Configuration.GetSection("AppSettings:Token").Value 
                ?? builder.Configuration.GetSection("JwtSettings:Secret").Value 
                ?? "ThisIsASecretKeyForVishipelLotteryApp2026!KeepItSecretKeepItSafe_AndMakeItLongerToSatisfyHS512JustInCase")),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.AddSecurityDefinition("oauth2", new Microsoft.OpenApi.Models.OpenApiSecurityScheme {
        Description = "Standard Authorization header using the Bearer scheme (\"bearer {token}\")",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey
    });
    // c.OperationFilter<Swashbuckle.AspNetCore.Filters.SecurityRequirementsOperationFilter>();
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Serve static files from wwwroot
app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowAll");

app.UseAuthentication(); // Added Auth Middleware
app.UseAuthorization();

app.MapControllers();

// Map SignalR Hub
// app.MapHub<ParticipantHub>("/participantHub");

// Fallback to index.html for React routing - must be last
app.MapFallbackToFile("index.html");

app.Run();


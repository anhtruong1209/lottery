using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Hubs;
using Microsoft.AspNetCore.Cors;
// using Swashbuckle.AspNetCore.Filters;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using global::Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Add SignalR
builder.Services.AddSignalR();

// Configure CORS for SignalR
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        // Allow all origins in production, or specific domains
        if (builder.Environment.IsDevelopment())
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:3001")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
        else
        {
            // Production: Allow same origin (when deployed together)
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
    });
});

// Configure PostgreSQL (Supabase)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5432;Database=lottery_db;Username=postgres;Password=postgres";

builder.Services.AddDbContext<LotteryDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);
        npgsqlOptions.CommandTimeout(30);
    }));

// Add Authentication
builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(
                builder.Configuration.GetSection("AppSettings:Token").Value ?? "ThisIsASecretKeyForVishipelLotteryApp2026!KeepItSecretKeepItSafe")),
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
app.MapHub<ParticipantHub>("/participantHub");

// Fallback to index.html for React routing - must be last
app.MapFallbackToFile("index.html");

// Apply migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<LotteryDbContext>();
    try
    {
        // NOTE: Migrations are handled manually via Supabase SQL script
        dbContext.Database.Migrate();

        // ALWAYS generate and print hash for manual database update
        var correctPasswordHash = BCrypt.Net.BCrypt.HashPassword("admin");
        Console.WriteLine($"");
        Console.WriteLine($"==== ADMIN PASSWORD HASH FOR 'admin' ====");
        Console.WriteLine(correctPasswordHash);
        Console.WriteLine($"==========================================");
        Console.WriteLine($"Run this SQL in Supabase:");
        Console.WriteLine($"UPDATE users SET password_hash = '{correctPasswordHash}' WHERE username = 'admin';");
        Console.WriteLine($"==========================================");
        Console.WriteLine($"");

        // Seed Admin User (only if doesn't exist)
        if (!dbContext.Users.Any(u => u.Username == "admin"))
        {
            var adminUser = new Backend.Models.User
            {
                Username = "admin",
                Role = "Admin",
                PasswordHash = correctPasswordHash
            };

            dbContext.Users.Add(adminUser);
            dbContext.SaveChanges();
            
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogInformation("Seeded Admin user.");
        }
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database or seeding.");
    }
}

app.Run();


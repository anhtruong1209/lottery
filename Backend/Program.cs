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

// Add SignalR
builder.Services.AddSignalR();

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


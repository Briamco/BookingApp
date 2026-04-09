using System.Text;
using System.Text.Json.Serialization;
using BookingApp.Api.Middlewares;
using BookingApp.Application.Intefaces;
using BookingApp.Application.Intefaces.Services;
using BookingApp.Domain.Interface;
using BookingApp.Infrastructure.BackgroundJobs;
using BookingApp.Infrastructure.Data;
using BookingApp.Infrastructure.Respositories;
using BookingApp.Infrastructure.Services;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.WebSockets;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Resend;

var builder = WebApplication.CreateBuilder(args);

Env.Load();
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles
    );
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// DB Connection
var connectionString = builder.Configuration["DB_CONNECTION_STRING"];
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString)
);

// Add Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddScoped<IBlockedRepository, BlockedDateRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

// Add resend
builder.Services.AddHttpClient<ResendClient>();
builder.Services.Configure<ResendClientOptions>(o =>
{
    o.ApiToken = Environment.GetEnvironmentVariable("RESEND_API_KEY")!;
});
builder.Services.AddTransient<IResend, ResendClient>();

// Add Email scope
builder.Services.AddScoped<ResendEmailService>();
builder.Services.AddScoped<GmailEmailService>();

builder.Services.AddScoped<IEmailService, FallbackEmailService>();

// Add Email Queue
var emailQueue = new EmailQueue();
builder.Services.AddSingleton<IEmailQueue>(emailQueue);
builder.Services.AddSingleton(emailQueue);

// Add BackgroundWorker
builder.Services.AddHostedService<EmailBackgroundWorker>();
builder.Services.AddHostedService<ReservationCompletionWorker>();

// Add PasswordHasher and JWTProvider scope
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtProvider, JwtProvider>();

var jwtIssuer = builder.Configuration["JWT_ISSUER"];
var jwtSecret = builder.Configuration["JWT_SECRET"];

if (string.IsNullOrWhiteSpace(jwtIssuer) || string.IsNullOrWhiteSpace(jwtSecret))
{
    throw new InvalidOperationException(
        "JWT configuration is missing. Set JWT_ISSUER and JWT_SECRET in appsettings or environment variables."
    );
}

// Add JWT Middleware
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret)
            )
        };
    }
    );

// Add AuthService Scope
builder.Services.AddScoped<AuthService>();

// Add Image Storage Scope
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IImageStorageService, LocalImageStorageService>();

//Add User Scope
builder.Services.AddScoped<IUserService, UserService>();

//Add Property Scope
builder.Services.AddScoped<PropertyService>();

// Add Reservation Scope
builder.Services.AddScoped<ReservationService>();

// Add BlockedDate Scope
builder.Services.AddScoped<BlockedDateService>();

// Add Review Scope
builder.Services.AddScoped<ReviewService>();

// Add WebSocket Connection Manager Scope
builder.Services.AddSingleton<IWebSocketConnectionManager, WebSocketConnectionManager>();

// Add Notification Service Scope
builder.Services.AddScoped<INotificationService, NotificationService>();

// Add WebSocket support
builder.Services.AddWebSockets(options =>
{
    options.KeepAliveInterval = TimeSpan.FromSeconds(120);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "v1");
    });
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

// Add WebSocket middleware
app.UseWebSockets();
app.UseMiddleware<BookingApp.Api.Middlewares.WebSocketMiddleware>();

app.UseMiddleware<BookingApp.Api.Middlewares.GlobalExceptionMiddleware>();

app.MapControllers();

app.Run();

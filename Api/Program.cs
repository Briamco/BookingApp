using BookingApp.Application.Intefaces.Services;
using BookingApp.Domain.Interface;
using BookingApp.Infrastructure.BackgroundJobs;
using BookingApp.Infrastructure.Data;
using BookingApp.Infrastructure.Respositories;
using BookingApp.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Resend;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
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
builder.Services.AddScoped<IEmailService, ResendEmailService>();

// Add Email Queue
var emailQueue = new EmailQueue();
builder.Services.AddSingleton<IEmailQueue>(emailQueue);
builder.Services.AddSingleton(emailQueue);

// Add Email BackgroundWorker
builder.Services.AddHostedService<EmailBackgroundWorker>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

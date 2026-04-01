using BookingApp.Application.Intefaces.Services;
using BookingApp.Infrastructure.BackgroundJobs;
using BookingApp.Infrastructure.Services;
using Resend;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

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

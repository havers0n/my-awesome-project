using System.Globalization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = null;
});

var app = builder.Build();

app.MapPost("/get-season", async (HttpContext context) =>
{
    try
    {
        var request = await context.Request.ReadFromJsonAsync<DateRequest>();
        if (request == null || string.IsNullOrWhiteSpace(request.Date))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = "Missing or empty 'Date' field." });
            return;
        }

        if (!DateTime.TryParse(request.Date, out var parsedDate))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = "Invalid date format." });
            return;
        }

        var season = GetSeason(parsedDate);
        await context.Response.WriteAsJsonAsync(new { season });
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { error = ex.Message });
    }
});

app.Run("http://localhost:5000");

static string GetSeason(DateTime date)
{
    int dayOfYear = date.DayOfYear;
    int year = date.Year;

    // Оценка по датам равноденствий и солнцестояний (приблизительно)
    var spring = new DateTime(year, 3, 20);
    var summer = new DateTime(year, 6, 21);
    var autumn = new DateTime(year, 9, 23);
    var winter = new DateTime(year, 12, 21);

    if (date >= spring && date < summer)
        return "Spring";
    else if (date >= summer && date < autumn)
        return "Summer";
    else if (date >= autumn && date < winter)
        return "Autumn";
    else
        return "Winter";
}

record DateRequest(string Date);

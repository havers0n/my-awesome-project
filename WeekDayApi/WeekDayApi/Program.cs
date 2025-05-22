using System.Globalization;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.MapPost("/get-weekday", async (HttpContext context) =>
{
    try
    {
        
        var request = await context.Request.ReadFromJsonAsync<DateRequest>();
        if (request == null || string.IsNullOrWhiteSpace(request.Date))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = "Invalid or missing 'date'." });
            return;
        }

        if (!DateTime.TryParseExact(request.Date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = "Date must be in 'yyyy-MM-dd' format." });
            return;
        }

        var dayOfWeek = parsedDate.ToString("dddd", CultureInfo.InvariantCulture);

        await context.Response.WriteAsJsonAsync(new
        {
            weekday = dayOfWeek
        });
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { error = ex.Message });
    }
});

app.Run();

record DateRequest(string Date);

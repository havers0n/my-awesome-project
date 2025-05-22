using System.Globalization;
using System.Net.Http;
using System.Text.Json;
using System.Xml.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;
using System.Text;
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);


var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/get-Inflation-Currency", async (HttpContext context) =>
{
    try
    {
        var request = await context.Request.ReadFromJsonAsync<DateRequest>();
        if (request == null || string.IsNullOrWhiteSpace(request.Date))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = "Параметр 'date' отсутствует или пуст." });
            return;
        }

        if (!DateTime.TryParse(request.Date, out var parsedDate))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = "Неверный формат даты." });
            return;
        }

        var usdRate = await GetUsdRate(parsedDate);
        var inflation = await GetInflation(parsedDate);

        await context.Response.WriteAsJsonAsync(new
        {
            date = parsedDate.ToString("yyyy-MM-dd"),
            usd_to_rub = usdRate,
            inflation_percent = inflation
        });
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { error = ex.Message });
    }
});

// 👇 ВАЖНО: Методы должны идти до app.Run()
async Task<decimal?> GetUsdRate(DateTime date)
{
    var formattedDate = date.ToString("dd/MM/yyyy");
    var url = $"https://www.cbr.ru/scripts/XML_daily.asp?date_req={formattedDate}";

    using var client = new HttpClient();
    using var stream = await client.GetStreamAsync(url);
    using var reader = new StreamReader(stream, Encoding.GetEncoding("windows-1251")); // фикс кодировки

    var xml = await reader.ReadToEndAsync();
    var xdoc = XDocument.Parse(xml);

    var usdElement = xdoc.Descendants("Valute")
        .FirstOrDefault(x => x.Element("CharCode")?.Value == "USD");

    if (usdElement != null)
    {
        var valueStr = usdElement.Element("Value")?.Value;
        if (decimal.TryParse(valueStr, new CultureInfo("ru-RU"), out var value))
        {
            return value;
        }
    }

    return null;
}




async Task<decimal?> GetInflation(DateTime date)
{
    HttpClient client = new HttpClient();
    // Определяем начальную дату года
    var startDate = new DateTime(date.Year, 1, 1);

    // Форматируем даты в формате yyyy-MM-dd
    var start = startDate.ToString("yyyy-MM-dd");
    var end = date.ToString("yyyy-MM-dd");

    // Страна: "russia" или "kazakhstan"
    var country = "russia";

    // Формируем URL запроса
    var url = $"https://www.statbureau.org/calculate-inflation-rate-json?country={country}&start={start}&end={end}";

    try
    {
        // Отправляем GET-запрос
        var response = await client.GetAsync(url);
        response.EnsureSuccessStatusCode();

        // Читаем содержимое ответа
        var content = await response.Content.ReadAsStringAsync();

        var split = content.Split('"');
        decimal number = decimal.Parse(split[1], CultureInfo.InvariantCulture);

        return number;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Ошибка при получении данных об инфляции: {ex.Message}");
        return null;
    }
}


app.Run("http://localhost:5111");

record DateRequest(string Date);

public class InflationService
{
   
}

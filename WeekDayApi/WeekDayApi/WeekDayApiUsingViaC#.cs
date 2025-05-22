using System.Net.Http;
using System.Net.Http.Json;

Console.Write("Введите дату (любой формат): ");
string? inputDate = Console.ReadLine();

if (string.IsNullOrWhiteSpace(inputDate))
{
    Console.WriteLine("Дата не может быть пустой.");
    return;
}

using var client = new HttpClient();
client.BaseAddress = new Uri("http://localhost:5088");

var requestBody = new { Date = inputDate };

try
{
    var response = await client.PostAsJsonAsync("/get-weekday", requestBody);

    if (response.IsSuccessStatusCode)
    {
        var result = await response.Content.ReadFromJsonAsync<WeekdayResponse>();
        Console.WriteLine($"День недели: {result?.weekday}");
    }
    else
    {
        var error = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"Ошибка: {response.StatusCode} - {error}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Произошла ошибка при подключении: {ex.Message}");
}

public class WeekdayResponse
{
    public string? weekday { get; set; }
}

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/unemployment", async (HttpContext context) =>
{
var request = await JsonSerializer.DeserializeAsync<RequestModel>(context.Request.Body);
if (request == null || string.IsNullOrEmpty(request.Region))
{
    context.Response.StatusCode = 400;
    await context.Response.WriteAsync("Invalid request");
    return;
}

string apiKey = "YOUR_API_KEY";
string apiUrl = $"https://apidata.mos.ru/v1/datasets/61975/rows?api_key={apiKey}";

using var httpClient = new HttpClient();
var apiResponse = await httpClient.GetAsync(apiUrl);

if (!apiResponse.IsSuccessStatusCode)
{
    context.Response.StatusCode = 500;
    await context.Response.WriteAsync("Failed to get data from source");
    return;
}

var jsonData = await apiResponse.Content.ReadAsStringAsync();

// TODO: –еально распарсить jsonData, найти показатель безработицы за последний мес€ц.
// ƒл€ примера ставим фиктивное значение:
double unem

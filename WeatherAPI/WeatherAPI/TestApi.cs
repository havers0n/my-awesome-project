using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class WeatherClient
{
    static async Task Main(string[] args)
    {
        while (true)
        {
            string apiUrl = "http://localhost:5000/get-weather";  // или укажи свой адрес

            Console.WriteLine("Введите адрес магазина:");
            string address = Console.ReadLine();

            Console.WriteLine("Введите дату (yyyy-MM-dd):");
            string date = Console.ReadLine();

            var json = $"{{ \"address\": \"{address}\", \"date\": \"{date}\" }}";

            using var client = new HttpClient();
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                var response = await client.PostAsync(apiUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    Console.WriteLine("Ответ от сервера:");
                    Console.WriteLine(result);
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Ошибка {response.StatusCode}: {error}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при запросе: {ex.Message}");
            }
        }
        
    }
}

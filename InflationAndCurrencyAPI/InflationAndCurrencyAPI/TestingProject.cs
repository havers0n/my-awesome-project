using System.Net.Http.Json;
namespace TestSpace
{
    class TestClass
    {
        async public void Main()
        {
            var inputDate = Console.ReadLine();



            var client = new HttpClient();
            var url = "http://localhost:5111/get-Inflation-Currency";

            try
            {
                var response = await client.PostAsJsonAsync(url, new { Date = inputDate });

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
                    Console.WriteLine($"Ошибка: {error?.error ?? "Неизвестная"}");
                    return;
                }

                var result = await response.Content.ReadFromJsonAsync<RateResponse>();
                Console.WriteLine($"Курс доллара на {inputDate}: {result?.usd_to_rub} руб.");
                Console.WriteLine($"Инфляция {inputDate}: {result?.inflation_percent} %");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при подключении: {ex.Message}");
            }

        }
    }
    public class RateResponse
    {
        public decimal usd_to_rub { get; set; }
        public decimal inflation_percent { get; set; }
    }

    public class ErrorResponse
    {
        public string error { get; set; }
    }
}

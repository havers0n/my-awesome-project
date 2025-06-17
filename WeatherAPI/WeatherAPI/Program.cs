using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using WeatherAPI;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
Console.WriteLine("Start parsing...");
double[][] RegionLoc = new double[][] { new double[]{ 55.746687, 37.626768 }, new double[] { 55.981744, 37.414244 }, new double[] { 55.605058, 37.286292 }, new double[] { 55.821097, 37.641045 }, new double[] { 55.804719, 37.399596 }, new double[] { 55.415175, 37.901512 },new double[] { 55.508881, 37.849877 }, new double[] { 55.856560, 37.419901 }, new double[] { 55.676748, 37.893328 }, new double[] { 55.933302, 37.514230 }, new double[] { 55.561411, 38.117704 }, new double[] { 55.723060, 37.364715 } };
Region1 region1 = new Region1();
region1.UpdateWeekForecastAsync().Wait();
Console.WriteLine("Done");
Region2 region2 = new Region2();
region2.UpdateWeekForecastAsync().Wait();
Console.WriteLine("Done");
Region3 region3 = new Region3();
region3.UpdateWeekForecastAsync().Wait();
Console.WriteLine("Done");
Region4 region4 = new Region4();
region4.UpdateWeekForecastAsync().Wait();
Console.WriteLine("Done");
Region5 region5 = new Region5();
region5.UpdateWeekForecastAsync().Wait();
Console.WriteLine("Done");
Region6 region6 = new Region6();
region6.UpdateWeekForecastAsync().Wait();
Console.WriteLine("Done");
Region7 region7 = new Region7();
region7.UpdateWeekForecastAsync().Wait();
Console.WriteLine("Done");
Region8 region8 = new Region8();
region8.UpdateWeekForecastAsync().Wait();
Console.WriteLine("Done");
Region9 region9 = new Region9();
region9.UpdateWeekForecastAsync().Wait();
Console.WriteLine("Done");
Region10 region10 = new Region10();
region10.UpdateWeekForecastAsync().Wait();
Console.WriteLine("Done");
Region11 region11 = new Region11();
region11.UpdateWeekForecastAsync().Wait();
Console.WriteLine("Done");
Region12 region12 = new Region12();
region12.UpdateWeekForecastAsync().Wait();
Console.WriteLine("Complete");
DateTime LatestDate = DateTime.MinValue;
DateTime TempDateTime = DateTime.MinValue;
if (region1.FindLatestDate().HasValue)
{
    LatestDate = region1.FindLatestDate().Value;
    TempDateTime = region1.FindLatestDate().Value;
    Console.WriteLine("Offline weather is available until: " + LatestDate);
}

app.MapPost("/get-weather", async (HttpRequest request) =>
{
    try
    {
        if ((DateTime.Now - LatestDate).Days >= 5)
        {
            region1.UpdateWeekForecastAsync().Wait();
            region2.UpdateWeekForecastAsync().Wait();
            region3.UpdateWeekForecastAsync().Wait();
            region4.UpdateWeekForecastAsync().Wait();
            region5.UpdateWeekForecastAsync().Wait();
            region6.UpdateWeekForecastAsync().Wait();
            LatestDate = DateTime.Now;
        }
        if ((DateTime.Now - TempDateTime).Days >= 4)
        {
            region7.UpdateWeekForecastAsync().Wait();
            region8.UpdateWeekForecastAsync().Wait();
            region9.UpdateWeekForecastAsync().Wait();
            region10.UpdateWeekForecastAsync().Wait();
            region11.UpdateWeekForecastAsync().Wait();
            region12.UpdateWeekForecastAsync().Wait();
            TempDateTime = DateTime.Now;
        }
        var json = await JsonDocument.ParseAsync(request.Body);
        var root = json.RootElement;

        string address = root.GetProperty("address").GetString();
        string date = root.GetProperty("date").GetString();

        dynamic[] StoreLoc = new dynamic[3];

        for (int i = 0; i < LatitudeAndLongitude.StoreLocations.Length; i++)
        {
            if (LatitudeAndLongitude.StoreLocations[i][0] == address)
            {
                StoreLoc = LatitudeAndLongitude.StoreLocations[i];
            }
        }
        if (StoreLoc[0] == null)
        {
            return Results.NotFound("Точка не найдена");
        }

        CoordinateHelper coordinateHelper = new CoordinateHelper();
        Tuple<int, double[]> res = coordinateHelper.FindClosestCoordinate(StoreLoc[1], StoreLoc[2], RegionLoc);
        List<dynamic> result = new List<dynamic>();

        if (res.Item1 == 1)
        {
            result = region1.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 2)
        {
            result = region2.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 3)
        {
            result = region3.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 4)
        {
            result = region4.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 5)
        {
            result = region5.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 6)
        {
            result = region6.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 7)
        {
            result = region7.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 8)
        {
            result = region8.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 9)
        {
            result = region9.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 10)
        {
            result = region10.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 11)
        {
            result = region11.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 12)
        {
            result = region12.GetWeatherByDate(DateTime.Parse(date));
        }
        return Results.Ok(result.ToArray()[2]);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    
});
app.MapPost("/get-Precipitation", async (HttpRequest request) =>
{
    try
    {
        if ((DateTime.Now - LatestDate).Days >= 4)
        {
            region1.UpdateWeekForecastAsync().Wait();
            region2.UpdateWeekForecastAsync().Wait();
            region3.UpdateWeekForecastAsync().Wait();
            region4.UpdateWeekForecastAsync().Wait();
            region5.UpdateWeekForecastAsync().Wait();
            region6.UpdateWeekForecastAsync().Wait();
            region7.UpdateWeekForecastAsync().Wait();
            region8.UpdateWeekForecastAsync().Wait();
            region9.UpdateWeekForecastAsync().Wait();
            region10.UpdateWeekForecastAsync().Wait();
            region11.UpdateWeekForecastAsync().Wait();
            region12.UpdateWeekForecastAsync().Wait();
            LatestDate = DateTime.Now;
        }
        var json = await JsonDocument.ParseAsync(request.Body);
        var root = json.RootElement;

        string address = root.GetProperty("address").GetString();
        string date = root.GetProperty("date").GetString();

        dynamic[] StoreLoc = new dynamic[3];

        for (int i = 0; i < LatitudeAndLongitude.StoreLocations.Length; i++)
        {
            if (LatitudeAndLongitude.StoreLocations[i][0] == address)
            {
                StoreLoc = LatitudeAndLongitude.StoreLocations[i];
            }
        }
        if (StoreLoc[0] == null)
        {
            return Results.NotFound("Точка не найдена");
        }

        CoordinateHelper coordinateHelper = new CoordinateHelper();
        Tuple<int, double[]> res = coordinateHelper.FindClosestCoordinate(StoreLoc[1], StoreLoc[2], RegionLoc);
        List<dynamic> result = new List<dynamic>();

        if (res.Item1 == 1)
        {
            result = region1.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 2)
        {
            result = region2.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 3)
        {
            result = region3.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 4)
        {
            result = region4.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 5)
        {
            result = region5.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 6)
        {
            result = region6.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 7)
        {
            result = region7.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 8)
        {
            result = region8.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 9)
        {
            result = region9.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 10)
        {
            result = region10.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 11)
        {
            result = region11.GetWeatherByDate(DateTime.Parse(date));
        }
        if (res.Item1 == 12)
        {
            result = region12.GetWeatherByDate(DateTime.Parse(date));
        }
        dynamic[] resFinal = result.ToArray();
        for (int i = 0; i < resFinal.Length; i++)
        {
            try
            {
                if (resFinal[i] is string && (resFinal[i] == "Ветер," || resFinal[i] == "Штиль,"))
                {
                    return Results.Ok(resFinal[i - 1]);
                }
            }
            catch
            {
            }

        }
        return Results.Ok(resFinal);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});



app.Run("http://localhost:5000");

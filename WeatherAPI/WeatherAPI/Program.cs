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
double[][] RegionLoc = new double[][] { new double[]{ 55.388578, 37.541027 }, new double[] { 55.508881, 37.849877 }, new double[] { 55.561670, 38.117736 }, new double[] { 55.604585, 37.285420 }, new double[] { 55.605058, 37.286292 }, new double[] { 55.676748, 37.893328 },new double[] { 55.723060, 37.364715 }, new double[] { 55.746687, 37.626768 }, new double[] { 55.804719, 37.399596 }, new double[] { 55.821097, 37.641045 }, new double[] { 55.858382, 37.431441 }, new double[] { 55.933302, 37.514230 } };
Region1 region1 = new Region1();
Region2 region2 = new Region2();
Region3 region3 = new Region3();
Region4 region4 = new Region4();
Region5 region5 = new Region5();
Region6 region6 = new Region6();
Region7 region7 = new Region7();
Region8 region8 = new Region8();
Region9 region9 = new Region9();
Region10 region10 = new Region10();
Region11 region11 = new Region11();
Region12 region12 = new Region12();
Console.WriteLine("Complete");
app.MapPost("/get-weather", async (HttpRequest request) =>
{
    try
    {
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

        return Results.Ok(result.ToArray());
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});



app.Run("http://localhost:5000");

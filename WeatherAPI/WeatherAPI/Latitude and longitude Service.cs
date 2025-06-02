
using Newtonsoft.Json;
using System.Text.Json;

namespace WeatherAPI
{
    public class CoordinateHelper
    {
        public Tuple<int, double[]> FindClosestCoordinate(double latitude, double longitude, double[][] coordinates)
        {
            if (coordinates == null || coordinates.Length == 0)
                return null;

            int closestIndex = -1;
            double minDistance = double.MaxValue;

            for (int i = 0; i < coordinates.Length; i++)
            {
                double[] coord = coordinates[i];
                double dLat = latitude - coord[0];
                double dLon = longitude - coord[1];
                double distance = Math.Sqrt(dLat * dLat + dLon * dLon);

                if (distance < minDistance)
                {
                    minDistance = distance;
                    closestIndex = i;
                }
            }

            return Tuple.Create(closestIndex, coordinates[closestIndex]);
        }
    }
    static class LatitudeAndLongitude
    {
        public static dynamic[][] StoreLocations = new dynamic[][] {
    new dynamic[] { "ОБРУЧЕВА 11", 55.660226, 37.515146 },
    new dynamic[] { "БЕЛОМОРСКАЯ 26 КОРП 2", 55.864162, 37.474354 },
    new dynamic[] { "РЕУТОВ ЛЕНИНА 15", 55.755723, 37.856919 },
    new dynamic[] { "НИЖНЯЯ КРАСНОСЕЛЬСКАЯ 45/17", 55.773034, 37.675765 },
    new dynamic[] { "БАУМАНСКАЯ 33/2 СТР 8", 55.772386, 37.680113 },
    new dynamic[] { "НОВОКУЗНЕЦКАЯ 43/16", 55.731602, 37.636087 },
    new dynamic[] { "КРАСНОГОРСК, ПОДМОСКОВНЫЙ Б-Р, 8", 55.820546, 37.368676 },
    new dynamic[] { "ПРОИЗВОДСТВЕННАЯ 8 КОРП 2", 55.645852, 37.389059 },
    new dynamic[] { "ВОЛГОГРАДСКИЙ ПР-КТ 98 КОРП 2", 55.7039, 37.773062 },
    new dynamic[] { "КРАСНОГОРСК ЗНАМЕНСКАЯ около д.12", 55.818159, 37.340514 },
    new dynamic[] { "ЖУРАВЛЕВА 2 СТР 2", 55.784015, 37.702292 },
    new dynamic[] { "НОВОПЕТРОВСКАЯ 16", 55.827166, 37.522854 },
    new dynamic[] { "БАЖОВА 8", 55.832879, 37.662102 },
    new dynamic[] { "БАГРИЦКОГО 3 КОРП 1", 55.723972, 37.437182 },
    new dynamic[] { "КРАСНОГОРСК, ОПАЛИХА, НОВО-НИКОЛЬСКАЯ", 55.839406, 37.24726 },
    new dynamic[] { "ВЕРХНЯЯ КРАСНОСЕЛЬСКАЯ 10", 55.784192, 37.66106 },
    new dynamic[] { "ОЛИМПИЙСКАЯ ДЕРЕВНЯ 4 КОРП 3", 55.675352, 37.470662 },
    new dynamic[] { "ЛЕСТЕВА 21/61 КОРП 1", 55.714414, 37.608526 },
    new dynamic[] { "РОЖДЕСТВЕНКА 5/7 СТР 2", 55.761153, 37.623304 },
    new dynamic[] { "ЛОМОНОСОВСКИЙ ПРОСПЕКТ 23", 55.691531, 37.538134 },
    new dynamic[] { "ОКТЯБРЬСКАЯ 9/1", 55.786242, 37.61353 },
    new dynamic[] { "БАКУНИНСКАЯ 8", 55.773403, 37.680598 },
    new dynamic[] { "ЛЮБЕРЦЫ, БАРЫКИНА 2", 55.706893, 37.955707 },
    new dynamic[] { "СРЕТЕНКА 21/28 СТР 1", 55.770512, 37.632152 },
    new dynamic[] { "ОТКРЫТОЕ ШОССЕ 3 стр 4А", 55.813668, 37.729925 },
    new dynamic[] { "ЛАЗОРЕВЫЙ ПРОЕЗД 1А КОРП 3", 55.8473, 37.637578 },
    new dynamic[] { "ИСТРА ЛЕНИНА 17", 55.907748, 36.858505 },
    new dynamic[] { "НАХАБИНО ШКОЛЬНАЯ 8А", 55.841387, 37.144133 },
    new dynamic[] { "БОЛЬШАЯ СЕРПУХОВСКАЯ 19/37 СТР2", 55.726664, 37.626178 },
    new dynamic[] { "ПРОФСОЮЗНАЯ 15", 55.679514, 37.565335 },
    new dynamic[] { "ВОРОНЦОВСКАЯ 48", 55.732692, 37.66406 },
    new dynamic[] { "ПРОСПЕКТ МИРА 95", 55.807602, 37.635422 },
    new dynamic[] { "БОЛЬШАЯ ЧЕРКИЗОВСКАЯ 6", 55.796203, 37.719594 },
    new dynamic[] { "ЖУКОВСКИЙ ЧКАЛОВА 28А", 55.598146, 38.124303 },
    new dynamic[] { "ИНИЦИАТИВНАЯ", 55.682422, 37.904315 },
    new dynamic[] { "СВОБОДНЫЙ ПРОСПЕКТ", 55.757688, 37.819577 },
    new dynamic[] { "МОСКВА СИТИ", 55.750535, 37.536535 },
    new dynamic[] { "НОВИНКИ", 55.810157, 37.137701 },
    new dynamic[] { "КУСТАНАЙСКАЯ", 55.620037, 37.752895 },
    new dynamic[] { "ЛЕНИНГРАДСКИЙ 62", 55.800898, 37.533751 },
    new dynamic[] { "ЯНА РАЙНИСА", 55.848812, 37.420904 },
    new dynamic[] { "КРАСНОГОРСК", 55.820546, 37.368676 },
    new dynamic[] { "Долгопрудный2", 55.933302, 37.51423 },
    new dynamic[] { "РИЖСКИЙ ПРОЕЗД", 55.814907, 37.661518 },
    new dynamic[] { "БИРЮЗОВА  19", 55.794355, 37.491108 },
    new dynamic[] { "ЧОНГАРСКИЙ Б-Р", 55.65366, 37.614365 },
    new dynamic[] { "АЭРОПОРТ2", 53.251972, 50.378806 },
    new dynamic[] { "НИЖНИЙ СУСАЛЬНЫЙ МОЛОКО", 55.761457, 37.662758 },
    new dynamic[] { "ШМИТОВСКИЙ ПРОЕЗД 10/7", 55.759167, 37.552696 },
    new dynamic[] { "9 ПАРКОВАЯ 59", 55.807805, 37.798143 },
    new dynamic[] { "ПР-КТ ВЕРНАДСКОГО 39", 55.67559, 37.506038 },
    new dynamic[] { "СОВХОЗНАЯ 12", 55.677387, 37.763324 },
    new dynamic[] { "АРБАТ 18", 55.750464, 37.593938 },
    new dynamic[] { "КОМСОМОЛЬСКИЙ ПРОСПЕКТ", 55.691004, 37.905923 },
    new dynamic[] { "ТУХАЧЕВСКОГО", 55.784258, 37.472072 },
    new dynamic[] { "БОЛЬШАЯ ДМИТРОВКА", 55.762373, 37.613629 },
    new dynamic[] { "НОВОГИРЕЕВО 2", 55.75206, 37.816226 },
    new dynamic[] { "ФАКЕЛЬНЫЙ", 55.740816, 37.666468 },
    new dynamic[] { "БОЛЬШАЯ ДМИТРОВКА-АЛКОГОЛЬ", 55.762373, 37.613629 },
    new dynamic[] { "ВЕШНЯКОВСКАЯ", 55.725062, 37.827778 },
    new dynamic[] { "ЛОМОНОСОВСКИЙ", 55.691531, 37.538134 },
    new dynamic[] { "ЮЖНОБУТОВСКАЯ", 55.536237, 37.528981 },
    new dynamic[] { "МАРЬИНО", 55.650902, 37.742591 },
    new dynamic[] { "Измайлово", 55.788717, 37.741908 },
    new dynamic[] { "ЖЕЛЕЗНОДОРОЖНЫЙ", 55.746436, 38.009049 },
    new dynamic[] { "БРАТИСЛАВСКАЯ", 55.659119, 37.751664 },
    new dynamic[] { "МОЖАЙКА", 55.718359, 37.415011 },
    new dynamic[] { "МИНСКАЯ 14", 55.737816, 37.485691 },
    new dynamic[] { "СОКОЛ3 Ленинградский пр-кт,75Г,1", 55.803282, 37.512766 },
    new dynamic[] { "ЛУБЯНКА", 55.758934, 37.625262 },
    new dynamic[] { "ЛЕНИНСКИЙ", 55.682874, 37.536976 },
    new dynamic[] { "Домодедовская", 55.60968, 37.720106 },
    new dynamic[] { "ПЕРВОМАЙСКАЯ", 55.795049, 37.799921 },
    new dynamic[] { "ПЕРОВО", 55.751335, 37.785234 },
    new dynamic[] { "Академическая", 55.686858, 37.573258 },
    new dynamic[] { "КРАСНОГОРСК 2 МФ", 55.800099, 37.373581 },
    new dynamic[] { "НАГОРНЫЙ БУЛЬВАР", 55.673016, 37.595222 },
    new dynamic[] { "АВИАЦИОННАЯ 77", 55.807987, 37.450746 },
    new dynamic[] { "ЛЕНИНСКИЙ ПРОСПЕКТ 131", 55.644145, 37.473492 },
    new dynamic[] { "ПРОФСОЮЗНАЯ 104", 55.64192, 37.523465 },
    new dynamic[] { "ОСЕННИЙ Б-Р", 55.758038, 37.407474 },
    new dynamic[] { "РОГОЖКА", 55.346363, 37.621112 },
    new dynamic[] { "KРАСНОГОРСК 2", 55.81604, 37.361112 },
    new dynamic[] { "БЕСКУДНИКОВО", 55.882187, 37.567698 },
    new dynamic[] { "РЕУТОВ ЮБИЛЕЙНЫЙ", 55.750788, 37.869649 },
    new dynamic[] { "БРАТСКАЯ МОЛОКО", 55.749658, 37.790336 },
    new dynamic[] { "ПРОСПЕКТ МИРА 116", 55.808973, 37.637982 },
    new dynamic[] { "Б. ЧЕРКИЗОВСКАЯ", 55.796203, 37.719594 },
    new dynamic[] { "НЕГЛИННАЯ", 55.76604, 37.620267 },
    new dynamic[] { "БРАТИСЛАВСКАЯ 6", 55.664152, 37.7532 },
    new dynamic[] { "КРАСНОГОРСК, НАХАБИНО, ИНСТИТУТСКАЯ 26", 55.841453, 37.182985 },
    new dynamic[] { "ПЛАНЕРНАЯ", 55.861216, 37.43587 },
    new dynamic[] { "МЫТНАЯ 52", 55.717523, 37.618623 },
    new dynamic[] { "ПРОФСОЮЗНАЯ", 55.679514, 37.565335 },
    new dynamic[] { "МАСТЕРКОВА", 55.70881, 37.657565 },
    new dynamic[] { "ЗЕМЛЯНОЙ ВАЛ", 55.753301, 37.656272 },
    new dynamic[] { "ШОССЕ ЭНТУЗИАСТОВ", 55.757024, 37.750793 },
    new dynamic[] { "КУЗЬМИНКИ", 55.704098, 37.765785 },
    new dynamic[] { "ЗЕЛЕНЫЙ ПР-КТ 54 МОЛОКО", 55.751376, 37.81336 },
    new dynamic[] { "СОКОЛ2", 55.880268, 36.952684 },
    new dynamic[] { "ЛЕСНАЯ 8", 55.810142, 37.080101 }
};
    }

    public class Region1
    {
        List<List<dynamic>> Data = new List<List<dynamic>>() {};


        public void SaveData(List<List<dynamic>> data, string path = "CashedRegions/Region1.json")
        {
            string directory = Path.GetDirectoryName(path);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            string json = JsonConvert.SerializeObject(data);
            File.WriteAllText(path, json);
        }

        public List<List<dynamic>> LoadData(string path = "CashedRegions/Region1.json")
        {
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Файл не найден: {path}");
            }
            string json = File.ReadAllText(path);
            if (json.Length <= 10)
            {
                return null;
            }
            return JsonConvert.DeserializeObject<List<List<dynamic>>>(json);
        }

        public Region1()
        {
            
                Data = LoadData();
                if (Data != null)
                {
                    return;
                }
                Data = new List<List<dynamic>>() { };
            try
                {
                    // Open the text file using a stream reader.
                    using StreamReader reader = new("Regions/Region1.txt");

                    // Read the stream as a string.
                    Task<String> text = reader.ReadToEndAsync();
                    text.Wait();
                    // Write the text to the console.
                    string[] SplitStr = text.Result.Replace('\t', ' ').Replace('\r', ' ').Replace('\n', ' ').Split(' ');
                    bool IsAll = false;
                    List<dynamic> FirstData = new List<dynamic>();
                    for (int i = 0; i < SplitStr.Length; i++)
                    {
                        Console.WriteLine("Region1 Complete: " + i + "/" + SplitStr.Length);
                        try
                        {
                            DateTime dt = DateTime.ParseExact(SplitStr[i] + " " + SplitStr[i + 1], "dd.MM.yyyy HH:mm", null);

                            if (IsAll == true)
                            {
                                Data.Add(FirstData);
                                FirstData = new List<dynamic>();
                                IsAll = false;
                            }
                            FirstData.Add(dt);
                            IsAll = true;
                        }
                        catch
                        {
                            FirstData.Add(SplitStr[i]);
                        }
                    }
                    SaveData(Data);

                }
                catch (IOException e)
                {
                    Console.WriteLine("The file could not be read:");
                    Console.WriteLine(e.Message);
                }
            
        }
        public double[] LatitudeAndLongitudeOfRegion()
        {
            double[] Region = [55.388578, 37.541027];
            return Region;
        }
        public List<dynamic> GetWeatherByDate(DateTime date)
        {
            for (int i = 0; i < Data.Count; i++)
            {
                if (Data[i][0] == date)
                {
                    return Data[i];
                }
            }
            return [];
        }
    }
    public class Region2
    {
        List<List<dynamic>> Data = new List<List<dynamic>>() { };


        public void SaveData(List<List<dynamic>> data, string path = "CashedRegions/Region2.json")
        {
            string directory = Path.GetDirectoryName(path);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            string json = JsonConvert.SerializeObject(data);
            File.WriteAllText(path, json);
        }

        public List<List<dynamic>> LoadData(string path = "CashedRegions/Region2.json")
        {
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Файл не найден: {path}");
            }
            string json = File.ReadAllText(path);
            if (json.Length <= 10)
            {
                return null;
            }
            return JsonConvert.DeserializeObject<List<List<dynamic>>>(json);
        }
        public Region2()
        {
            Data = LoadData();
            if (Data != null)
            {
                return;
            }
            Data = new List<List<dynamic>>() { };
            try
            {
                // Open the text file using a stream reader.
                using StreamReader reader = new("Regions/Region2.txt");

                // Read the stream as a string.
                Task<String> text = reader.ReadToEndAsync();
                text.Wait();
                // Write the text to the console.
                string[] SplitStr = text.Result.Replace('\t', ' ').Replace('\r', ' ').Replace('\n', ' ').Split(' ');
                bool IsAll = false;
                List<dynamic> FirstData = new List<dynamic>();
                for (int i = 0; i < SplitStr.Length; i++)
                {
                    try
                    {
                        DateTime dt = DateTime.ParseExact(SplitStr[i] + " " + SplitStr[i + 1], "dd.MM.yyyy HH:mm", null);

                        if (IsAll == true)
                        {
                            Data.Add(FirstData);
                            FirstData = new List<dynamic>();
                            IsAll = false;
                        }
                        FirstData.Add(dt);
                        IsAll = true;
                    }
                    catch
                    {
                        FirstData.Add(SplitStr[i]);
                    }
                }
                SaveData(Data);

            }
            catch (IOException e)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(e.Message);
            }
        }
        public double[] LatitudeAndLongitudeOfRegion()
        {
            double[] Region = [55.508881, 37.849877];
            return Region;
        }
        public List<dynamic> GetWeatherByDate(DateTime date)
        {
            for (int i = 0; i < Data.Count; i++)
            {
                if (Data[i][0] == date)
                {
                    return Data[i];
                }
            }
            return [];
        }
    }
    public class Region3
    {
        List<List<dynamic>> Data = new List<List<dynamic>>() { };


        public void SaveData(List<List<dynamic>> data, string path = "CashedRegions/Region3.json")
        {
            string directory = Path.GetDirectoryName(path);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            string json = JsonConvert.SerializeObject(data);
            File.WriteAllText(path, json);
        }

        public List<List<dynamic>> LoadData(string path = "CashedRegions/Region3.json")
        {
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Файл не найден: {path}");
            }
            string json = File.ReadAllText(path);
            if (json.Length <= 10)
            {
                return null;
            }
            return JsonConvert.DeserializeObject<List<List<dynamic>>>(json);
        }
        public Region3()
        {
            Data = LoadData();
            if (Data != null)
            {
                return;
            }
            Data = new List<List<dynamic>>() { };
            try
            {
                // Open the text file using a stream reader.
                using StreamReader reader = new("Regions/Region3.txt");

                // Read the stream as a string.
                Task<String> text = reader.ReadToEndAsync();
                text.Wait();
                // Write the text to the console.
                string[] SplitStr = text.Result.Replace('\t', ' ').Replace('\r', ' ').Replace('\n', ' ').Split(' ');
                bool IsAll = false;
                List<dynamic> FirstData = new List<dynamic>();
                for (int i = 0; i < SplitStr.Length; i++)
                {
                    try
                    {
                        DateTime dt = DateTime.ParseExact(SplitStr[i] + " " + SplitStr[i + 1], "dd.MM.yyyy HH:mm", null);

                        if (IsAll == true)
                        {
                            Data.Add(FirstData);
                            FirstData = new List<dynamic>();
                            IsAll = false;
                        }
                        FirstData.Add(dt);
                        IsAll = true;
                    }
                    catch
                    {
                        FirstData.Add(SplitStr[i]);
                    }
                }

            }
            catch (IOException e)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(e.Message);
            }
            SaveData(Data);
        }
        public double[] LatitudeAndLongitudeOfRegion()
        {
            double[] Region = [55.561670, 38.117736];
            return Region;
        }
        public List<dynamic> GetWeatherByDate(DateTime date)
        {
            for (int i = 0; i < Data.Count; i++)
            {
                if (Data[i][0] == date)
                {
                    return Data[i];
                }
            }
            return [];
        }
    }
    public class Region4
    {
        List<List<dynamic>> Data = new List<List<dynamic>>() { };


        public void SaveData(List<List<dynamic>> data, string path = "CashedRegions/Region4.json")
        {
            string directory = Path.GetDirectoryName(path);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            string json = JsonConvert.SerializeObject(data);
            File.WriteAllText(path, json);
        }

        public List<List<dynamic>> LoadData(string path = "CashedRegions/Region4.json")
        {
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Файл не найден: {path}");
            }
            string json = File.ReadAllText(path);
            if (json.Length <= 10)
            {
                return null;
            }
            return JsonConvert.DeserializeObject<List<List<dynamic>>>(json);
        }
        public Region4()
        {
            Data = LoadData();
            if (Data != null)
            {
                return;
            }
            Data = new List<List<dynamic>>() { };
            try
            {
                // Open the text file using a stream reader.
                using StreamReader reader = new("Regions/Region4.txt");

                // Read the stream as a string.
                Task<String> text = reader.ReadToEndAsync();
                text.Wait();
                // Write the text to the console.
                string[] SplitStr = text.Result.Replace('\t', ' ').Replace('\r', ' ').Replace('\n', ' ').Split(' ');
                bool IsAll = false;
                List<dynamic> FirstData = new List<dynamic>();
                for (int i = 0; i < SplitStr.Length; i++)
                {
                    try
                    {
                        DateTime dt = DateTime.ParseExact(SplitStr[i] + " " + SplitStr[i + 1], "dd.MM.yyyy HH:mm", null);

                        if (IsAll == true)
                        {
                            Data.Add(FirstData);
                            FirstData = new List<dynamic>();
                            IsAll = false;
                        }
                        FirstData.Add(dt);
                        IsAll = true;
                    }
                    catch
                    {
                        FirstData.Add(SplitStr[i]);
                    }
                }

            }
            catch (IOException e)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(e.Message);
            }
            SaveData(Data);
        }
        public double[] LatitudeAndLongitudeOfRegion()
        {
            double[] Region = [55.604585, 37.285420];
            return Region;
        }
        public List<dynamic> GetWeatherByDate(DateTime date)
        {
            for (int i = 0; i < Data.Count; i++)
            {
                if (Data[i][0] == date)
                {
                    return Data[i];
                }
            }
            return [];
        }
    }
    public class Region5
    {
        List<List<dynamic>> Data = new List<List<dynamic>>() { };


        public void SaveData(List<List<dynamic>> data, string path = "CashedRegions/Region5.json")
        {
            string directory = Path.GetDirectoryName(path);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            string json = JsonConvert.SerializeObject(data);
            File.WriteAllText(path, json);
        }

        public List<List<dynamic>> LoadData(string path = "CashedRegions/Region5.json")
        {
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Файл не найден: {path}");
            }
            string json = File.ReadAllText(path);
            if (json.Length <= 10)
            {
                return null;
            }
            return JsonConvert.DeserializeObject<List<List<dynamic>>>(json);
        }
        public Region5()
        {
            Data = LoadData();
            if (Data != null)
            {
                return;
            }
            Data = new List<List<dynamic>>() { };
            try
            {
                // Open the text file using a stream reader.
                using StreamReader reader = new("Regions/Region5.txt");

                // Read the stream as a string.
                Task<String> text = reader.ReadToEndAsync();
                text.Wait();
                // Write the text to the console.
                string[] SplitStr = text.Result.Replace('\t', ' ').Replace('\r', ' ').Replace('\n', ' ').Split(' ');
                bool IsAll = false;
                List<dynamic> FirstData = new List<dynamic>();
                for (int i = 0; i < SplitStr.Length; i++)
                {
                    try
                    {
                        DateTime dt = DateTime.ParseExact(SplitStr[i] + " " + SplitStr[i + 1], "dd.MM.yyyy HH:mm", null);

                        if (IsAll == true)
                        {
                            Data.Add(FirstData);
                            FirstData = new List<dynamic>();
                            IsAll = false;
                        }
                        FirstData.Add(dt);
                        IsAll = true;
                    }
                    catch
                    {
                        FirstData.Add(SplitStr[i]);
                    }
                }

            }
            catch (IOException e)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(e.Message);
            }
            SaveData(Data);
        }
        public double[] LatitudeAndLongitudeOfRegion()
        {
            double[] Region = [55.605058, 37.286292];
            return Region;
        }
        public List<dynamic> GetWeatherByDate(DateTime date)
        {
            for (int i = 0; i < Data.Count; i++)
            {
                if (Data[i][0] == date)
                {
                    return Data[i];
                }
            }
            return [];
        }
    }
    public class Region6
    {
        List<List<dynamic>> Data = new List<List<dynamic>>() { };


        public void SaveData(List<List<dynamic>> data, string path = "CashedRegions/Region6.json")
        {
            string directory = Path.GetDirectoryName(path);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            string json = JsonConvert.SerializeObject(data);
            File.WriteAllText(path, json);
        }

        public List<List<dynamic>> LoadData(string path = "CashedRegions/Region6.json")
        {
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Файл не найден: {path}");
            }
            string json = File.ReadAllText(path);
            if (json.Length <= 10)
            {
                return null;
            }
            return JsonConvert.DeserializeObject<List<List<dynamic>>>(json);
        }
        public Region6()
        {
            Data = LoadData();
            if (Data != null)
            {
                return;
            }
            Data = new List<List<dynamic>>() { };
            try
            {
                // Open the text file using a stream reader.
                using StreamReader reader = new("Regions/Region6.txt");

                // Read the stream as a string.
                Task<String> text = reader.ReadToEndAsync();
                text.Wait();
                // Write the text to the console.
                string[] SplitStr = text.Result.Replace('\t', ' ').Replace('\r', ' ').Replace('\n', ' ').Split(' ');
                bool IsAll = false;
                List<dynamic> FirstData = new List<dynamic>();
                for (int i = 0; i < SplitStr.Length; i++)
                {
                    try
                    {
                        DateTime dt = DateTime.ParseExact(SplitStr[i] + " " + SplitStr[i + 1], "dd.MM.yyyy HH:mm", null);

                        if (IsAll == true)
                        {
                            Data.Add(FirstData);
                            FirstData = new List<dynamic>();
                            IsAll = false;
                        }
                        FirstData.Add(dt);
                        IsAll = true;
                    }
                    catch
                    {
                        FirstData.Add(SplitStr[i]);
                    }
                }

            }
            catch (IOException e)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(e.Message);
            }
            SaveData(Data);
        }
        public double[] LatitudeAndLongitudeOfRegion()
        {
            double[] Region = [55.676748, 37.893328];
            return Region;
        }
        public List<dynamic> GetWeatherByDate(DateTime date)
        {
            for (int i = 0; i < Data.Count; i++)
            {
                if (Data[i][0] == date)
                {
                    return Data[i];
                }
            }
            return [];
        }
    }
    public class Region7
    {
        List<List<dynamic>> Data = new List<List<dynamic>>() { };


        public void SaveData(List<List<dynamic>> data, string path = "CashedRegions/Region7.json")
        {
            string directory = Path.GetDirectoryName(path);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            string json = JsonConvert.SerializeObject(data);
            File.WriteAllText(path, json);
        }

        public List<List<dynamic>> LoadData(string path = "CashedRegions/Region7.json")
        {
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Файл не найден: {path}");
            }
            string json = File.ReadAllText(path);
            if (json.Length <= 10)
            {
                return null;
            }
            return JsonConvert.DeserializeObject<List<List<dynamic>>>(json);
        }
        public Region7()
        {
            Data = LoadData();
            if (Data != null)
            {
                return;
            }
            Data = new List<List<dynamic>>() { };
            try
            {
                // Open the text file using a stream reader.
                using StreamReader reader = new("Regions/Region7.txt");

                // Read the stream as a string.
                Task<String> text = reader.ReadToEndAsync();
                text.Wait();
                // Write the text to the console.
                string[] SplitStr = text.Result.Replace('\t', ' ').Replace('\r', ' ').Replace('\n', ' ').Split(' ');
                bool IsAll = false;
                List<dynamic> FirstData = new List<dynamic>();
                for (int i = 0; i < SplitStr.Length; i++)
                {
                    try
                    {
                        DateTime dt = DateTime.ParseExact(SplitStr[i] + " " + SplitStr[i + 1], "dd.MM.yyyy HH:mm", null);

                        if (IsAll == true)
                        {
                            Data.Add(FirstData);
                            FirstData = new List<dynamic>();
                            IsAll = false;
                        }
                        FirstData.Add(dt);
                        IsAll = true;
                    }
                    catch
                    {
                        FirstData.Add(SplitStr[i]);
                    }
                }

            }
            catch (IOException e)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(e.Message);
            }
            SaveData(Data);
        }
        public double[] LatitudeAndLongitudeOfRegion()
        {
            double[] Region = [55.723060, 37.364715];
            return Region;
        }
        public List<dynamic> GetWeatherByDate(DateTime date)
        {
            for (int i = 0; i < Data.Count; i++)
            {
                if (Data[i][0] == date)
                {
                    return Data[i];
                }
            }
            return [];
        }
    }
    public class Region8
    {
        List<List<dynamic>> Data = new List<List<dynamic>>() { };


        public void SaveData(List<List<dynamic>> data, string path = "CashedRegions/Region8.json")
        {
            string directory = Path.GetDirectoryName(path);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            string json = JsonConvert.SerializeObject(data);
            File.WriteAllText(path, json);
        }

        public List<List<dynamic>> LoadData(string path = "CashedRegions/Region8.json")
        {
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Файл не найден: {path}");
            }
            string json = File.ReadAllText(path);
            if (json.Length <= 10)
            {
                return null;
            }
            return JsonConvert.DeserializeObject<List<List<dynamic>>>(json);
        }
        public Region8()
        {
            Data = LoadData();
            if (Data != null)
            {
                return;
            }
            Data = new List<List<dynamic>>() { };
            try
            {
                // Open the text file using a stream reader.
                using StreamReader reader = new("Regions/Region8.txt");

                // Read the stream as a string.
                Task<String> text = reader.ReadToEndAsync();
                text.Wait();
                // Write the text to the console.
                string[] SplitStr = text.Result.Replace('\t', ' ').Replace('\r', ' ').Replace('\n', ' ').Split(' ');
                bool IsAll = false;
                List<dynamic> FirstData = new List<dynamic>();
                for (int i = 0; i < SplitStr.Length; i++)
                {
                    try
                    {
                        DateTime dt = DateTime.ParseExact(SplitStr[i] + " " + SplitStr[i + 1], "dd.MM.yyyy HH:mm", null);

                        if (IsAll == true)
                        {
                            Data.Add(FirstData);
                            FirstData = new List<dynamic>();
                            IsAll = false;
                        }
                        FirstData.Add(dt);
                        IsAll = true;
                    }
                    catch
                    {
                        FirstData.Add(SplitStr[i]);
                    }
                }

            }
            catch (IOException e)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(e.Message);
            }
            SaveData(Data);
        }
        public double[] LatitudeAndLongitudeOfRegion()
        {
            double[] Region = [55.746687, 37.626768];
            return Region;
        }
        public List<dynamic> GetWeatherByDate(DateTime date)
        {
            for (int i = 0; i < Data.Count; i++)
            {
                if (Data[i][0] == date)
                {
                    return Data[i];
                }
            }
            return [];
        }
    }
    public class Region9
    {
        List<List<dynamic>> Data = new List<List<dynamic>>() { };


        public void SaveData(List<List<dynamic>> data, string path = "CashedRegions/Region9.json")
        {
            string directory = Path.GetDirectoryName(path);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            string json = JsonConvert.SerializeObject(data);
            File.WriteAllText(path, json);
        }

        public List<List<dynamic>> LoadData(string path = "CashedRegions/Region9.json")
        {
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Файл не найден: {path}");
            }
            string json = File.ReadAllText(path);
            if (json.Length <= 10)
            {
                return null;
            }
            return JsonConvert.DeserializeObject<List<List<dynamic>>>(json);
        }
        public Region9()
        {
            Data = LoadData();
            if (Data != null)
            {
                return;
            }
            Data = new List<List<dynamic>>() { };
            try
            {
                // Open the text file using a stream reader.
                using StreamReader reader = new("Regions/Region9.txt");

                // Read the stream as a string.
                Task<String> text = reader.ReadToEndAsync();
                text.Wait();
                // Write the text to the console.
                string[] SplitStr = text.Result.Replace('\t', ' ').Replace('\r', ' ').Replace('\n', ' ').Split(' ');
                bool IsAll = false;
                List<dynamic> FirstData = new List<dynamic>();
                for (int i = 0; i < SplitStr.Length; i++)
                {
                    try
                    {
                        DateTime dt = DateTime.ParseExact(SplitStr[i] + " " + SplitStr[i + 1], "dd.MM.yyyy HH:mm", null);

                        if (IsAll == true)
                        {
                            Data.Add(FirstData);
                            FirstData = new List<dynamic>();
                            IsAll = false;
                        }
                        FirstData.Add(dt);
                        IsAll = true;
                    }
                    catch
                    {
                        FirstData.Add(SplitStr[i]);
                    }
                }

            }
            catch (IOException e)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(e.Message);
            }
            SaveData(Data);
        }
        public double[] LatitudeAndLongitudeOfRegion()
        {
            double[] Region = [55.804719, 37.399596];
            return Region;
        }
        public List<dynamic> GetWeatherByDate(DateTime date)
        {
            for (int i = 0; i < Data.Count; i++)
            {
                if (Data[i][0] == date)
                {
                    return Data[i];
                }
            }
            return [];
        }
    }
    public class Region10
    {
        List<List<dynamic>> Data = new List<List<dynamic>>() { };


        public void SaveData(List<List<dynamic>> data, string path = "CashedRegions/Region10.json")
        {
            string directory = Path.GetDirectoryName(path);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            string json = JsonConvert.SerializeObject(data);
            File.WriteAllText(path, json);
        }

        public List<List<dynamic>> LoadData(string path = "CashedRegions/Region10.json")
        {
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Файл не найден: {path}");
            }
            string json = File.ReadAllText(path);
            if (json.Length <= 10)
            {
                return null;
            }
            return JsonConvert.DeserializeObject<List<List<dynamic>>>(json);
        }
        public Region10()
        {
            Data = LoadData();
            if (Data != null)
            {
                return;
            }
            Data = new List<List<dynamic>>() { };
            try
            {
                // Open the text file using a stream reader.
                using StreamReader reader = new("Regions/Region10.txt");

                // Read the stream as a string.
                Task<String> text = reader.ReadToEndAsync();
                text.Wait();
                // Write the text to the console.
                string[] SplitStr = text.Result.Replace('\t', ' ').Replace('\r', ' ').Replace('\n', ' ').Split(' ');
                bool IsAll = false;
                List<dynamic> FirstData = new List<dynamic>();
                for (int i = 0; i < SplitStr.Length; i++)
                {
                    try
                    {
                        DateTime dt = DateTime.ParseExact(SplitStr[i] + " " + SplitStr[i + 1], "dd.MM.yyyy HH:mm", null);

                        if (IsAll == true)
                        {
                            Data.Add(FirstData);
                            FirstData = new List<dynamic>();
                            IsAll = false;
                        }
                        FirstData.Add(dt);
                        IsAll = true;
                    }
                    catch
                    {
                        FirstData.Add(SplitStr[i]);
                    }
                }

            }
            catch (IOException e)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(e.Message);
            }
            SaveData(Data);
        }
        public double[] LatitudeAndLongitudeOfRegion()
        {
            double[] Region = [55.821097, 37.641045];
            return Region;
        }
        public List<dynamic> GetWeatherByDate(DateTime date)
        {
            for (int i = 0; i < Data.Count; i++)
            {
                if (Data[i][0] == date)
                {
                    return Data[i];
                }
            }
            return [];
        }
    }
    public class Region11
    {
        List<List<dynamic>> Data = new List<List<dynamic>>() { };


        public void SaveData(List<List<dynamic>> data, string path = "CashedRegions/Region11.json")
        {
            string directory = Path.GetDirectoryName(path);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            string json = JsonConvert.SerializeObject(data);
            File.WriteAllText(path, json);
        }

        public List<List<dynamic>> LoadData(string path = "CashedRegions/Region11.json")
        {
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Файл не найден: {path}");
            }
            string json = File.ReadAllText(path);
            if (json.Length <= 10)
            {
                return null;
            }
            return JsonConvert.DeserializeObject<List<List<dynamic>>>(json);
        }
        public Region11()
        {
            Data = LoadData();
            if (Data != null)
            {
                return;
            }
            Data = new List<List<dynamic>>() { };
            try
            {
                // Open the text file using a stream reader.
                using StreamReader reader = new("Regions/Region11.txt");

                // Read the stream as a string.
                Task<String> text = reader.ReadToEndAsync();
                text.Wait();
                // Write the text to the console.
                string[] SplitStr = text.Result.Replace('\t', ' ').Replace('\r', ' ').Replace('\n', ' ').Split(' ');
                bool IsAll = false;
                List<dynamic> FirstData = new List<dynamic>();
                for (int i = 0; i < SplitStr.Length; i++)
                {
                    try
                    {
                        DateTime dt = DateTime.ParseExact(SplitStr[i] + " " + SplitStr[i + 1], "dd.MM.yyyy HH:mm", null);

                        if (IsAll == true)
                        {
                            Data.Add(FirstData);
                            FirstData = new List<dynamic>();
                            IsAll = false;
                        }
                        FirstData.Add(dt);
                        IsAll = true;
                    }
                    catch
                    {
                        FirstData.Add(SplitStr[i]);
                    }
                }

            }
            catch (IOException e)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(e.Message);
            }
            SaveData(Data);
        }
        public double[] LatitudeAndLongitudeOfRegion()
        {
            double[] Region = [55.858382, 37.431441];
            return Region;
        }
        public List<dynamic> GetWeatherByDate(DateTime date)
        {
            for (int i = 0; i < Data.Count; i++)
            {
                if (Data[i][0] == date)
                {
                    return Data[i];
                }
            }
            return [];
        }
    }
    public class Region12
    {
        List<List<dynamic>> Data = new List<List<dynamic>>() { };


        public void SaveData(List<List<dynamic>> data, string path = "CashedRegions/Region12.json")
        {
            string directory = Path.GetDirectoryName(path);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            string json = JsonConvert.SerializeObject(data);
            File.WriteAllText(path, json);
        }

        public List<List<dynamic>> LoadData(string path = "CashedRegions/Region12.json")
        {
            if (!File.Exists(path))
            {
                throw new FileNotFoundException($"Файл не найден: {path}");
            }
            string json = File.ReadAllText(path);
            if (json.Length <= 10)
            {
                return null;
            }
            return JsonConvert.DeserializeObject<List<List<dynamic>>>(json);
        }
        public Region12()
        {
            Data = LoadData();
            if (Data != null)
            {
                return;
            }
            Data = new List<List<dynamic>>() { };
            try
            {
                // Open the text file using a stream reader.
                using StreamReader reader = new("Regions/Region12.txt");

                // Read the stream as a string.
                Task<String> text = reader.ReadToEndAsync();
                text.Wait();
                // Write the text to the console.
                string[] SplitStr = text.Result.Replace('\t', ' ').Replace('\r', ' ').Replace('\n', ' ').Split(' ');
                bool IsAll = false;
                List<dynamic> FirstData = new List<dynamic>();
                for (int i = 0; i < SplitStr.Length; i++)
                {
                    try
                    {
                        DateTime dt = DateTime.ParseExact(SplitStr[i] + " " + SplitStr[i + 1], "dd.MM.yyyy HH:mm", null);

                        if (IsAll == true)
                        {
                            Data.Add(FirstData);
                            FirstData = new List<dynamic>();
                            IsAll = false;
                        }
                        FirstData.Add(dt);
                        IsAll = true;
                    }
                    catch
                    {
                        FirstData.Add(SplitStr[i]);
                    }
                }

            }
            catch (IOException e)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(e.Message);
            }
            SaveData(Data);
        }
        public double[] LatitudeAndLongitudeOfRegion()
        {
            double[] Region = [55.933302, 37.514230];
            return Region;
        }
        public List<dynamic> GetWeatherByDate(DateTime date)
        {
            for (int i = 0; i < Data.Count; i++)
            {
                if (Data[i][0] == date)
                {
                    return Data[i];
                }
            }
            return [];
        }
    }

}

using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = null;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

var app = builder.Build();

string[][] StoreTypes = new string[][] {
    new string[] {"ÎÁÐÓ×ÅÂÀ 11", "Ñïàëüíèê"},
    new string[] {"ÁÅËÎÌÎÐÑÊÀß 26 ÊÎÐÏ 2", "Ñïàëüíèê"},
    new string[] {"ÐÅÓÒÎÂ ËÅÍÈÍÀ 15", "Ñïàëüíèê"},
    new string[] {"ÍÈÆÍßß ÊÐÀÑÍÎÑÅËÜÑÊÀß 45/17", "Ñìåøàííûé"},
    new string[] {"ÁÀÓÌÀÍÑÊÀß 33/2 ÑÒÐ 8", "Îôèñ"},
    new string[] {"ÍÎÂÎÊÓÇÍÅÖÊÀß 43/16", "Ñìåøàííûé"},
    new string[] {"ÊÐÀÑÍÎÃÎÐÑÊ, ÏÎÄÌÎÑÊÎÂÍÛÉ Á-Ð, 8", "Ñïàëüíèê"},
    new string[] {"ÏÐÎÈÇÂÎÄÑÒÂÅÍÍÀß 8 ÊÎÐÏ 2", "Ñïàëüíèê"},
    new string[] {"ÂÎËÃÎÃÐÀÄÑÊÈÉ ÏÐ-ÊÒ 98 ÊÎÐÏ 2", "Ñïàëüíèê"},
    new string[] {"ÊÐÀÑÍÎÃÎÐÑÊ ÇÍÀÌÅÍÑÊÀß îêîëî ä.12", "Ñïàëüíèê"},
    new string[] {"ÆÓÐÀÂËÅÂÀ 2 ÑÒÐ 2", "Îôèñ"},
    new string[] {"ÍÎÂÎÏÅÒÐÎÂÑÊÀß 16", "Ñïàëüíèê"},
    new string[] {"ÁÀÆÎÂÀ 8", "Ñïàëüíèê"},
    new string[] {"ÁÀÃÐÈÖÊÎÃÎ 3 ÊÎÐÏ 1", "Ñïàëüíèê"},
    new string[] {"ÊÐÀÑÍÎÃÎÐÑÊ, ÎÏÀËÈÕÀ, ÍÎÂÎ-ÍÈÊÎËÜÑÊÀß", "Ñïàëüíèê"},
    new string[] {"ÂÅÐÕÍßß ÊÐÀÑÍÎÑÅËÜÑÊÀß 10", "Ñìåøàííûé"},
    new string[] {"ÎËÈÌÏÈÉÑÊÀß ÄÅÐÅÂÍß 4 ÊÎÐÏ 3", "Ñïàëüíèê"},
    new string[] {"ËÅÑÒÅÂÀ 21/61 ÊÎÐÏ 1", "Ñìåøàííûé"},
    new string[] {"ÐÎÆÄÅÑÒÂÅÍÊÀ 5/7 ÑÒÐ 2", "Ñìåøàííûé"},
    new string[] {"ËÎÌÎÍÎÑÎÂÑÊÈÉ ÏÐÎÑÏÅÊÒ 23", "Ñìåøàííûé"},
    new string[] {"ÎÊÒßÁÐÜÑÊÀß 9/1", "Ñìåøàííûé"},
    new string[] {"ÁÀÊÓÍÈÍÑÊÀß 8", "Ñìåøàííûé"},
    new string[] {"ËÞÁÅÐÖÛ, ÁÀÐÛÊÈÍÀ 2", "Ñïàëüíèê"},
    new string[] {"ÑÐÅÒÅÍÊÀ 21/28 ÑÒÐ 1", "Ñìåøàííûé"},
    new string[] {"ÎÒÊÐÛÒÎÅ ØÎÑÑÅ 3 ñòð 4À", "Ñïàëüíèê"},
    new string[] {"ËÀÇÎÐÅÂÛÉ ÏÐÎÅÇÄ 1À ÊÎÐÏ 3", "Ñïàëüíèê"},
    new string[] {"ÈÑÒÐÀ ËÅÍÈÍÀ 17", "Ñïàëüíèê"},
    new string[] {"ÍÀÕÀÁÈÍÎ ØÊÎËÜÍÀß 8À", "Ñïàëüíèê"},
    new string[] {"ÁÎËÜØÀß ÑÅÐÏÓÕÎÂÑÊÀß 19/37 ÑÒÐ2", "Ñìåøàííûé"},
    new string[] {"ÏÐÎÔÑÎÞÇÍÀß 15", "Ñìåøàííûé"},
    new string[] {"ÂÎÐÎÍÖÎÂÑÊÀß 48", "Ñìåøàííûé"},
    new string[] {"ÏÐÎÑÏÅÊÒ ÌÈÐÀ 95", "Ñìåøàííûé"},
    new string[] {"ÁÎËÜØÀß ×ÅÐÊÈÇÎÂÑÊÀß 6", "Ñïàëüíèê"},
    new string[] {"ÆÓÊÎÂÑÊÈÉ ×ÊÀËÎÂÀ 28À", "Ñïàëüíèê"},
    new string[] {"ÈÍÈÖÈÀÒÈÂÍÀß", "Ðûíîê"},
    new string[] {"ÑÂÎÁÎÄÍÛÉ ÏÐÎÑÏÅÊÒ", "Ñïàëüíèê"},
    new string[] {"ÌÎÑÊÂÀ ÑÈÒÈ", "Îôèñ"},
    new string[] {"ÍÎÂÈÍÊÈ", "Ñïàëüíèê"},
    new string[] {"ÊÓÑÒÀÍÀÉÑÊÀß", "Ñïàëüíèê"},
    new string[] {"ËÅÍÈÍÃÐÀÄÑÊÈÉ 62", "Îôèñ"},
    new string[] {"ßÍÀ ÐÀÉÍÈÑÀ", "Ñïàëüíèê"},
    new string[] {"ÊÐÀÑÍÎÃÎÐÑÊ", "Ñïàëüíèê"},
    new string[] {"Äîëãîïðóäíûé2", "Ñïàëüíèê"},
    new string[] {"ÐÈÆÑÊÈÉ ÏÐÎÅÇÄ", "Ñïàëüíèê"},
    new string[] {"ÁÈÐÞÇÎÂÀ  19", "Ñïàëüíèê"},
    new string[] {"×ÎÍÃÀÐÑÊÈÉ Á-Ð", "Ñïàëüíèê"},
    new string[] {"ÀÝÐÎÏÎÐÒ2", "Ñïàëüíèê"},
    new string[] {"ÍÈÆÍÈÉ ÑÓÑÀËÜÍÛÉ ÌÎËÎÊÎ", "Îôèñ"},
    new string[] {"ØÌÈÒÎÂÑÊÈÉ ÏÐÎÅÇÄ 10/7", "Ñìåøàííûé"},
    new string[] {"9 ÏÀÐÊÎÂÀß 59", "Ñïàëüíèê"},
    new string[] {"ÏÐ-ÊÒ ÂÅÐÍÀÄÑÊÎÃÎ 39", "Ñìåøàííûé"},
    new string[] {"ÑÎÂÕÎÇÍÀß 12", "Ñïàëüíèê"},
    new string[] {"ÀÐÁÀÒ 18", "Ñìåøàííûé"},
    new string[] {"ÊÎÌÑÎÌÎËÜÑÊÈÉ ÏÐÎÑÏÅÊÒ", "Ñìåøàííûé"},
    new string[] {"ÒÓÕÀ×ÅÂÑÊÎÃÎ", "Ñïàëüíèê"},
    new string[] {"ÁÎËÜØÀß ÄÌÈÒÐÎÂÊÀ", "Ñìåøàííûé"},
    new string[] {"ÍÎÂÎÃÈÐÅÅÂÎ 2", "Ñïàëüíèê"},
    new string[] {"ÔÀÊÅËÜÍÛÉ", "Ñìåøàííûé"},
    new string[] {"ÁÎËÜØÀß ÄÌÈÒÐÎÂÊÀ-ÀËÊÎÃÎËÜ", "Îôèñ"},
    new string[] {"ÂÅØÍßÊÎÂÑÊÀß", "Ñïàëüíèê"},
    new string[] {"ËÎÌÎÍÎÑÎÂÑÊÈÉ", "Ñìåøàííûé"},
    new string[] {"ÞÆÍÎÁÓÒÎÂÑÊÀß", "Ñïàëüíèê"},
    new string[] {"ÌÀÐÜÈÍÎ", "Ñïàëüíèê"},
    new string[] {"Èçìàéëîâî", "Ðûíîê"},
    new string[] {"ÆÅËÅÇÍÎÄÎÐÎÆÍÛÉ", "Ñïàëüíèê"},
    new string[] {"ÁÐÀÒÈÑËÀÂÑÊÀß", "Ñïàëüíèê"},
    new string[] {"ÌÎÆÀÉÊÀ", "Ñïàëüíèê"},
    new string[] {"ÌÈÍÑÊÀß 14", "Ñïàëüíèê"},
    new string[] {"ÑÎÊÎË3 Ëåíèíãðàäñêèé ïð-êò,75Ã,1", "Ñïàëüíèê"},
    new string[] {"ËÓÁßÍÊÀ", "Îôèñ"},
    new string[] {"ËÅÍÈÍÑÊÈÉ", "Ñìåøàííûé"},
    new string[] {"Äîìîäåäîâñêàÿ", "Ðûíîê"},
    new string[] {"ÏÅÐÂÎÌÀÉÑÊÀß", "Ñïàëüíèê"},
    new string[] {"ÏÅÐÎÂÎ", "Ñïàëüíèê"},
    new string[] {"Àêàäåìè÷åñêàÿ", "Ñìåøàííûé"},
    new string[] {"ÊÐÀÑÍÎÃÎÐÑÊ 2 ÌÔ", "Ñïàëüíèê"},
    new string[] {"ÍÀÃÎÐÍÛÉ ÁÓËÜÂÀÐ", "Ñïàëüíèê"},
    new string[] {"ÀÂÈÀÖÈÎÍÍÀß 77", "Ñìåøàííûé"},
    new string[] {"ËÅÍÈÍÑÊÈÉ ÏÐÎÑÏÅÊÒ 131", "Ñïàëüíèê"},
    new string[] {"ÏÐÎÔÑÎÞÇÍÀß 104", "Ñïàëüíèê"},
    new string[] {"ÎÑÅÍÍÈÉ Á-Ð", "Ñïàëüíèê"},
    new string[] {"ÐÎÃÎÆÊÀ", "Ðûíîê"},
    new string[] {"KÐÀÑÍÎÃÎÐÑÊ 2", "Ñïàëüíèê"},
    new string[] {"ÁÅÑÊÓÄÍÈÊÎÂÎ", "Ñïàëüíèê"},
    new string[] {"ÐÅÓÒÎÂ ÞÁÈËÅÉÍÛÉ", "Ñïàëüíèê"},
    new string[] {"ÁÐÀÒÑÊÀß ÌÎËÎÊÎ", "Ñïàëüíèê"},
    new string[] {"ÏÐÎÑÏÅÊÒ ÌÈÐÀ 116", "Ñìåøàííûé"},
    new string[] {"Á. ×ÅÐÊÈÇÎÂÑÊÀß", "Ñïàëüíèê"},
    new string[] {"ÍÅÃËÈÍÍÀß", "Ñìåøàííûé"},
    new string[] {"ÁÐÀÒÈÑËÀÂÑÊÀß 6", "Ñìåøàííûé"},
    new string[] {"ÊÐÀÑÍÎÃÎÐÑÊ, ÍÀÕÀÁÈÍÎ, ÈÍÑÒÈÒÓÒÑÊÀß 26", "Ñìåøàííûé"},
    new string[] {"ÏËÀÍÅÐÍÀß", "Ñïàëüíèê"},
    new string[] {"ÌÛÒÍÀß 52", "Ñìåøàííûé"},
    new string[] {"ÏÐÎÔÑÎÞÇÍÀß", "Îôèñ"},
    new string[] {"ÌÀÑÒÅÐÊÎÂÀ", "Ñìåøàííûé"},
    new string[] {"ÇÅÌËßÍÎÉ ÂÀË", "Ñìåøàííûé"},
    new string[] {"ØÎÑÑÅ ÝÍÒÓÇÈÀÑÒÎÂ", "Ñìåøàííûé"},
    new string[] {"ÊÓÇÜÌÈÍÊÈ", "Ñïàëüíèê"},
    new string[] {"ÇÅËÅÍÛÉ ÏÐ-ÊÒ 54 ÌÎËÎÊÎ", "Ñïàëüíèê"},
    new string[] {"ÑÎÊÎË2", "Ñìåøàííûé"},
    new string[] {"ËÅÑÍÀß 8", "Ñìåøàííûé"}
};

app.MapPost("/get-store-type", async (HttpContext context) =>
{
    var req = await context.Request.ReadFromJsonAsync<AddressRequest>();
    if (req == null || string.IsNullOrWhiteSpace(req.Address))
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { error = "Missing or empty 'Address' field." });
        return;
    }

    string input = req.Address.Trim().ToUpperInvariant();
    string? storeType = StoreTypes
        .FirstOrDefault(entry => input.Contains(entry[0].ToUpperInvariant()))
        ?.ElementAt(1);

    await context.Response.WriteAsJsonAsync(new
    {
        storeType = storeType
    });
});

app.Run("http://localhost:5222");

record AddressRequest(string Address);

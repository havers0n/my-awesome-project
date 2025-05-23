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
    new string[] {"�������� 11", "��������"},
    new string[] {"����������� 26 ���� 2", "��������"},
    new string[] {"������ ������ 15", "��������"},
    new string[] {"������ �������������� 45/17", "���������"},
    new string[] {"���������� 33/2 ��� 8", "����"},
    new string[] {"������������� 43/16", "���������"},
    new string[] {"�����������, ������������ �-�, 8", "��������"},
    new string[] {"���������������� 8 ���� 2", "��������"},
    new string[] {"������������� ��-�� 98 ���� 2", "��������"},
    new string[] {"����������� ���������� ����� �.12", "��������"},
    new string[] {"��������� 2 ��� 2", "����"},
    new string[] {"�������������� 16", "��������"},
    new string[] {"������ 8", "��������"},
    new string[] {"���������� 3 ���� 1", "��������"},
    new string[] {"�����������, �������, ����-����������", "��������"},
    new string[] {"������� �������������� 10", "���������"},
    new string[] {"����������� ������� 4 ���� 3", "��������"},
    new string[] {"������� 21/61 ���� 1", "���������"},
    new string[] {"������������ 5/7 ��� 2", "���������"},
    new string[] {"������������� �������� 23", "���������"},
    new string[] {"����������� 9/1", "���������"},
    new string[] {"����������� 8", "���������"},
    new string[] {"�������, �������� 2", "��������"},
    new string[] {"�������� 21/28 ��� 1", "���������"},
    new string[] {"�������� ����� 3 ��� 4�", "��������"},
    new string[] {"��������� ������ 1� ���� 3", "��������"},
    new string[] {"����� ������ 17", "��������"},
    new string[] {"�������� �������� 8�", "��������"},
    new string[] {"������� ������������ 19/37 ���2", "���������"},
    new string[] {"����������� 15", "���������"},
    new string[] {"������������ 48", "���������"},
    new string[] {"�������� ���� 95", "���������"},
    new string[] {"������� ������������ 6", "��������"},
    new string[] {"��������� ������� 28�", "��������"},
    new string[] {"������������", "�����"},
    new string[] {"��������� ��������", "��������"},
    new string[] {"������ ����", "����"},
    new string[] {"�������", "��������"},
    new string[] {"������������", "��������"},
    new string[] {"������������� 62", "����"},
    new string[] {"��� �������", "��������"},
    new string[] {"�����������", "��������"},
    new string[] {"������������2", "��������"},
    new string[] {"������� ������", "��������"},
    new string[] {"��������  19", "��������"},
    new string[] {"���������� �-�", "��������"},
    new string[] {"��������2", "��������"},
    new string[] {"������ ��������� ������", "����"},
    new string[] {"���������� ������ 10/7", "���������"},
    new string[] {"9 �������� 59", "��������"},
    new string[] {"��-�� ����������� 39", "���������"},
    new string[] {"��������� 12", "��������"},
    new string[] {"����� 18", "���������"},
    new string[] {"������������� ��������", "���������"},
    new string[] {"������������", "��������"},
    new string[] {"������� ���������", "���������"},
    new string[] {"����������� 2", "��������"},
    new string[] {"���������", "���������"},
    new string[] {"������� ���������-��������", "����"},
    new string[] {"������������", "��������"},
    new string[] {"�������������", "���������"},
    new string[] {"�������������", "��������"},
    new string[] {"�������", "��������"},
    new string[] {"���������", "�����"},
    new string[] {"���������������", "��������"},
    new string[] {"�������������", "��������"},
    new string[] {"�������", "��������"},
    new string[] {"������� 14", "��������"},
    new string[] {"�����3 ������������� ��-��,75�,1", "��������"},
    new string[] {"�������", "����"},
    new string[] {"���������", "���������"},
    new string[] {"�������������", "�����"},
    new string[] {"������������", "��������"},
    new string[] {"������", "��������"},
    new string[] {"�������������", "���������"},
    new string[] {"����������� 2 ��", "��������"},
    new string[] {"�������� �������", "��������"},
    new string[] {"����������� 77", "���������"},
    new string[] {"��������� �������� 131", "��������"},
    new string[] {"����������� 104", "��������"},
    new string[] {"������� �-�", "��������"},
    new string[] {"�������", "�����"},
    new string[] {"K���������� 2", "��������"},
    new string[] {"������������", "��������"},
    new string[] {"������ ���������", "��������"},
    new string[] {"�������� ������", "��������"},
    new string[] {"�������� ���� 116", "���������"},
    new string[] {"�. ������������", "��������"},
    new string[] {"���������", "���������"},
    new string[] {"������������� 6", "���������"},
    new string[] {"�����������, ��������, ������������ 26", "���������"},
    new string[] {"���������", "��������"},
    new string[] {"������ 52", "���������"},
    new string[] {"�����������", "����"},
    new string[] {"����������", "���������"},
    new string[] {"�������� ���", "���������"},
    new string[] {"����� �����������", "���������"},
    new string[] {"���������", "��������"},
    new string[] {"������� ��-�� 54 ������", "��������"},
    new string[] {"�����2", "���������"},
    new string[] {"������ 8", "���������"}
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

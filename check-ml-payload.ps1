param([string]$payloadPath = ".\ml_payload.json")

$json = Get-Content $payloadPath -Raw | ConvertFrom-Json
if ($json.Count -lt 2) {
    Write-Host "❌ В payload после DaysCount должно быть хотя бы одна операция!" -ForegroundColor Red
    exit 1
}

$operations = $json | Select-Object -Skip 1

Write-Host "Проверка названий полей..."
$requiredFields = @("Период", "Номенклатура", "Количество", "Код", "ВидНоменклатуры", "Type", "Адрес_точки")
$fieldOk = $true
foreach ($op in $operations) {
    foreach ($field in $requiredFields) {
        if (-not $op.PSObject.Properties.Name.Contains($field)) {
            Write-Host "❌ Нет поля '$field' в операции: $($op | ConvertTo-Json -Compress)" -ForegroundColor Red
            $fieldOk = $false
        }
    }
}
if ($fieldOk) { Write-Host "✅ Все обязательные поля присутствуют." -ForegroundColor Green }

Write-Host "Проверка формата дат..."
$datePattern = '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
$dateOk = $true
foreach ($op in $operations) {
    if (-not ($op.Период -match $datePattern)) {
        Write-Host "❌ Некорректная дата: $($op.Период) в операции: $($op | ConvertTo-Json -Compress)" -ForegroundColor Red
        $dateOk = $false
    }
}
if ($dateOk) { Write-Host "✅ Все даты в формате YYYY-MM-DD." -ForegroundColor Green }

Write-Host "Проверка округления Количество до целого числа..."
$qtyOk = $true
foreach ($op in $operations) {
    if (-not ([int]$op.Количество -eq $op.Количество)) {
        Write-Host "❌ Количество не целое число: $($op.Количество) в операции: $($op | ConvertTo-Json -Compress)" -ForegroundColor Red
        $qtyOk = $false
    }
}
if ($qtyOk) { Write-Host "✅ Все значения Количество целые числа." -ForegroundColor Green }

Write-Host "Проверка поля Цена только для операций Поставка..."
$priceOk = $true
foreach ($op in $operations) {
    $hasPrice = $op.PSObject.Properties.Name -contains "Цена"
    if ($op.Type -eq "Поставка") {
        if (-not $hasPrice) {
            Write-Host "❌ Нет поля 'Цена' для поставки: $($op | ConvertTo-Json -Compress)" -ForegroundColor Red
            $priceOk = $false
        }
    } else {
        if ($hasPrice) {
            Write-Host "❌ Лишнее поле 'Цена' для операции $($op.Type): $($op | ConvertTo-Json -Compress)" -ForegroundColor Red
            $priceOk = $false
        }
    }
}
if ($priceOk) { Write-Host "✅ Поле Цена присутствует только у Поставок." -ForegroundColor Green }

Write-Host "\n==== Итог ===="
if ($fieldOk -and $dateOk -and $qtyOk -and $priceOk) {
    Write-Host "\n🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "\n⚠️  Есть ошибки валидации payload!" -ForegroundColor Yellow
    exit 2
}


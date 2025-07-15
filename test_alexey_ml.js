const axios = require('axios');

const ML_SERVICE_URL = 'https://158.160.190.103:8002/predict';

// Тестовые данные в формате, который ожидает ML сервис Алексея
const testData = {
  "DaysCount": 30,
  "events": [
    {
      "Type": "Продажа",
      "Период": "2025-07-15T00:00:00",
      "Номенклатура": "Молоко \"Домик в деревне\" 1л",
      "Код": "123456"
    }
  ]
};

async function testMLService() {
  console.log('🔍 Тестирование ML сервиса Алексея...');
  console.log('URL:', ML_SERVICE_URL);
  console.log('Данные для отправки:', JSON.stringify(testData, null, 2));

  try {
    const response = await axios.post(ML_SERVICE_URL, testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 секунд таймаут
    });

    console.log('✅ Успешно! Ответ от ML сервиса:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при обращении к ML сервису:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Нет ответа от сервера. Проверьте:');
      console.error('- Доступность сервиса по адресу:', ML_SERVICE_URL);
      console.error('- Соединение с интернетом');
      console.error('- Настройки брандмауэра');
    } else {
      console.error('Другая ошибка:', error.message);
    }
    
    return false;
  }
}

// Тестирование health endpoint
async function testHealthEndpoint() {
  const healthUrl = ML_SERVICE_URL.replace('/predict', '/health');
  console.log('\n🔍 Тестирование health endpoint...');
  console.log('URL:', healthUrl);
  
  try {
    const response = await axios.get(healthUrl, {
      timeout: 5000
    });
    
    console.log('✅ Health check успешен:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Health check failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Нет ответа от health endpoint');
    }
    
    return false;
  }
}

// Запуск тестов
async function runTests() {
  console.log('🚀 Начинаем тестирование ML сервиса Алексея...\n');
  
  const healthOk = await testHealthEndpoint();
  const predictOk = await testMLService();
  
  console.log('\n📋 Результаты тестирования:');
  console.log('Health endpoint:', healthOk ? '✅ Работает' : '❌ Не работает');
  console.log('Predict endpoint:', predictOk ? '✅ Работает' : '❌ Не работает');
  
  if (healthOk && predictOk) {
    console.log('\n🎉 Все тесты пройдены! ML сервис Алексея работает корректно.');
  } else {
    console.log('\n⚠️  Есть проблемы с ML сервисом. Проверьте настройки.');
  }
}

runTests(); 
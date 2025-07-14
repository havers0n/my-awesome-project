const PgBoss = require('pg-boss');

const boss = new PgBoss({
  connectionString: process.env.DATABASE_URL, // Убедитесь, что переменная окружения настроена
  // schema: 'public', // если нужно явно указать схему
});

module.exports = boss; 
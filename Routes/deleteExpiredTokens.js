const pool = require('../dbconfig');

async function deleteExpiredTokens() {
  const client = await pool.connect();
  try {
    // Удаление устаревших токенов
    await client.query('DELETE FROM Токены WHERE Истекает < NOW()');
    console.log('Устаревшие токены успешно удалены.');
  } catch (error) {
    console.error('Ошибка при удалении устаревших токенов:', error);
  } finally {
    client.release();
  }
}
module.exports = deleteExpiredTokens;



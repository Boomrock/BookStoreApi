const pool = require('../dbconfig'); // Убедитесь, что путь к вашему пулу базы данных указан правильно

async function authenticateToken(req, res, next) {
    const token = req.cookies['token'];
    console.debug(token);
    if (!token) {
        console.debug('Токен отсутствует' );
        return res.status(401).json({ error: 'Токен отсутствует' });
    }

    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT * FROM Токены WHERE Токен = $1 AND Истекает > NOW()',
            [token]
        );
        const storedToken = result.rows[0];

        if (!storedToken) {
            console.debug('Недействительный токен' );
            return res.status(401).json({ error: 'Недействительный токен' });
        }

        client.release();
        
        next();
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        res.status(401).json({ error: 'Недействительный токен' });
    }
}

module.exports = authenticateToken;

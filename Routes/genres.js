const express = require('express');
const router = express.Router();
const pool = require('../dbconfig');
const authenticateToken = require('./authenticateToken');

// Получение всех жанров
router.get('/', authenticateToken, async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT Название FROM "Жанр"');
        client.release();
       // Используем метод map для получения массива названий жанров
       const genres = result.rows.map(row => row.Название);
        console.debug('книги отправлены')
       res.json(genres);

    } catch (err) {
        res.status(500).send('Error ' + err.message);
    }
});

// Получение книг по жанру
router.get('/:genreId/books', async (req, res) => {
    const { genreId } = req.params;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM "Книга" WHERE "ЖанрID" = $1', [genreId]);
        client.release();
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;

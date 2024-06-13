const express = require('express');
const router = express.Router();
const pool = require('../dbconfig');

// Получение всех полок с их местоположением и жанрами
router.get('/shelves', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM "Полка"');
        client.release();
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Получение всех книг на конкретной полке
router.get('/shelves/:shelfId/books', async (req, res) => {
    const { shelfId } = req.params;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT k.*, knp."Количество" FROM "КнигиНаПолке" knp JOIN "Книга" k ON knp."КнигаID" = k."КнигаID" WHERE knp."ПолкаID" = $1', [shelfId]);
        client.release();
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;

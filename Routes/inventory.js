const express = require('express');
const router = express.Router();
const pool = require('../dbconfig');
const authenticateToken = require('./authenticateToken');

// Получение всех поставок
router.get('/deliveries', authenticateToken, async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM "Поставка"');
        client.release();
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Получение деталей конкретной поставки
router.get('/deliveries/:deliveryId/details', authenticateToken, async (req, res) => {
    const { deliveryId } = req.params;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM "ДеталиПоставки" WHERE "ПоставкаID" = $1', [deliveryId]);
        client.release();
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Получение всех чеков
router.get('/sales', authenticateToken, async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM "Чек"');
        client.release();
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Получение деталей конкретного чека
router.get('/sales/:checkId/details', authenticateToken, async (req, res) => {
    const { checkId } = req.params;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM "ДеталиЧека" WHERE "ЧекID" = $1', [checkId]);
        client.release();
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;

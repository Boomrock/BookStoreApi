const express = require('express');
const router = express.Router();
const pool = require('../dbconfig');
const authenticateToken = require('./authenticateToken');

// Поиск книг
router.get('/search', async (req, res) => {
    const { title, author, genre } = req.query;
    let query = `SELECT k.*, a."Имя", a."Фамилия", a."Отчество", j."Название" AS "Жанр"
                 FROM "Книга" k
                 LEFT JOIN "АвторКниги" ak ON k."КнигаID" = ak."КнигаID"
                 LEFT JOIN "Автор" a ON ak."АвторID" = a."АвторID"
                 LEFT JOIN "Жанр" j ON k."ЖанрID" = j."ЖанрID"
                 WHERE 1=1`;

    if (title) {
        query += ` AND k."Название" ILIKE '%${title}%'`;
    }
    if (author) {
        query += ` AND (a."Имя" ILIKE '%${author}%' OR a."Фамилия" ILIKE '%${author}%')`;
    }
    if (genre) {
        query += ` AND j."Название" ILIKE '%${genre}%'`;
    }

    try {
        const client = await pool.connect();
        const result = await client.query(query);
        client.release();
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// добавление автора
router.post('/', authenticateToken, async (req, res) => {
    const { firstName, lastName, middleName } = req.body;

    try {
        const client = await pool.connect();
        const result = await client.query('INSERT INTO "Автор" ("Имя", "Фамилия", "Отчество") VALUES ($1, $2, $3) RETURNING "АвторID"', [firstName, lastName, middleName]);
        client.release();
        
        const authorId = result.rows[0].АвторID;
        res.status(201).json({ authorId, message: 'Автор успешно добавлен' });
    } catch (err) {
        console.error('Ошибка при добавлении автора', err);
        res.status(500).send('Ошибка при добавлении автора');
    }
});


// Добавление книги
router.post('/', authenticateToken, async (req, res) => {
    const { ISBN, title, description, price, genreId, authors } = req.body;

    try {
        const client = await pool.connect();
        await client.query('BEGIN');

        // Вставка книги
        const insertBookQuery = 'INSERT INTO "Книга" ("ISBN", "Название", "Описание", "Цена", "ЖанрID") VALUES ($1, $2, $3, $4, $5) RETURNING "КнигаID"';
        const bookResult = await client.query(insertBookQuery, [ISBN, title, description, price, genreId]);
        const bookId = bookResult.rows[0].КнигаID;

        // Вставка связей с авторами
        for (const authorId of authors) {
            const insertAuthorBookQuery = 'INSERT INTO "АвторКниги" ("КнигаID", "АвторID") VALUES ($1, $2)';
            await client.query(insertAuthorBookQuery, [bookId, authorId]);
        }

        await client.query('COMMIT');
        client.release();
        
        res.status(201).send('Книга успешно добавлена');
    } catch (err) {
        console.error('Ошибка при добавлении книги', err);
        await client.query('ROLLBACK');
        client.release();
        res.status(500).send('Ошибка при добавлении книги');
    }
});

module.exports = router;

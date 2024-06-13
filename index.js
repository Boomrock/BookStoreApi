const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const CronJob = require('cron').CronJob;
const cookieParser = require('cookie-parser');
const deleteExpiredTokens = require('./Routes/deleteExpiredTokens');

const app = express();
const port = 3030;

const allowedOrigins = ['http://192.168.0.102:3000', 'http://localhost:3000', 'http://85.143.66.48:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Чтобы разрешить передачу cookies
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());


// Подключаем роуты
const booksRouter = require('./Routes/books');
const authRouter = require('./Routes/auth');
const genresRouter = require('./Routes/genres');
const navigationRouter = require('./Routes/navigation');
const inventoryRouter = require('./Routes/inventory');

app.use('/api/books', booksRouter);
app.use('/api/auth', authRouter);
app.use('/api/genres', genresRouter);
app.use('/api/navigation', navigationRouter);
app.use('/api/inventory', inventoryRouter);

// Создание задачи cron для удаления устаревших токенов каждые 30 минут
const job = new CronJob('0 */15 * * * *', deleteExpiredTokens);
job.start();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

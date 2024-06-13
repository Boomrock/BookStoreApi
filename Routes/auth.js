const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../dbconfig');
const express = require('express');
const router = express.Router();

function containsSpecialChars(str) {
    // Паттерн для поиска специальных символов
    const specialCharsPattern = '/[!@#$%^&*()_+\-=[\]{};\':"\\|,.<>/?]/';
  

    // Преобразуем строку charactersToCheck в массив символов для удобства проверки
    const charactersArray = specialCharsPattern.split('');

    // Перебираем каждый символ из массива и проверяем его наличие в строке
    const containsAllCharacters = charactersArray.every(char => str.includes(char));
    // Проверяем, содержит ли строка хотя бы один специальный символ
    return containsAllCharacters;
  };
// Метод для создания токена и сохранения его в базе данных
async function createToken(userId) {
    try {
      const client = await pool.connect();
      const expiresAt = new Date(Date.now() + 3600000); // Токен истекает через 1 час
      const token = jwt.sign({ userId }, '123124124');
      await client.query(
        'INSERT INTO Токены (ПользовательID, Токен, Истекает) VALUES ($1, $2, $3)',
        [userId, token, expiresAt]
      );

      client.release();
      return token;
    } catch (error) {
      console.error('Ошибка при создании токена:', error);
      throw new Error('Ошибка при создании токена');
    }
  }
 
  router.get('/hash/:password', async (req, res) => {
    const {password} = req.params;
    const result =  await bcrypt.hash(password, 10);
    
    return res.json(result);

  });
  router.get('/checkToken', async (req, res) => {
    console.debug(req);
    const token = req.cookies['token'];
    if (!token) {
        console.debug('Токена нет в печеньках ');
        return res.json(false);
    }

    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT * FROM Токены WHERE Токен = $1 AND Истекает > NOW()',
            [token]
        );
        const storedToken = result.rows[0];
        
        if (!storedToken) {
            console.debug('Токен не найден');
            return res.json(false);

        }

        client.release();
        console.debug('токен подтвержден');
        return res.json(true);
        
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        res.status(401).json({ error: 'Недействительный токен' });
    }
  });
  // Метод для авторизации пользователя
  router.post('/login', async (req, res) => {
    const { login, password } = req.body;
    console.log(login)
    console.log(password)
    try {
        if(containsSpecialChars(login) || containsSpecialChars(password)){
            console.debug("12321412")

            res.status(401).json({ error: 'Неверный пароль или логин'});
            return;
        }
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM public."Пользователь" WHERE "Логин" = $1', [login]);
        const user = result.rows[0];

        if (!user) {
            console.debug("don't contains user")
            res.status(401).json({ error: 'Неверный пароль или логин' });
            return;
        }

        // Проверка хэша пароля
        const isPasswordValid = await bcrypt.compare(password, user.ХэшПароля);
        if (!isPasswordValid) {
            console.debug("unvalid password");
            res.status(401).json({ error: 'Неверный пароль или логин'  });
            return;
        }

        // Создание и сохранение токена
        const token = await createToken(user.Пользовательid);
        res.status(200).json({ message: 'Успешная авторизация', token });

        client.release();
    } catch (err) {
        console.error('Ошибка при выполнении запроса:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

  // Метод для регистрации пользователя
  router.post('/register', async (req, res) => {
    const { login, password, role, сотрудникId } = req.body;
  
    try {
        if(containsSpecialChars(login) || containsSpecialChars(password) || containsSpecialChars(role) || containsSpecialChars(сотрудникId) ){
            res.status(401).json({ error: 'Не подходящие поля'});
            return;
        }
      const client = await pool.connect();
  
      // Проверка, существует ли пользователь с таким же логином
      const checkUserResult = await client.query('SELECT * FROM public."Пользователь" WHERE "Логин" = $1', [login]);
      if (checkUserResult.rows.length > 0) {
        res.status(409).json({ error: 'Пользователь с таким логином уже существует' });
        return;
      }
  
      // Хэширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Сохранение пользователя в базу данных
      const result = await client.query(
        'INSERT INTO public."Пользователь" ("Логин", "ХэшПароля", "Роль", "Сотрудникid") VALUES ($1, $2, $3, $4) RETURNING "Пользовательid"',
        [login, hashedPassword, role, сотрудникId]
      );
      const userId = result.rows[0].Пользовательid;
  
      // Создание и сохранение токена
      const token = await createToken(userId);
      res.status(201).json({ message: 'Пользователь успешно зарегистрирован', token });
  
      client.release();
    } catch (err) {
      console.error('Ошибка при выполнении запроса:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });
  module.exports = router;
  

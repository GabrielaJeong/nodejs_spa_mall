require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const routes = require('./routes');
const { Sequelize } = require('sequelize');

const app = express();
const port = process.env.PORT || 3000;

// Sequelize 연결 설정
const sequelize = new Sequelize(process.env.DB_URL, { 
    dialect: 'mysql', 
    logging: false, 
    define: {
        timestamps: false 
    } 
});

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

// 미들웨어 설정
app.use(express.json());
app.use(cookieParser());
app.use('/', routes);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ errorMessage: '서버 내부 오류가 발생했습니다.' });
});

// 쿠키 출력 API
app.get("/get-cookie", (req, res) => {
    const cookie = req.cookies;
    console.log(cookie);
    return res.status(200).json({ cookie });
});

app.get("/get-key", (req, res) => {
    const { token } = req.cookies;
    const { key } = jwt.decode(token);
    return res.status(200).json({ key });
});

// 서버 시작
app.listen(port, () => { console.log(`Server listening on port ${port}`) });

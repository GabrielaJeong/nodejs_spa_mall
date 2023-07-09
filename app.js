const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const routes = require('./routes');

const app = express();
const port = 3000; // 포트 번호

// MongoDB 연결 설정
mongoose.connect('mongodb://0.0.0.0:27017/level1', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Successfully connected to mongodb'))
    .catch(e => console.error(e));


// 미들웨어 설정
app.use(express.json());
app.use(cookieParser());
app.use('/', routes);

// 쿠키 출력 API

app.get("/get-cookie", (req, res) => {
    const cookie = req.cookies;
    console.log(cookie); // { name: 'sparta' }
    return res.status(200).json({ cookie });
});

app.get("/get-key", (req, res) => {
    const { token } = req.cookies;
    const { key } = jwt.decode(token);
    return res.status(200).json({ key });
});


// 서버 시작

app.listen(port, () => { console.log(`Server listening on port ${port}`) });

// const { connect, Post, Comment } = require('./schemas');


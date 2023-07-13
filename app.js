require('dotenv').config();

const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');

const routes = require('./routes');

const port = process.env.PORT;

// 미들웨어 설정
app.use(express.json());
app.use(cookieParser());

app.use('/', routes);


// 서버 시작
app.listen(port, () => { console.log(`Server listening on port ${port}`) });

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// express 앱을 초기화
const app = express();

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// MongoDB 연결 설정
mongoose.connect('mongodb://0.0.0.0:27017/level1', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Successfully connected to mongodb'))
    .catch(e => console.error(e));

// 라우터 설정
const postRouter = require('./routes/post.js');
const commentRouter = require('./routes/comment.js');

app.use('/posts', [postRouter]);
app.use('/comments', [commentRouter]);

// 서버 시작
const port = 3000; // 포트 번호
app.listen(port, () => { console.log(`Server listening on port ${port}`) });

// const { connect, Post, Comment } = require('./schemas');


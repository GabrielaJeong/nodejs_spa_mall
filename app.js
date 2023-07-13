require('dotenv').config();

const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const routes = require('./routes');

const port = process.env.PORT;

// Sequelize 연결 설정
const sequelize = new sequelize(process.env.DB_URL, { 
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


// 서버 시작
app.listen(port, () => { console.log(`Server listening on port ${port}`) });

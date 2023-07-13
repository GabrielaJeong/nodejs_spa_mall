require('dotenv').config();

const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const cookieParser = require('cookie-parser');
const swaggerJsdoc = require('swagger-jsdoc');


//Swagger API 문서화

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My API",
            version: "1.0.0",
            description: "A sample API"
        },
    },
    apis: ["./routes/*.js"], // API 경로
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);


const routes = require('./routes');

const port = process.env.PORT;

// 미들웨어 설정
app.use(express.json());
app.use(cookieParser());

app.use('/', routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// 서버 시작
app.listen(port, () => { console.log(`Server listening on port ${port}`) });




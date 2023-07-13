

// 다시 갈아 엎어야함 ..^^ 

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config.json');

const User = sequelize.define('User', {
    // 모델 필드 정의
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    // 테이블 추가 설정
    timestamps: true, // createdAt, updatedAt 필드를 자동추가
    modelName: 'User', // 모델 이름 설정
    tableName: 'users', // 테이블 이름 설정
    paranoid: false, // 삭제 시 삭제된 항목을 별도로 관리하는 필드 추가
    charset: 'utf8', // 문자열 설정
    collate: 'utf8_general_ci', // 문자열 정렬 방식 설정
});

module.exports = User;

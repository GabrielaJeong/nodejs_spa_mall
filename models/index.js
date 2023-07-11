const { Sequelize } = require('sequelize');
const User = require('./User');
const Post = require('./post');
const Comment = require('./comment');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
});

// 모델 연결
User.init(sequelize);
Post.init(sequelize);
Comment.init(sequelize);

// 관계 설정
User.hasMany(Comment, { foreignKey: 'user' });
Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(User, { foreignKey: 'user' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

sequelize.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.log('Error: ' + err))

module.exports = { sequelize, User, Post, Comment }; // 수정됨: 모델도 export

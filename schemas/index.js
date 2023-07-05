const mongoose = require('mongoose');

const connect = () => {
    mongoose
        .connect('mongodb://0.0.0.0:27017/level1')
        .catch(err => console.error(err));
}

mongoose.connection.on("error", err => console.error("몽고DB 연결에러", err));

const Post = require('./post');
const Comment = require('./comment');

module.exports = { connect, Post, Comment };

// end of index (schema)
const express = require('express')

const post = require('./post');
const comment = require('./comment');
const users = require('./users.js');
const auth = require('./auth.js')

const router = express.Router();

router.use("",[post, comment, users, auth])


module.exports = router;

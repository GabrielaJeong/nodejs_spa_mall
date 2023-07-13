const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');


const postRoutes = require('./post.js');
const userRoutes = require('./auth.js');
const authRoutes = require('./auth.js');

router.use(cookieParser());

router.use('/posts', postRoutes);
router.use('/singup', userRoutes);
router.use('/auth', authRoutes);

module.exports = router;

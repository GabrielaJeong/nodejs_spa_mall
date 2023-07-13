const express = require('express');
const router = express.Router();

const postRoutes = require('./post.js');
const userRoutes = require('./signup.js');
const authRoutes = require('./auth.js');

router.use(cookieParser());

router.use('/posts', postRoutes);
router.use('/singup', userRoutes);
router.use('/auth', authRoutes);

module.exports = router;
